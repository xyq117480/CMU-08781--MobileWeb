'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Meet = mongoose.model('Meet'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, meet;

/**
 * Meet routes tests
 */
describe('Meet CRUD tests', function() {
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

		// Save a user to the test db and create new Meet
		user.save(function() {
			meet = {
				name: 'Meet Name'
			};

			done();
		});
	});

	it('should be able to save Meet instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Meet
				agent.post('/meets')
					.send(meet)
					.expect(200)
					.end(function(meetSaveErr, meetSaveRes) {
						// Handle Meet save error
						if (meetSaveErr) done(meetSaveErr);

						// Get a list of Meets
						agent.get('/meets')
							.end(function(meetsGetErr, meetsGetRes) {
								// Handle Meet save error
								if (meetsGetErr) done(meetsGetErr);

								// Get Meets list
								var meets = meetsGetRes.body;

								// Set assertions
								(meets[0].user._id).should.equal(userId);
								(meets[0].name).should.match('Meet Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Meet instance if not logged in', function(done) {
		agent.post('/meets')
			.send(meet)
			.expect(401)
			.end(function(meetSaveErr, meetSaveRes) {
				// Call the assertion callback
				done(meetSaveErr);
			});
	});

	it('should not be able to save Meet instance if no name is provided', function(done) {
		// Invalidate name field
		meet.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Meet
				agent.post('/meets')
					.send(meet)
					.expect(400)
					.end(function(meetSaveErr, meetSaveRes) {
						// Set message assertion
						(meetSaveRes.body.message).should.match('Please fill Meet name');
						
						// Handle Meet save error
						done(meetSaveErr);
					});
			});
	});

	it('should be able to update Meet instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Meet
				agent.post('/meets')
					.send(meet)
					.expect(200)
					.end(function(meetSaveErr, meetSaveRes) {
						// Handle Meet save error
						if (meetSaveErr) done(meetSaveErr);

						// Update Meet name
						meet.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Meet
						agent.put('/meets/' + meetSaveRes.body._id)
							.send(meet)
							.expect(200)
							.end(function(meetUpdateErr, meetUpdateRes) {
								// Handle Meet update error
								if (meetUpdateErr) done(meetUpdateErr);

								// Set assertions
								(meetUpdateRes.body._id).should.equal(meetSaveRes.body._id);
								(meetUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Meets if not signed in', function(done) {
		// Create new Meet model instance
		var meetObj = new Meet(meet);

		// Save the Meet
		meetObj.save(function() {
			// Request Meets
			request(app).get('/meets')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Meet if not signed in', function(done) {
		// Create new Meet model instance
		var meetObj = new Meet(meet);

		// Save the Meet
		meetObj.save(function() {
			request(app).get('/meets/' + meetObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', meet.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Meet instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Meet
				agent.post('/meets')
					.send(meet)
					.expect(200)
					.end(function(meetSaveErr, meetSaveRes) {
						// Handle Meet save error
						if (meetSaveErr) done(meetSaveErr);

						// Delete existing Meet
						agent.delete('/meets/' + meetSaveRes.body._id)
							.send(meet)
							.expect(200)
							.end(function(meetDeleteErr, meetDeleteRes) {
								// Handle Meet error error
								if (meetDeleteErr) done(meetDeleteErr);

								// Set assertions
								(meetDeleteRes.body._id).should.equal(meetSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Meet instance if not signed in', function(done) {
		// Set Meet user 
		meet.user = user;

		// Create new Meet model instance
		var meetObj = new Meet(meet);

		// Save the Meet
		meetObj.save(function() {
			// Try deleting Meet
			request(app).delete('/meets/' + meetObj._id)
			.expect(401)
			.end(function(meetDeleteErr, meetDeleteRes) {
				// Set message assertion
				(meetDeleteRes.body.message).should.match('User is not logged in');

				// Handle Meet error error
				done(meetDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Meet.remove().exec();
		done();
	});
});