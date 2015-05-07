'use strict';

(function() {
	// User meets Controller Spec
	describe('User meets Controller Tests', function() {
		// Initialize global variables
		var UserMeetsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the User meets controller.
			UserMeetsController = $controller('UserMeetsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one User meet object fetched from XHR', inject(function(UserMeets) {
			// Create sample User meet using the User meets service
			var sampleUserMeet = new UserMeets({
				name: 'New User meet'
			});

			// Create a sample User meets array that includes the new User meet
			var sampleUserMeets = [sampleUserMeet];

			// Set GET response
			$httpBackend.expectGET('user-meets').respond(sampleUserMeets);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.userMeets).toEqualData(sampleUserMeets);
		}));

		it('$scope.findOne() should create an array with one User meet object fetched from XHR using a userMeetId URL parameter', inject(function(UserMeets) {
			// Define a sample User meet object
			var sampleUserMeet = new UserMeets({
				name: 'New User meet'
			});

			// Set the URL parameter
			$stateParams.userMeetId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/user-meets\/([0-9a-fA-F]{24})$/).respond(sampleUserMeet);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.userMeet).toEqualData(sampleUserMeet);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(UserMeets) {
			// Create a sample User meet object
			var sampleUserMeetPostData = new UserMeets({
				name: 'New User meet'
			});

			// Create a sample User meet response
			var sampleUserMeetResponse = new UserMeets({
				_id: '525cf20451979dea2c000001',
				name: 'New User meet'
			});

			// Fixture mock form input values
			scope.name = 'New User meet';

			// Set POST response
			$httpBackend.expectPOST('user-meets', sampleUserMeetPostData).respond(sampleUserMeetResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the User meet was created
			expect($location.path()).toBe('/user-meets/' + sampleUserMeetResponse._id);
		}));

		it('$scope.update() should update a valid User meet', inject(function(UserMeets) {
			// Define a sample User meet put data
			var sampleUserMeetPutData = new UserMeets({
				_id: '525cf20451979dea2c000001',
				name: 'New User meet'
			});

			// Mock User meet in scope
			scope.userMeet = sampleUserMeetPutData;

			// Set PUT response
			$httpBackend.expectPUT(/user-meets\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/user-meets/' + sampleUserMeetPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid userMeetId and remove the User meet from the scope', inject(function(UserMeets) {
			// Create new User meet object
			var sampleUserMeet = new UserMeets({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new User meets array and include the User meet
			scope.userMeets = [sampleUserMeet];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/user-meets\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleUserMeet);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.userMeets.length).toBe(0);
		}));
	});
}());