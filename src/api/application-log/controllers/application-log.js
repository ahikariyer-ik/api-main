'use strict';
/**
 * application-log controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  "api::application-log.application-log",
  ({ strapi }) => ({
    async create(ctx) {
      const { job_listing, applicantIP, additionalData } = ctx.request.body.data;

      if (!job_listing) {
        return ctx.badRequest("job_listing id is required");
      }

      // Aynı başvuru daha önce yapılmış mı kontrol et
      const existingLog = await strapi.db.query("api::application-log.application-log").findOne({
        where: {
          job_listing,
          applicantIP,
        },
      });

      if (existingLog) {
        // Zaten başvuru yapılmış, boş dön
        return { data: null };
      }

      // Kayıt yoksa yeni başvuru logu oluştur
      const log = await strapi.entityService.create(
        "api::application-log.application-log",
        {
          data: {
            job_listing,
            additionalData,
            applicantIP,
          },
        }
      );

      return { data: log };
    },
  })
);
