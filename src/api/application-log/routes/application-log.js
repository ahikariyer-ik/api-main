'use strict';

/**
 * application-log router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/application-logs',
      handler: 'application-log.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/application-logs',
      handler: 'application-log.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
