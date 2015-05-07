'use strict';

//Meets service used to communicate Meets REST endpoints
angular.module('meets').factory('Meets', ['$resource',
	function($resource) {
		return $resource('meets/:meetId', { meetId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('meets').factory('MeetMisc', ['$http',
	function($http) {
		return {
			joinMeet: function(meetId) {
				return $http({
					url: 'meetsMisc/joinMeet',
					method: 'GET',
					params: { meetId: meetId }
				});
			},
			getYelpRecommendation: function(term) {
				return $http({
					url: 'meetsMisc/yelpRecommend',
					method: 'GET',
					params: { term: term }
				});
			},
			getMinutesToDestination: function(data) {
				return $http({
					url: 'meetsMisc/getMinutesToDestination',
					method: 'GET',
					params: { meetId: data.meetId, userId: data.userId }
				});
			}
		};
	}
]);