'use strict';

// User meets controller
angular.module('user-meets').controller('UserMeetsController', ['$scope', '$stateParams', '$location', 'Authentication', 'UserMeets',
	function($scope, $stateParams, $location, Authentication, UserMeets) {
		$scope.authentication = Authentication;

		// Create new User meet
		$scope.create = function() {
			// Create new User meet object
			var userMeet = new UserMeets ({
				name: this.name
			});

			// Redirect after save
			userMeet.$save(function(response) {
				$location.path('user-meets/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing User meet
		$scope.remove = function(userMeet) {
			if ( userMeet ) { 
				userMeet.$remove();

				for (var i in $scope.userMeets) {
					if ($scope.userMeets [i] === userMeet) {
						$scope.userMeets.splice(i, 1);
					}
				}
			} else {
				$scope.userMeet.$remove(function() {
					$location.path('user-meets');
				});
			}
		};

		// Update existing User meet
		$scope.update = function() {
			var userMeet = $scope.userMeet;

			userMeet.$update(function() {
				$location.path('user-meets/' + userMeet._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of User meets
		$scope.find = function() {
			$scope.userMeets = UserMeets.query();
		};

		// Find existing User meet
		$scope.findOne = function() {
			$scope.userMeet = UserMeets.get({ 
				userMeetId: $stateParams.userMeetId
			});
		};
	}
]);