'use strict';

// Configuring the Articles module
angular.module('meets').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Meets', 'meets', 'dropdown', '/meets(/create)?');
		Menus.addSubMenuItem('topbar', 'meets', 'List Meets', 'meets');
		Menus.addSubMenuItem('topbar', 'meets', 'New Meet', 'meets/create');
	}
]);