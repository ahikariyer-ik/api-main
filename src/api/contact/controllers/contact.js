'use strict';

/**
 * contact controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController("api::contact.contact", ({ strapi }) => ({
  async public(ctx) {
    // Single type için findOne kullanılmalı
    const contact = await strapi.db.query("api::contact.contact").findOne({
      populate: true,
    });

    return { data: contact };
  },
}));