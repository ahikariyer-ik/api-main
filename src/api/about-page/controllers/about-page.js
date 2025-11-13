'use strict';

/**
 * about-page controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::about-page.about-page', ({ strapi }) => ({
  async public(ctx) {
    try {
      // about-page bir singleType, db.query ile çekiyoruz
      const aboutPage = await strapi.db.query('api::about-page.about-page').findMany({
        populate: true,
      });

      // SingleType olduğu için array'in ilk elemanını veya direkt array'i dönüyoruz
      return { data: aboutPage.length > 0 ? aboutPage[0] : aboutPage };
    } catch (error) {
      console.error('About page error:', error);
      ctx.throw(500, 'Hakkımızda sayfası yüklenirken bir hata oluştu');
    }
  }
}));
