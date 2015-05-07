'use strict';

(function() {
	// Meets Controller Spec
	describe('Meets Controller Tests', function() {
		// Initialize global variables
		var MeetsController,
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

			// Initialize the Meets controller.
			MeetsController = $controller('MeetsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Meet object fetched from XHR', inject(function(Meets) {
			// Create sample Meet using the Meets service
			var sampleMeet = new Meets({
				name: 'New Meet'
			});

			// Create a sample Meets array that includes the new Meet
			var sampleMeets = [sampleMeet];

			// Set GET response
			$httpBackend.expectGET('meets').respond(sampleMeets);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.meets).toEqualData(sampleMeets);
		}));

		it('$scope.findOne() should create an array with one Meet object fetched from XHR using a meetId URL parameter', inject(function(Meets) {
			// Define a sample Meet object
			var sampleMeet = new Meets({
				name: 'New Meet'
			});

			// Set the URL parameter
			$stateParams.meetId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/meets\/([0-9a-fA-F]{24})$/).respond(sampleMeet);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.meet).toEqualData(sampleMeet);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Meets) {
			// Create a sample Meet object
			var sampleMeetPostData = new Meets({
				name: 'New Meet'
			});

			// Create a sample Meet response
			var sampleMeetResponse = new Meets({
				_id: '525cf20451979dea2c000001',
				name: 'New Meet'
			});

			// Fixture mock form input values
			scope.name = 'New Meet';

			// Set POST response
			$httpBackend.expectPOST('meets', sampleMeetPostData).respond(sampleMeetResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Meet was created
			expect($location.path()).toBe('/meets/' + sampleMeetResponse._id);
		}));

		it('$scope.update() should update a valid Meet', inject(function(Meets) {
			// Define a sample Meet put data
			var sampleMeetPutData = new Meets({
				_id: '525cf20451979dea2c000001',
				name: 'New Meet'
			});

			// Mock Meet in scope
			scope.meet = sampleMeetPutData;

			// Set PUT response
			$httpBackend.expectPUT(/meets\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/meets/' + sampleMeetPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid meetId and remove the Meet from the scope', inject(function(Meets) {
			// Create new Meet object
			var sampleMeet = new Meets({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Meets array and include the Meet
			scope.meets = [sampleMeet];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/meets\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleMeet);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.meets.length).toBe(0);
		}));
	});
}());