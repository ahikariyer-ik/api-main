'use strict';

/**
 * leave-request controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::leave-request.leave-request', ({ strapi }) => ({
  // Default methods
  ...createCoreController('api::leave-request.leave-request')({ strapi }),

  /**
   * Approve leave request
   * PUT /api/leave-requests/:id/approve
   */
  async approve(ctx) {
    try {
      const { id } = ctx.params;
      const { reviewNote } = ctx.request.body;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('Giriş yapmalısınız');
      }

      const leaveRequest = await strapi.db.query('api::leave-request.leave-request').findOne({
        where: { documentId: id },
        populate: ['company', 'worker']
      });

      if (!leaveRequest) {
        return ctx.notFound('İzin talebi bulunamadı');
      }

      // Check if user has permission (company owner or admin)
      const companyProfile = await strapi.db.query('api::company-profile.company-profile').findOne({
        where: { id: leaveRequest.company.id },
        populate: ['owner']
      });

      if (!companyProfile || !companyProfile.owner || companyProfile.owner.id !== user.id) {
        return ctx.forbidden('Bu işlem için yetkiniz yok');
      }

      const updatedLeaveRequest = await strapi.db.query('api::leave-request.leave-request').update({
        where: { id: leaveRequest.id },
        data: {
          status: 'approved',
          reviewedBy: user.id,
          reviewedAt: new Date(),
          reviewNote: reviewNote || ''
        }
      });

      return ctx.send({
        data: updatedLeaveRequest
      });
    } catch (error) {
      console.error('Approve leave request error:', error);
      return ctx.internalServerError('İzin talebi onaylanırken bir hata oluştu');
    }
  },

  /**
   * Reject leave request
   * PUT /api/leave-requests/:id/reject
   */
  async reject(ctx) {
    try {
      const { id } = ctx.params;
      const { reviewNote } = ctx.request.body;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('Giriş yapmalısınız');
      }

      const leaveRequest = await strapi.db.query('api::leave-request.leave-request').findOne({
        where: { documentId: id },
        populate: ['company', 'worker']
      });

      if (!leaveRequest) {
        return ctx.notFound('İzin talebi bulunamadı');
      }

      // Check if user has permission (company owner or admin)
      const companyProfile = await strapi.db.query('api::company-profile.company-profile').findOne({
        where: { id: leaveRequest.company.id },
        populate: ['owner']
      });

      if (!companyProfile || !companyProfile.owner || companyProfile.owner.id !== user.id) {
        return ctx.forbidden('Bu işlem için yetkiniz yok');
      }

      const updatedLeaveRequest = await strapi.db.query('api::leave-request.leave-request').update({
        where: { id: leaveRequest.id },
        data: {
          status: 'rejected',
          reviewedBy: user.id,
          reviewedAt: new Date(),
          reviewNote: reviewNote || ''
        }
      });

      return ctx.send({
        data: updatedLeaveRequest
      });
    } catch (error) {
      console.error('Reject leave request error:', error);
      return ctx.internalServerError('İzin talebi reddedilirken bir hata oluştu');
    }
  },

  /**
   * Calculate remaining leave days for a worker
   * GET /api/leave-requests/worker/:workerId/remaining-days
   */
  async getRemainingDays(ctx) {
    try {
      const { workerId } = ctx.params;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('Giriş yapmalısınız');
      }

      const worker = await strapi.db.query('api::worker.worker').findOne({
        where: { documentId: workerId },
        populate: ['user']
      });

      if (!worker) {
        return ctx.notFound('Çalışan bulunamadı');
      }

      // Calculate years of service
      const hireDate = new Date(worker.hireDate);
      const today = new Date();
      const yearsOfService = Math.floor((today - hireDate) / (365.25 * 24 * 60 * 60 * 1000));

      // Determine annual leave entitlement
      let totalEntitledDays = 14; // Default for 1-5 years
      if (yearsOfService >= 15) {
        totalEntitledDays = 26;
      } else if (yearsOfService >= 5) {
        totalEntitledDays = 20;
      }

      // Get used leave days for current year
      const currentYear = today.getFullYear();
      const approvedLeaves = await strapi.db.query('api::leave-request.leave-request').findMany({
        where: {
          worker: worker.id,
          status: 'approved',
          leaveType: 'annual',
          startDate: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        }
      });

      const usedDays = approvedLeaves.reduce((sum, leave) => sum + leave.totalDays, 0);
      const remainingDays = totalEntitledDays - usedDays;

      return ctx.send({
        data: {
          yearsOfService,
          totalEntitledDays,
          usedDays,
          remainingDays
        }
      });
    } catch (error) {
      console.error('Get remaining days error:', error);
      return ctx.internalServerError('Kalan izin günleri hesaplanırken bir hata oluştu');
    }
  }
}));

