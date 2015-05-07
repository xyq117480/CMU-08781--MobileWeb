'use strict';

//Setting up route
angular.module('user-meets').config(['$stateProvider',
	function($stateProvider) {
		// User meets state routing
		$stateProvider.
		state('listUserMeets', {
			url: '/user-meets',
			templateUrl: 'modules/user-meets/views/list-user-meets.client.view.html'
		}).
		state('createUserMeet', {
			url: '/user-meets/create',
			templateUrl: 'modules/user-meets/views/create-user-meet.client.view.html'
		}).
		state('viewUserMeet', {
			url: '/user-meets/:userMeetId',
			templateUrl: 'modules/user-meets/views/view-user-meet.client.view.html'
		}).
		state('editUserMeet', {
			url: '/user-meets/:userMeetId/edit',
			templateUrl: 'modules/user-meets/views/edit-user-meet.client.view.html'
		});
	}
]);