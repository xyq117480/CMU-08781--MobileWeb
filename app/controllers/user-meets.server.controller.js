'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	UserMeet = mongoose.model('UserMeet'),
	_ = require('lodash');

/**
 * Create a User meet
 */
exports.create = function(req, res) {
	var userMeet = new UserMeet(req.body);
	userMeet.user = req.user;

	userMeet.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(userMeet);
		}
	});
};

/**
 * Show the current User meet
 */
exports.read = function(req, res) {
	res.jsonp(req.userMeet);
};

/**
 * Update a User meet
 */
exports.update = function(req, res) {
	var userMeet = req.userMeet ;

	userMeet = _.extend(userMeet , req.body);

	userMeet.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(userMeet);
		}
	});
};

/**
 * Delete an User meet
 */
exports.delete = function(req, res) {
	var userMeet = req.userMeet ;

	userMeet.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(userMeet);
		}
	});
};

/**
 * List of User meets
 */
exports.list = function(req, res) { 
	UserMeet.find().sort('-created').populate('user', 'displayName').exec(function(err, userMeets) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(userMeets);
		}
	});
};

/**
 * User meet middleware
 */
exports.userMeetByID = function(req, res, next, id) { 
	UserMeet.findById(id).populate('user', 'displayName').exec(function(err, userMeet) {
		if (err) return next(err);
		if (! userMeet) return next(new Error('Failed to load User meet ' + id));
		req.userMeet = userMeet ;
		next();
	});
};

/**
 * User meet authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.userMeet.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
