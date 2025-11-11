'use strict';

/**
 * decision controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::decision.decision', ({ strapi }) => ({
  /**
   * Find decisions filtered by company and optionally by institution
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

      // Get decisions for this company
      const decisions = await strapi.db.query('api::decision.decision').findMany({
        where,
        populate: ['institution', 'document'],
        orderBy: { createdAt: 'desc' }
      });

      return ctx.send({
        data: decisions
      });
    } catch (error) {
      console.error('Find decisions error:', error);
      return ctx.internalServerError('Kararlar yüklenirken bir hata oluştu: ' + error.message);
    }
  },

  /**
   * Create decision
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

      // Create decision
      const decision = await strapi.db.query('api::decision.decision').create({
        data: {
          ...data,
          company: companyProfile.id
        },
        populate: ['institution', 'document']
      });

      return ctx.send({
        data: decision
      });
    } catch (error) {
      console.error('Create decision error:', error);
      return ctx.internalServerError('Karar oluşturulurken bir hata oluştu: ' + error.message);
    }
  }
}));




