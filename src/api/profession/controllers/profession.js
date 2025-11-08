'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  "api::profession.profession",
  ({ strapi }) => ({
    async find(ctx) {
      const professions = await strapi.db.query("api::profession.profession").findMany({
        where: ctx.query.filters || {},
        populate: true,
      });
      return { data: professions };
    },
  })
);
