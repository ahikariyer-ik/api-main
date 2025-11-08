const { createCoreController } = require('@strapi/strapi').factories;
const slugify = require('slugify');
module.exports = createCoreController("api::service.service", ({ strapi }) => ({
  async find(ctx) {
    const { query } = ctx;
    const filters = query.filters || {};

    const services = await strapi.db.query("api::service.service").findMany({
      where: {
        ...filters,
        isActive: true,
      },
      orderBy: { displayOrder: "asc" },
      populate: true,
    });

    return { data: services };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const service = await strapi.db.query("api::service.service").findOne({
      where: {
        documentId: id,
        isActive: true,
      },
      populate: true,
    });

    if (!service) {
      return ctx.notFound("Hizmet bulunamadı");
    }

    return { data: service };
  },

  async findBySlug(ctx) {
    const { slug } = ctx.params;

    const service = await strapi.db.query("api::service.service").findOne({
      where: {
        slug,
        isActive: true,
      },
      populate: true,
    });

    if (!service) {
      return ctx.notFound("Hizmet bulunamadı");
    }

    return { data: service };
  },
  async update(ctx) {
    const { id: documentId } = ctx.params
    const data = ctx.request.body.data || {}

    if (!data.slug && data.title) {
      data.slug = slugify(data.title, { lower: true, strict: true })
    }

    console.log(documentId);
    const existing = await strapi.db.query('api::service.service').findOne({
      where: {
        slug: data.slug,
        documentId: { $ne: documentId },
      },
    })

    if (existing) {
      return ctx.badRequest('Bu slug başka bir hizmete ait. Lütfen farklı bir slug kullanın.')
    }

    const updated = await strapi.db.query('api::service.service').update({
      where: {
        documentId: documentId,
      },
      data,
      populate: true,
    })

    return { data: updated }
  },
})); 