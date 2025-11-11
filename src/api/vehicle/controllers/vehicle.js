'use strict';

/**
 * vehicle controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::vehicle.vehicle', ({ strapi }) => ({
  /**
   * Find vehicles filtered by company and optionally by institution
   */
  async find(ctx) {
    try {
      const user = ctx.state.user;
      const { institutionId } = ctx.query;

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

      // Build query
      const where = { company: companyProfile.id };
      
      // Add institution filter if provided
      if (institutionId) {
        where.institution = institutionId;
      }

      // Get vehicles for this company
      const vehicles = await strapi.db.query('api::vehicle.vehicle').findMany({
        where,
        populate: ['institution', 'photo'],
        orderBy: { createdAt: 'desc' }
      });

      return ctx.send({
        data: vehicles
      });
    } catch (error) {
      console.error('Find vehicles error:', error);
      return ctx.internalServerError('Araçlar yüklenirken bir hata oluştu: ' + error.message);
    }
  },

  /**
   * Create vehicle
   */
  async create(ctx) {
    try {
      const user = ctx.state.user;
      const { data } = ctx.request.body;

      if (!user) {
        return ctx.unauthorized('Giriş yapmalısınız');
      }

      // Find company profile
      const companyProfile = await strapi.db.query('api::company-profile.company-profile').findOne({
        where: { owner: user.id }
      });

      if (!companyProfile) {
        return ctx.notFound('Şirket profili bulunamadı');
      }

      // Create vehicle
      const vehicle = await strapi.db.query('api::vehicle.vehicle').create({
        data: {
          ...data,
          company: companyProfile.id
        },
        populate: ['institution', 'photo']
      });

      return ctx.send({
        data: vehicle
      });
    } catch (error) {
      console.error('Create vehicle error:', error);
      return ctx.internalServerError('Araç oluşturulurken bir hata oluştu: ' + error.message);
    }
  }
}));




