'use strict';

//Setting up route
angular.module('meets').config(['$stateProvider',
	function($stateProvider) {
		// Meets state routing
		$stateProvider.
		state('listMeets', {
			url: '/meets',
			templateUrl: 'modules/meets/views/list-meets.client.view.html'
		}).
		state('createMeet', {
			url: '/meets/create',
			templateUrl: 'modules/meets/views/create-meet.client.view.html'
		}).
		state('viewMeet', {
			url: '/meets/:meetId',
			templateUrl: 'modules/meets/views/view-meet.client.view.html'
		}).
		state('editMeet', {
			url: '/meets/:meetId/edit',
			templateUrl: 'modules/meets/views/edit-meet.client.view.html'
		});
	}
]);