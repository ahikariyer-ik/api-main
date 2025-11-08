'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::department.department', ({ strapi }) => ({
  /**
   * Find departments - only return departments for the logged-in user's company
   */
  async find(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('Giriş yapmalısınız');
    }

    try {
      // Get user's company profile
      const companyProfile = await strapi.db.query('api::company-profile.company-profile').findOne({
        where: { owner: user.id }
      });

      if (!companyProfile) {
        return ctx.send({ data: [] });
      }

      // Find departments for this company
      const departments = await strapi.db.query('api::department.department').findMany({
        where: { 
          company: companyProfile.id 
        },
        populate: ['company']
      });

      return ctx.send({ data: departments });
    } catch (error) {
      console.error('Find departments error:', error);
      return ctx.internalServerError('Departmanlar yüklenirken bir hata oluştu');
    }
  },

  /**
   * Create department - automatically link to user's company
   */
  async create(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('Giriş yapmalısınız');
    }

    try {
      // Get user's company profile
      const companyProfile = await strapi.db.query('api::company-profile.company-profile').findOne({
        where: { owner: user.id }
      });

      if (!companyProfile) {
        return ctx.forbidden('Şirket profili bulunamadı');
      }

      const { key, name, description } = ctx.request.body.data;

      if (!key || !name) {
        return ctx.badRequest('Departman kodu ve adı zorunludur');
      }

      // Check if department key already exists for this company
      const existingDepartment = await strapi.db.query('api::department.department').findOne({
        where: { 
          key,
          company: companyProfile.id 
        }
      });

      if (existingDepartment) {
        return ctx.badRequest('Bu departman kodu zaten kullanımda');
      }

      // Create department
      const newDepartment = await strapi.db.query('api::department.department').create({
        data: {
          key,
          name,
          description,
          company: companyProfile.id
        },
        populate: ['company']
      });

      return ctx.send({ data: newDepartment });
    } catch (error) {
      console.error('Create department error:', error);
      return ctx.internalServerError('Departman oluşturulurken bir hata oluştu');
    }
  },

  /**
   * Update department - only if it belongs to user's company
   */
  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    
    if (!user) {
      return ctx.unauthorized('Giriş yapmalısınız');
    }

    try {
      // Get user's company profile
      const companyProfile = await strapi.db.query('api::company-profile.company-profile').findOne({
        where: { owner: user.id }
      });

      if (!companyProfile) {
        return ctx.forbidden('Şirket profili bulunamadı');
      }

      // Get department by documentId
      const department = await strapi.db.query('api::department.department').findOne({
        where: { documentId: id },
        populate: ['company']
      });

      if (!department) {
        return ctx.notFound('Departman bulunamadı');
      }

      // Check if department belongs to user's company
      if (department.company.id !== companyProfile.id) {
        return ctx.forbidden('Bu departmanı düzenleme yetkiniz yok');
      }

      const { key, name, description } = ctx.request.body.data;

      // Update department
      const updatedDepartment = await strapi.db.query('api::department.department').update({
        where: { documentId: id },
        data: {
          key,
          name,
          description
        },
        populate: ['company']
      });

      return ctx.send({ data: updatedDepartment });
    } catch (error) {
      console.error('Update department error:', error);
      return ctx.internalServerError('Departman güncellenirken bir hata oluştu');
    }
  },

  /**
   * Delete department - only if it belongs to user's company
   */
  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    
    if (!user) {
      return ctx.unauthorized('Giriş yapmalısınız');
    }

    try {
      // Get user's company profile
      const companyProfile = await strapi.db.query('api::company-profile.company-profile').findOne({
        where: { owner: user.id }
      });

      if (!companyProfile) {
        return ctx.forbidden('Şirket profili bulunamadı');
      }

      // Get department by documentId
      const department = await strapi.db.query('api::department.department').findOne({
        where: { documentId: id },
        populate: ['company']
      });

      if (!department) {
        return ctx.notFound('Departman bulunamadı');
      }

      // Check if department belongs to user's company
      if (department.company.id !== companyProfile.id) {
        return ctx.forbidden('Bu departmanı silme yetkiniz yok');
      }

      // Delete department
      await strapi.db.query('api::department.department').delete({
        where: { documentId: id }
      });

      return ctx.send({ data: department });
    } catch (error) {
      console.error('Delete department error:', error);
      return ctx.internalServerError('Departman silinirken bir hata oluştu');
    }
  }
}));
