'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

// UserFriends service used for managing friends
angular.module('users').factory('UserFriends', ['$resource',
	function($resource) {

		return $resource('users/friends/:userId', { }, {
			addFriend: {
				method: 'POST',
				params: { userId: '@userId' }
			}
		});
	}
]);