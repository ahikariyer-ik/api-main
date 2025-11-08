const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  "api::work-mode.work-mode",
  ({ strapi }) => ({
    async find(ctx) {
      const workModes = await strapi.db.query("api::work-mode.work-mode").findMany({
        where: ctx.query.filters || {},
        populate: true,
      });
      return { data: workModes };
    },
  })
); 