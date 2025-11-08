'use strict';

/**
 * task controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::task.task', ({ strapi }) => ({
  // Default methods
  ...createCoreController('api::task.task')({ strapi }),

  /**
   * Update task status by worker
   * PUT /api/tasks/:id/status
   */
  async updateStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status, statusNote } = ctx.request.body;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('Giriş yapmalısınız');
      }

      const task = await strapi.db.query('api::task.task').findOne({
        where: { documentId: id },
        populate: ['assignedTo', 'assignedTo.user']
      });

      if (!task) {
        return ctx.notFound('Görev bulunamadı');
      }

      // Check if user is the assigned worker
      if (!task.assignedTo || !task.assignedTo.user || task.assignedTo.user.id !== user.id) {
        return ctx.forbidden('Bu görevi güncelleyemezsiniz');
      }

      const updateData = {
        status,
        statusNote: statusNote || task.statusNote
      };

      // If status is completed, set completedAt
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }

      // If due date passed and status is not completed, auto set to not_completed
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      if (dueDate < now && status !== 'completed' && status !== 'not_completed') {
        updateData.status = 'not_completed';
        updateData.statusNote = 'Teslim tarihi geçti';
      }

      const updatedTask = await strapi.db.query('api::task.task').update({
        where: { id: task.id },
        data: updateData
      });

      return ctx.send({
        data: updatedTask
      });
    } catch (error) {
      console.error('Update task status error:', error);
      return ctx.internalServerError('Görev durumu güncellenirken bir hata oluştu');
    }
  },

  /**
   * Get tasks for a worker
   * GET /api/tasks/my-tasks
   */
  async getMyTasks(ctx) {
    try {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('Giriş yapmalısınız');
      }

      // Find worker by user
      const worker = await strapi.db.query('api::worker.worker').findOne({
        where: { user: user.id }
      });

      if (!worker) {
        return ctx.notFound('Çalışan profili bulunamadı');
      }

      // Get all tasks for this worker
      const tasks = await strapi.db.query('api::task.task').findMany({
        where: {
          assignedTo: worker.id
        },
        populate: ['assignedBy'],
        orderBy: { dueDate: 'asc' }
      });

      // Auto-update overdue tasks
      const now = new Date();
      for (const task of tasks) {
        const dueDate = new Date(task.dueDate);
        if (dueDate < now && task.status !== 'completed' && task.status !== 'not_completed') {
          await strapi.db.query('api::task.task').update({
            where: { id: task.id },
            data: {
              status: 'not_completed',
              statusNote: 'Teslim tarihi geçti'
            }
          });
        }
      }

      // Refetch after updates
      const updatedTasks = await strapi.db.query('api::task.task').findMany({
        where: {
          assignedTo: worker.id
        },
        populate: ['assignedBy'],
        orderBy: { dueDate: 'asc' }
      });

      return ctx.send({
        data: updatedTasks
      });
    } catch (error) {
      console.error('Get my tasks error:', error);
      return ctx.internalServerError('Görevler yüklenirken bir hata oluştu');
    }
  }
}));

