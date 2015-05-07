'use strict';

angular.module('users').controller('UsersController', ['$scope', 'Users', 'UserFriends',
	function($scope, Users, UserFriends) {
		
		// Find this user's friends
		$scope.find = function() {
			$scope.friends = UserFriends.query();
			console.log($scope.friends);
			$scope.users = Users.query();
		};

		// Add a friend
		$scope.addFriend = function(friend) {
			if (friend !== null) {
				UserFriends.addFriend({ userId: friend._id }, function (response) {
					$scope.friends = response.friends;
				} );
			}
		};
	}
]);