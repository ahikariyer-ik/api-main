/**
 * work-mode service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::work-mode.work-mode');
