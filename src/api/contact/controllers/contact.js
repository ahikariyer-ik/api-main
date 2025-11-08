'use strict';

/**
 * contact controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController("api::contact.contact", ({ strapi }) => ({
  async public(ctx) {
    const { query } = ctx;
    const filters = query.filters || {};

    const contacts = await strapi.db.query("api::contact.contact").findMany({
      where: {
        ...filters
      },
      populate: true,
    });

    return { data: contacts };
  },
}));