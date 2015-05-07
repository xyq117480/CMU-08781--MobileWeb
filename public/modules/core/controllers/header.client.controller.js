'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$interval', 'Authentication', 'Menus', 'CoreGeolocation',
	function($scope, $interval, Authentication, Menus, CoreGeolocation) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');
		$scope.coords = {};

		function updateGeolocation() {
			if (navigator.geolocation) {
		        navigator.geolocation.getCurrentPosition(function (position) {
		        	$scope.coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
		        	CoreGeolocation.updateGeolocation($scope.coords);
		        }, function(error) {
		        	switch(error.code) {
				        case error.PERMISSION_DENIED:
				            console.log('User denied the request for Geolocation.');
				            break;
				        case error.POSITION_UNAVAILABLE:
				            console.log('Location information is unavailable.');
				            break;
				        case error.TIMEOUT:
				            console.log('The request to get user location timed out.');
				            break;
				        case error.UNKNOWN_ERROR:
				            console.log('An unknown error occurred.');
				            break;
				    }
		        });
		    }
		}

		// Update geolocation every 10 seconds
		var promise = $interval(updateGeolocation, 10000);

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);