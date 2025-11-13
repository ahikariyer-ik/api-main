'use strict';
/**
 * application-log controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  "api::application-log.application-log",
  ({ strapi }) => ({
    /**
     * Find application logs filtered by company
     */
    async find(ctx) {
      try {
        const user = ctx.state.user;

        if (!user) {
          return ctx.unauthorized('Giriş yapmalısınız');
        }

        // Find company profile for user
        const companyProfile = await strapi.db.query('api::company-profile.company-profile').findOne({
          where: { owner: user.id }
        });

        if (!companyProfile) {
          return ctx.notFound('Şirket profili bulunamadı');
        }

        // Get job listings for this company
        const jobListings = await strapi.db.query('api::job-listing.job-listing').findMany({
          where: { company: companyProfile.id },
          select: ['id']
        });

        const jobListingIds = jobListings.map(job => job.id);

        // Get application logs for these job listings
        const logs = await strapi.db.query('api::application-log.application-log').findMany({
          where: {
            job_listing: { $in: jobListingIds }
          },
          populate: ['job_listing'],
          orderBy: { createdAt: 'desc' },
          limit: ctx.query['pagination[pageSize]'] || 100
        });

        return ctx.send({
          data: logs
        });
      } catch (error) {
        console.error('Find application logs error:', error);
        return ctx.internalServerError('Başvuru logları yüklenirken bir hata oluştu: ' + error.message);
      }
    },

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
