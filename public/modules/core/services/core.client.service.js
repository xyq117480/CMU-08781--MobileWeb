'use strict';

// Core service for uploading user's geolocation
angular.module('core').factory('CoreGeolocation', ['$http',
	function($http) {
		return {
			updateGeolocation: function(coords) {
				return $http({
					url: 'users/geolocation',
					method: 'POST',
					params: { latitude: coords.latitude, longitude: coords.longitude }
				});
			}
		};
	}
]);