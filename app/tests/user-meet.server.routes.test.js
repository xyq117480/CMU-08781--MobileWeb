'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	UserMeet = mongoose.model('UserMeet'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, userMeet;

/**
 * User meet routes tests
 */
describe('User meet CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new User meet
		user.save(function() {
			userMeet = {
				name: 'User meet Name'
			};

			done();
		});
	});

	it('should be able to save User meet instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new User meet
				agent.post('/user-meets')
					.send(userMeet)
					.expect(200)
					.end(function(userMeetSaveErr, userMeetSaveRes) {
						// Handle User meet save error
						if (userMeetSaveErr) done(userMeetSaveErr);

						// Get a list of User meets
						agent.get('/user-meets')
							.end(function(userMeetsGetErr, userMeetsGetRes) {
								// Handle User meet save error
								if (userMeetsGetErr) done(userMeetsGetErr);

								// Get User meets list
								var userMeets = userMeetsGetRes.body;

								// Set assertions
								(userMeets[0].user._id).should.equal(userId);
								(userMeets[0].name).should.match('User meet Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save User meet instance if not logged in', function(done) {
		agent.post('/user-meets')
			.send(userMeet)
			.expect(401)
			.end(function(userMeetSaveErr, userMeetSaveRes) {
				// Call the assertion callback
				done(userMeetSaveErr);
			});
	});

	it('should not be able to save User meet instance if no name is provided', function(done) {
		// Invalidate name field
		userMeet.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new User meet
				agent.post('/user-meets')
					.send(userMeet)
					.expect(400)
					.end(function(userMeetSaveErr, userMeetSaveRes) {
						// Set message assertion
						(userMeetSaveRes.body.message).should.match('Please fill User meet name');
						
						// Handle User meet save error
						done(userMeetSaveErr);
					});
			});
	});

	it('should be able to update User meet instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new User meet
				agent.post('/user-meets')
					.send(userMeet)
					.expect(200)
					.end(function(userMeetSaveErr, userMeetSaveRes) {
						// Handle User meet save error
						if (userMeetSaveErr) done(userMeetSaveErr);

						// Update User meet name
						userMeet.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing User meet
						agent.put('/user-meets/' + userMeetSaveRes.body._id)
							.send(userMeet)
							.expect(200)
							.end(function(userMeetUpdateErr, userMeetUpdateRes) {
								// Handle User meet update error
								if (userMeetUpdateErr) done(userMeetUpdateErr);

								// Set assertions
								(userMeetUpdateRes.body._id).should.equal(userMeetSaveRes.body._id);
								(userMeetUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of User meets if not signed in', function(done) {
		// Create new User meet model instance
		var userMeetObj = new UserMeet(userMeet);

		// Save the User meet
		userMeetObj.save(function() {
			// Request User meets
			request(app).get('/user-meets')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single User meet if not signed in', function(done) {
		// Create new User meet model instance
		var userMeetObj = new UserMeet(userMeet);

		// Save the User meet
		userMeetObj.save(function() {
			request(app).get('/user-meets/' + userMeetObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', userMeet.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete User meet instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new User meet
				agent.post('/user-meets')
					.send(userMeet)
					.expect(200)
					.end(function(userMeetSaveErr, userMeetSaveRes) {
						// Handle User meet save error
						if (userMeetSaveErr) done(userMeetSaveErr);

						// Delete existing User meet
						agent.delete('/user-meets/' + userMeetSaveRes.body._id)
							.send(userMeet)
							.expect(200)
							.end(function(userMeetDeleteErr, userMeetDeleteRes) {
								// Handle User meet error error
								if (userMeetDeleteErr) done(userMeetDeleteErr);

								// Set assertions
								(userMeetDeleteRes.body._id).should.equal(userMeetSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete User meet instance if not signed in', function(done) {
		// Set User meet user 
		userMeet.user = user;

		// Create new User meet model instance
		var userMeetObj = new UserMeet(userMeet);

		// Save the User meet
		userMeetObj.save(function() {
			// Try deleting User meet
			request(app).delete('/user-meets/' + userMeetObj._id)
			.expect(401)
			.end(function(userMeetDeleteErr, userMeetDeleteRes) {
				// Set message assertion
				(userMeetDeleteRes.body.message).should.match('User is not logged in');

				// Handle User meet error error
				done(userMeetDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		UserMeet.remove().exec();
		done();
	});
});