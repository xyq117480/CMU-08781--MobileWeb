'use strict';

// Configuring the Articles module
angular.module('places').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Places', 'places', 'dropdown', '/places(/create)?');
		Menus.addSubMenuItem('topbar', 'places', 'List Places', 'places');
	}
]);