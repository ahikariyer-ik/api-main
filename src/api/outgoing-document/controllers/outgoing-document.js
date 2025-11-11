'use strict';

/**
 * outgoing-document controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::outgoing-document.outgoing-document', ({ strapi }) => ({
  /**
   * Find outgoing documents filtered by company and optionally by institution
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

      // Get outgoing documents for this company
      const outgoingDocuments = await strapi.db.query('api::outgoing-document.outgoing-document').findMany({
        where,
        populate: ['institution', 'document'],
        orderBy: { createdAt: 'desc' }
      });

      return ctx.send({
        data: outgoingDocuments
      });
    } catch (error) {
      console.error('Find outgoing documents error:', error);
      return ctx.internalServerError('Giden evraklar yüklenirken bir hata oluştu: ' + error.message);
    }
  },

  /**
   * Create outgoing document
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

      // Create outgoing document
      const outgoingDocument = await strapi.db.query('api::outgoing-document.outgoing-document').create({
        data: {
          ...data,
          company: companyProfile.id
        },
        populate: ['institution', 'document']
      });

      return ctx.send({
        data: outgoingDocument
      });
    } catch (error) {
      console.error('Create outgoing document error:', error);
      return ctx.internalServerError('Giden evrak oluşturulurken bir hata oluştu: ' + error.message);
    }
  }
}));





