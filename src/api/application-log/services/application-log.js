'use strict';
/**
 * application-log service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::application-log.application-log');
