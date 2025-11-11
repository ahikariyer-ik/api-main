'use strict';

/**
 * property controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::property.property', ({ strapi }) => ({
  /**
   * Find properties filtered by company and optionally by institution
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

      // Get properties for this company
      const properties = await strapi.db.query('api::property.property').findMany({
        where,
        populate: ['institution', 'photo', 'daskPolicy', 'titleDeed'],
        orderBy: { createdAt: 'desc' }
      });

      return ctx.send({
        data: properties
      });
    } catch (error) {
      console.error('Find properties error:', error);
      return ctx.internalServerError('Konutlar yüklenirken bir hata oluştu: ' + error.message);
    }
  },

  /**
   * Create property
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

      // Create property
      const property = await strapi.db.query('api::property.property').create({
        data: {
          ...data,
          company: companyProfile.id
        },
        populate: ['institution', 'photo', 'daskPolicy', 'titleDeed']
      });

      return ctx.send({
        data: property
      });
    } catch (error) {
      console.error('Create property error:', error);
      return ctx.internalServerError('Konut oluşturulurken bir hata oluştu: ' + error.message);
    }
  }
}));






