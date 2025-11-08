'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  "api::posting-right.posting-right",
  ({ strapi }) => ({
    async find(ctx) {
      const { user } = ctx.state;

      if (user?.role?.name === "Employee") {
        const results = await strapi.db
          .query("api::posting-right.posting-right")
          .findMany({
            where: ctx.query.filters || {},
            populate: true,
          });
        return { data: results };
      }

      const companies = await strapi.db
        .query("api::company-profile.company-profile")
        .findMany({
          where: { owner: user.id },
          select: ["id"],
        });

      if (!companies.length) return { data: [] };

      const rights = await strapi.db
        .query("api::posting-right.posting-right")
        .findMany({
          where: { company: companies[0].id },
          populate: true,
        });

      return { data: rights };
    },

    async findOne(ctx) {
      const { user } = ctx.state;
      const { id } = ctx.params;

      const right = await strapi.db
        .query("api::posting-right.posting-right")
        .findOne({
          where: { id: +id },
          populate: ["company"],
        });

      if (!right) return ctx.notFound("Kayıt bulunamadı");

      if (user?.role?.name !== "Employee") {
        const companies = await strapi.db
          .query("api::company-profile.company-profile")
          .findMany({
            where: { owner: user.id },
            select: ["id"],
          });
        if (!companies.some((c) => c.id === right.company.id)) {
          return ctx.unauthorized("Bu kayıt size ait değil");
        }
      }

      ctx.body = { data: right };
    },
  })
);
