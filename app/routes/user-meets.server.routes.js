'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var userMeets = require('../../app/controllers/user-meets.server.controller');

	// User meets Routes
	app.route('/user-meets')
		.get(userMeets.list)
		.post(users.requiresLogin, userMeets.create);

	app.route('/user-meets/:userMeetId')
		.get(userMeets.read)
		.put(users.requiresLogin, userMeets.hasAuthorization, userMeets.update)
		.delete(users.requiresLogin, userMeets.hasAuthorization, userMeets.delete);

	// Finish by binding the User meet middleware
	app.param('userMeetId', userMeets.userMeetByID);
};
