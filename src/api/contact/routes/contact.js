'use strict';

/**
 * contact router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;
const extraRoutes = require('./01-custom-contact-route');

module.exports = (() => {
	const routerCore = createCoreRouter('api::contact.contact')
	return {
		get prefix() {
			return routerCore.prefix
		},
		get routes() {
				
      return [...routerCore.routes, ...extraRoutes.routes];
    },
  };
})();
