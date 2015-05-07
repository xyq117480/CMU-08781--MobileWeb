'use strict';

// Meets controller
angular.module('meets').controller('MeetsController', ['$scope', '$stateParams', '$location', '$filter', 'Authentication', 'Meets', 'MeetMisc',
	function($scope, $stateParams, $location, $filter, Authentication, Meets, MeetMisc) {
		$scope.authentication = Authentication;
		$scope.user = Authentication.user;
		$scope.meetTime = $filter('date')(new Date(), 'h:mm a');
		$scope.meetDate = $filter('date')(new Date(), 'MMM d, yyyy');
		$scope.isPublic = 0;
		$scope.inviteStr = '';
		$scope.yelpRecommendation = [];
		$scope.minutesToDestination = {};
		$scope.buttons = {};

		// Create new Meet
		$scope.create = function() {

			// Create new Meet object
			var meet = new Meets ({
				place: this.place,
				isPublic: this.isPublic,
				meetTime: this.meetDate + ' ' + this.meetTime,
				invite: this.inviteStr.split(',')
			});

			// Redirect after save
			meet.$save(function(response) {
				$location.path('meets/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Meet
		$scope.remove = function(meet) {
			if ( meet ) { 
				meet.$remove();

				for (var i in $scope.meets) {
					if ($scope.meets [i] === meet) {
						$scope.meets.splice(i, 1);
					}
				}
			} else {
				$scope.meet.$remove(function() {
					$location.path('meets');
				});
			}
		};

		// Update existing Meet
		$scope.update = function() {
			var meet = $scope.meet;

			meet.$update(function() {
				$location.path('meets/' + meet._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		function joined(meet) {
			if ($scope.user._id === meet.host._id) {
				return true;
			} else {
				for (var i=0; i<meet.invite.length; i++) {
					if ($scope.user._id === meet.invite[i]._id) {
						return true;
					}
				}
				return false;
			}
		}

		// Find a list of Meets
		$scope.find = function() {
			$scope.meets = Meets.query(function() {
				$scope.meets.forEach(function(meet) {
					var alreadyJoined = joined(meet);
					$scope.buttons[meet._id] = {
						isSubmitting: alreadyJoined,
						result: alreadyJoined ? 'success' : null,
						options: {
							buttonSizeClass: 'btn-sm',
							onlyIcons: true,
							animationCompleteTime: 100000
						}
					};
				});
			});
		};

		$scope.getMinutesToDestination = function(meet, users) {
			users.forEach(function (user) {
				MeetMisc.getMinutesToDestination({meetId: meet._id, userId: user._id})
				.success(function(data) {
					$scope.minutesToDestination[user.displayName] = data.minutesToDestination;
				})
				.error(function(err) {
					console.log(err);
				});
			});

		};

		// Find existing Meet
		$scope.findOne = function() {
			Meets.get({ 
				meetId: $stateParams.meetId
			}, function (meet) {
				if (meet) {
					$scope.meet = meet;
					var users = meet.invite;
					users.push(meet.host);
					$scope.getMinutesToDestination(meet, users);
				}
			});
		};

		// Join a meet
		$scope.joinMeet = function(meet) {

			// If user is not signed in then redirect back home
			if (!$scope.user)
				$location.path('signin');


			if (meet) {
				$scope.buttons[meet._id].isSubmitting = true;
				MeetMisc.joinMeet(meet._id)
				.success(function() {
					$scope.buttons[meet._id].result = 'success';
				})
				.error(function(data, status) {
					$scope.buttons[meet._id].result = 'error';
				});
			}
		};

		// Get yelp recommendation
		$scope.yelpRecommend = function() {
			var term = this.placeName;
			if (term) {
				if (term.length >= 3) {
					MeetMisc.getYelpRecommendation(term)
					.success(function(data) {
						$scope.yelpRecommendation = data.businesses;
					})
					.error(function(data, status) {
						console.log(status);
					});
				}
			}
		};

		$scope.updatePlace = function(place) {
			if (place) {
				$scope.placeName = place.name;
				$scope.place = place;
				$scope.yelpRecommendation = [];
			}
		};
	}
]);