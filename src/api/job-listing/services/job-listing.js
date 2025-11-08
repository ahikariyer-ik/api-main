'use strict';
/**
 * job-listing service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::job-listing.job-listing');
