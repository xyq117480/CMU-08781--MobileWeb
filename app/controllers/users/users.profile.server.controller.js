'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	UserMeet = mongoose.model('UserMeet'),
	Meet = mongoose.model('Meet'),
	Place = mongoose.model('Place');

/**
 * External library dependencies
 */
var gm = require('googlemaps');

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};

/**
 * App-specific user exports
 */
exports.list = function(req, res) {
	User.find().sort('displayName').exec(function(err, users) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(users);
		}
	});
};

function updateMinutesToDestination(user, userMeet) {
	if (user && userMeet) {
		if (user.latitude !== 0 && user.longitude !== 0) {
			var originLatLon = user.latitude + ',' + user.longitude;
			Meet.findById(userMeet.meet, function (err, meet) {
				if (err) {
					console.log('Can\'t find meet by ID when updating minutes to destination', errorHandler.getErrorMessage(err));
				} else {

					Place.findById(meet.place, function (err, place) {
						if (err) {
							console.log('Can\'t find place by ID when updating minutes to destination', errorHandler.getErrorMessage(err));
						} else {
							var destLatLon = place.latitude + ',' + place.longitude;
							gm.directions(originLatLon, destLatLon, function (err, data) {
								if (err) {
									console.log(err);
								} else {
									if (data && data.routes[0]) {
										var legs = data.routes[0].legs;
										var seconds = 0;
										for (var i=0; i<legs.length; i++) {
											seconds += legs[i].duration.value;
										}

										userMeet.minutesToDestination = Math.round(seconds / 60);
										userMeet.updated = Date.now();
										userMeet.save(function (err) {
											if (err) {
												console.log('Can\'t update userMeet minutes to destination!');
											}
										});
									}
								}
							}, false);
						}
					});

				}
			});
		}
	}
}

function updateUserMeets(user, res) {
	var oneMinuteAgo = new Date();
	oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
	UserMeet.find({ user: user._id, updated: { $lt: oneMinuteAgo } }).exec(function (err, userMeets) {
		if (err) {
			res.status(404).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			for (var i=0; i < userMeets.length; i++) {
				var userMeet = userMeets[i];
				updateMinutesToDestination(user, userMeets[i]);
			}
		}
	});
}

exports.updateGeolocation = function(req, res) {
	var user = req.user;
	if (user) {
		var latitude = req.query.latitude;
		var longitude = req.query.longitude;
		if (latitude && longitude) {
			user.latitude = latitude;
			user.longitude = longitude;
			user.updated = Date.now();
			user.save(function(err) {
				if (err) {
					res.status(404).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					updateUserMeets(user, res);
					res.sendStatus(200);
				}
			});
		}
	}
};

exports.friends = function(req, res) {
	User.findById(req.user._id).populate('friendList').exec(function(err, user) {
		if (err) {
			res.status(404).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(user.friendList);
		}
	});
};

exports.addFriend = function(req, res) {

	var friendId = req.body.userId;
	if (friendId) {

		var user = req.user;
		if (user._id.equals(friendId)) {
			return res.status(400).send({
				message: 'Can\'t add yourself as a friend!'
			});
		}

		// Look for this friend in the database
		User.findById(friendId).exec(function(err, friend) {

			if (friend === null) {
				res.status(404).send({
					message: 'Requested friend cannot be found!'
				});
			} else {

				// Check if the person is already a friend
				for (var i=0; i<user.friendList.length; i++) {
					if (user.friendList[i].equals(friendId)) {
						return res.status(400).send({
							message: 'This user is already your friend!'
						});
					}
				}

				user.friendList.push(friend);
				// Add friendship
				user.save(function (err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						// Also add user to friend's friendList
						friend.update({ $push: { 'friendList': user }}, function (err, count2) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								// Return new friends array
								User.populate(user, { path: 'friendList', select: 'displayName created -_id' }, function (err, friends) {
									if (err) {
										return res.status(400).send({
											message: 'Result population failed!'
										});
									} else {
										res.jsonp({friends: user.friendList});
									}
								});
							}
						});

						
					}
				});
			}
		});
	} else {
		res.status(404).send({
			message: 'Missing friend ID!'
		});
	}

};