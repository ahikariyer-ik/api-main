'use strict';

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    const createDefaults = async (uid, items) => {
      for (const item of items) {
        const found = await strapi.db.query(uid).findOne({
          where: { key: item.key },
        });

        if (!found) {
          await strapi.entityService.create(uid, {
            data: {
              key: item.key,
              name: item.name,
            },
          });
        }
      }
    };

    await createDefaults('api::position.position', [
      { key: 'top-manager', name: 'Üst Düzey Yönetici' },
      { key: 'middle-manager', name: 'Orta Düzey Yönetici' },
      { key: 'manager-candidate', name: 'Yönetici Adayı' },
      { key: 'expert', name: 'Uzman' },
      { key: 'beginner', name: 'Yeni Başlayan' },
      { key: 'freelancer', name: 'Serbest / Freelancer' },
      { key: 'worker', name: 'İşçi ve Mavi Yaka' },
      { key: 'intern', name: 'Stajyer' },
      { key: 'assistant-expert', name: 'Uzman Yardımcısı' },
      { key: 'employee', name: 'Eleman' },
      { key: 'service-personnel', name: 'Hizmet Personeli' },
    ]);

    await createDefaults('api::department.department', [
      { key: 'hr', name: 'İnsan Kaynakları' },
      { key: 'sales', name: 'Satış' },
      { key: 'it', name: 'Bilgi Teknolojileri' },
      { key: 'finance', name: 'Finans' },
      { key: 'production', name: 'Üretim' },
      { key: 'marketing', name: 'Pazarlama' },
    ]);

    await createDefaults('api::work-mode.work-mode', [
      { key: 'remote', name: 'Uzaktan Çalışma' },
      { key: 'hybrid', name: 'Hibrit Çalışma' },
      { key: 'onsite', name: 'Ofis / Sahada' },
    ]);

    await createDefaults('api::sector.sector', [
      { key: 'technology', name: 'Teknoloji' },
      { key: 'healthcare', name: 'Sağlık' },
      { key: 'education', name: 'Eğitim' },
      { key: 'construction', name: 'İnşaat' },
      { key: 'finance', name: 'Finans' },
    ]);

    await createDefaults('api::profession.profession', [
      { key: 'software-developer', name: 'Yazılım Geliştirici' },
      { key: 'accountant', name: 'Muhasebeci' },
      { key: 'mechanical-engineer', name: 'Makine Mühendisi' },
      { key: 'teacher', name: 'Öğretmen' },
    ]);

    // Rolleri oluştur/kontrol et
    // Employee (Admin/Yönetici) rolü
    const employeeRoleExists = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'employee' },
    });

    if (!employeeRoleExists) {
      await strapi.db.query('plugin::users-permissions.role').create({
        data: {
          name: 'Employee',
          type: 'employee',
          description: 'Admin/Yönetici kullanıcı rolü',
        },
      });
    }

    // Authenticated (İşveren) rolü - genellikle default olarak gelir ama kontrol ediyoruz
    const authenticatedRoleExists = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' },
    });

    if (!authenticatedRoleExists) {
      await strapi.db.query('plugin::users-permissions.role').create({
        data: {
          name: 'Authenticated',
          type: 'authenticated',
          description: 'İşveren kullanıcı rolü',
        },
      });
    }

    // Worker (Çalışan) rolü
    const workerRoleExists = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'worker' },
    });

    if (!workerRoleExists) {
      await strapi.db.query('plugin::users-permissions.role').create({
        data: {
          name: 'Worker',
          type: 'worker',
          description: 'Çalışan kullanıcı rolü',
        },
      });
    }
  },
};
