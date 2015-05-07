'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Meet = mongoose.model('Meet'),
	Place = mongoose.model('Place'),
	User = mongoose.model('User'),
	UserMeet = mongoose.model('UserMeet'),
	_ = require('lodash');

/**
 * External library dependencies
 */
var yelp = require('yelp').createClient({
	consumer_key: 'KOKAXsNy6wsekiLZJplwHA', 
	consumer_secret: 'tO8_qbZ14LVX2y7zRJ-yN1ZeBZ8',
	token: 'l7-Ok7K1GLzP_ezsGq-36svklgG9T9M4',
	token_secret: 'aImS8AgC5LkiyS4muGpncvzuO5Q'
}),
	geoip = require('geoip-lite'),
	gm = require('googlemaps');


/**
 * Create a Meet
 */
exports.create = function(req, res) {

	var reqPlace = req.body.place;
	var invite = req.body.invite;

	// Look for an existing place
	if (!reqPlace) {
		return res.status(400).send({
			message: 'Place object is not provided!'
		});
	}

	var places = Place.findOne({yelpId: reqPlace.id}, function(err, place) {
		
		if (place === null) {
			// Create a new place if no old one exists
			place = new Place({yelpId: reqPlace.id, name: reqPlace.name, 
					latitude: reqPlace.location.coordinate.latitude, 
					longitude: reqPlace.location.coordinate.longitude,
					description: reqPlace.snippet_text,
					image_url: reqPlace.image_url,
					rating_img_url: reqPlace.rating_img_url,
					mobile_url: reqPlace.mobile_url });

			place.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
			});
		}

		// Create new meet
		var meet = new Meet({
			isPublic: req.body.isPublic,
			meetTime: req.body.meetTime
		});
		meet.host = req.user;
		meet.place = place;
		meet.invite = [];

		invite.forEach(function (elem, index, arr) {

			var name = elem.trim();

			// TODO: check friendship
			// Check the input and add invitees
			User.findOne({displayName: name}, function(err, user) {
				if (user) {

					meet.invite.push(user);

					// Need to save meet every time because current code
					// is asynchronous
					meet.save(function(err) {				
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							// Use one minute ago so this could get updated immediately
							var oneMinuteAgo = new Date();
							oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
							
							var userMeet = new UserMeet({
								user: user,
								meet: meet,
								updated: oneMinuteAgo
							});
							userMeet.save(function (err) {
								if (err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								}
							});
						}
					});
				}
			});
		});

		meet.save(function(err) {				
			if (err) {
				console.log(err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				// Use one minute ago so this could get updated immediately
				var oneMinuteAgo = new Date();
				oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
				
				var userMeet = new UserMeet({
					user: req.user,
					meet: meet,
					updated: oneMinuteAgo
				});
				userMeet.save(function (err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						res.jsonp(meet);
					}
				});
			}
		});
	});

};

/**
 * Show the current Meet
 */
exports.read = function(req, res) {
	res.jsonp(req.meet);
};

/**
 * Update a Meet
 */
exports.update = function(req, res) {
	var meet = req.meet;

	meet = _.extend(meet , req.body);

	meet.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(meet);
		}
	});
};

/**
 * Delete an Meet
 */
exports.delete = function(req, res) {
	var meet = req.meet ;

	meet.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(meet);
		}
	});
};

/**
 * List of Meets
 */
exports.list = function(req, res) { 

	// TODO: refine population
	if (req.user) {
		Meet.find().or([{ isPublic: 2 }, { $and: [ { isPublic: 1 }, { host: { $in: req.user.friendList } } ] }, { host: req.user._id} ]).sort('-created').populate('host', 'displayName').populate('place', 'name').populate('invite', 'displayName').exec(function(err, meets) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(meets);
			}
		});
	} else {
		Meet.find().where('isPublic', 2).sort('-created').populate('host', 'displayName').populate('place').populate('invite', 'displayName').exec(function(err, meets) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(meets);
			}
		});
	}
};

/**
 * Join a meet
 */
exports.joinMeet = function(req, res) {
	var user = req.user;

	if (user) {
		Meet.findById(req.query.meetId, function(err, meet) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}

			if (user._id.equals(meet.host._id)) {
				return res.status(400).send({
					message: 'You have the host of the meet!'
				});
			}

			for (var i=0; i<meet.invite.length; i++) {
				if (user._id.equals(meet.invite[i]._id)) {
					return res.status(400).send({
						message: 'You have already joined the meet!'
					});
				}
			}

			// Join meet
			meet.invite.push(user);
			meet.save(function (err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}

				// Create user-meet
				// use one minute ago so it can be updated immediately
				var oneMinuteAgo = new Date();
				oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
				
				var userMeet = new UserMeet({
					user: user,
					meet: meet,
					updated: oneMinuteAgo
				});
				userMeet.save(function (err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						res.jsonp(meet);
					}
				});
			});
		});
	} else {
		return res.status(400).send({
			message: 'user or meet is not defined!'
		});
	}
};

/**
 * Get recommendation places from yelp
 */
exports.yelpRecommend = function(req, res) {
	if (req.query.term) {
		if (req.user.latitude !== 0 && req.user.longitude !== 0) {
			var locationStr = req.user.latitude + ',' + req.user.longitude;
			yelp.search({ term: req.query.term, limit: '3', ll: locationStr }, function(err, data) {
				if (err) {
					return res.status(400).send({
						message: 'Yelp search failed!'
					}); 
				} else {
					res.jsonp(data);
				}
			});
		} else {
			// Use IP to determine client's coarse location
			var ip = req.headers['x-forwarded-for'] || 
					req.connection.remoteAddress || 
					req.socket.remoteAddress ||
					req.connection.socket.remoteAddress;

			var geo = geoip.lookup(ip);

			if (geo) {
				yelp.search({ term: req.query.term, limit: '3', cll: geo.ll[0] + ',' + geo.ll[1] }, function(err, data) {
					if (err) {
						return res.status(400).send({
							message: 'Yelp search failed!'
						}); 
					} else {
						res.jsonp(data);
					}
				});
			} else {
				// Location defaults to United States
				yelp.search({ term: req.query.term, limit: '3', location: 'United States' }, function(err, data) {
					if (err) {
						return res.status(400).send({
							message: 'Yelp search failed!'
						}); 
					} else {
						res.jsonp(data);
					}
				});
			}
		}
	} else {
		return res.status(400).send({
			message: 'Term is not given!'
		});
	}
};

exports.getMinutesToDestination = function(req, res) {
	var userId = req.query.userId;
	var meetId = req.query.meetId;

	if (userId && meetId) {
		UserMeet.findOne({ meet: meetId, user: userId }, function(err, userMeet) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
			    if (userMeet)
				res.jsonp({ minutesToDestination: userMeet.minutesToDestination });
			}
		});
	} else {
		return res.status(400).send({
			message: 'userId or meetId is not defined'
		});
	}
};

/**
 * Meet middleware
 */
exports.meetByID = function(req, res, next, id) { 
	// TODO: refine population
	Meet.findById(id).populate('host', 'displayName').populate('place').populate('invite').exec(function(err, meet) {
		if (err) return next(err);
		if (! meet) return next(new Error('Failed to load Meet ' + id));
		req.meet = meet;
		next();
	});
};

/**
 * Meet authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.meet.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

