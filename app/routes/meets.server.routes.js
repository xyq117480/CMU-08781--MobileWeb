'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var meets = require('../../app/controllers/meets.server.controller');

	// Meets Routes
	app.route('/meets')
		.get(meets.list)
		.post(users.requiresLogin, meets.create);

	app.route('/meets/:meetId')
		.get(meets.read)
		.put(users.requiresLogin, meets.hasAuthorization, meets.update)
		.delete(users.requiresLogin, meets.hasAuthorization, meets.delete);

	app.route('/meetsMisc/joinMeet')
		.get(meets.joinMeet);
	app.route('/meetsMisc/yelpRecommend')
		.get(meets.yelpRecommend);
	app.route('/meetsMisc/getMinutesToDestination')
		.get(meets.getMinutesToDestination);

	// Finish by binding the Meet middleware
	app.param('meetId', meets.meetByID);
};
