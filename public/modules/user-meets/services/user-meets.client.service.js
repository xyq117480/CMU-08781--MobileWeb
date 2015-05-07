'use strict';

//User meets service used to communicate User meets REST endpoints
angular.module('user-meets').factory('UserMeets', ['$resource',
	function($resource) {
		return $resource('user-meets/:userMeetId', { userMeetId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);