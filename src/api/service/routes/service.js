/**
 * service router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;
const extraRoutes = require('./01-custom-service-route');

module.exports = (() => {
	const routerCore = createCoreRouter('api::service.service')
	return {
		get prefix() {
			return routerCore.prefix
		},
		get routes() {
				
      return [...routerCore.routes, ...extraRoutes.routes];
    },
  };
})();
