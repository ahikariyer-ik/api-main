'use strict';

/**
 * incoming-document controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::incoming-document.incoming-document', ({ strapi }) => ({
  /**
   * Find incoming documents filtered by company and optionally by institution
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

      // Get incoming documents for this company
      const incomingDocuments = await strapi.db.query('api::incoming-document.incoming-document').findMany({
        where,
        populate: ['institution', 'document'],
        orderBy: { createdAt: 'desc' }
      });

      return ctx.send({
        data: incomingDocuments
      });
    } catch (error) {
      console.error('Find incoming documents error:', error);
      return ctx.internalServerError('Gelen evraklar yüklenirken bir hata oluştu: ' + error.message);
    }
  },

  /**
   * Create incoming document
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

      // Create incoming document
      const incomingDocument = await strapi.db.query('api::incoming-document.incoming-document').create({
        data: {
          ...data,
          company: companyProfile.id
        },
        populate: ['institution', 'document']
      });

      return ctx.send({
        data: incomingDocument
      });
    } catch (error) {
      console.error('Create incoming document error:', error);
      return ctx.internalServerError('Gelen evrak oluşturulurken bir hata oluştu: ' + error.message);
    }
  }
}));




