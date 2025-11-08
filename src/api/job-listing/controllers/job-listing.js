'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  "api::job-listing.job-listing",
  ({ strapi }) => ({
    async find(ctx) {
      const user = ctx.state.user;

      // Sayfalama parametrelerini al
      const { page = 1, pageSize = 10 } = ctx.query;
      const start = (page - 1) * pageSize;

      // Temel sorgu seçenekleri
      const queryOptions = {
        limit: parseInt(pageSize),
        offset: start,
        orderBy: { createdAt: 'desc' }
      };

      if (!user) {
        ctx.query = {
          ...ctx.query,
          filters: {
            ...(typeof ctx.query.filters === "object" &&
            ctx.query.filters !== null
              ? ctx.query.filters
              : {}),
            jobStatus: "Active",
          },
        };

        const [entries, count] = await Promise.all([
          strapi.db.query("api::job-listing.job-listing").findMany({
            ...queryOptions,
            where: ctx.query.filters,
            populate: {
              profession: {
                select: ["id", "name"],
              },
              department: {
                select: ["id", "name"],
              },
              work_mode: {
                select: ["id", "name"],
              },
              position: {
                select: ["id", "name"],
              },
              company: {
                select: ["id", "companyName"],
                populate: {
                  logo: {
                    select: ["id", "url"],
                  },
                  sector: {
                    select: ["id", "name"],
                  },
                },
              },
            },
          }),
          strapi.db.query("api::job-listing.job-listing").count({
            where: ctx.query.filters
          })
        ]);

        return {
          data: entries,
          meta: {
            pagination: {
              page: parseInt(page),
              pageSize: parseInt(pageSize),
              pageCount: Math.ceil(count / pageSize),
              total: count,
            }
          }
        };
      }

      if (user.role.name === "Employee") {
        const [entries, count] = await Promise.all([
          strapi.db.query("api::job-listing.job-listing").findMany({
            ...queryOptions,
            where: ctx.query.filters || {},
            populate: true,
          }),
          strapi.db.query("api::job-listing.job-listing").count({
            where: ctx.query.filters || {}
          })
        ]);

        return {
          data: entries,
          meta: {
            pagination: {
              page: parseInt(page),
              pageSize: parseInt(pageSize),
              pageCount: Math.ceil(count / pageSize),
              total: count,
            }
          }
        };
      }
      
      const companyProfiles = await strapi.db
        .query("api::company-profile.company-profile")
        .findMany({
          where: { owner: user.id },
          select: ["id"],
        });

      if (companyProfiles.length === 0) return { 
        data: [],
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            pageCount: 0,
            total: 0,
          }
        }
      };

      ctx.query = {
        ...ctx.query,
        filters: {
          ...(typeof ctx.query.filters === "object" &&
          ctx.query.filters !== null
            ? ctx.query.filters
            : {}),
          company: companyProfiles[0].id,
        },
      };

      const [entries, count] = await Promise.all([
        strapi.db.query("api::job-listing.job-listing").findMany({
          ...queryOptions,
          where: ctx.query.filters,
          populate: true,
        }),
        strapi.db.query("api::job-listing.job-listing").count({
          where: ctx.query.filters
        })
      ]);

      return {
        data: entries,
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            pageCount: Math.ceil(count / pageSize),
            total: count,
          }
        }
      };
    },

    async findOne(ctx) {
      const { id: documentId } = ctx.params;
      const user = ctx.state.user;

      const job = await strapi.db.query("api::job-listing.job-listing").findOne({
        where: { documentId },
        populate: true,
      });

      if (!job) {
        return ctx.notFound("İlan bulunamadı");
      }

      if (user?.role?.name === "Employee") {
        return { data: job };
      }

      if (!user) {
        if (job.jobStatus === "Active") {
          return { data: job };
        }
        return ctx.notFound("İlan bulunamadı");
      }
      
      const companyProfile = await strapi.db
        .query("api::company-profile.company-profile")
        .findOne({
          where: { owner: user.id },
        });

      if (companyProfile && companyProfile.id === job.company?.id) {
        return { data: job };
      }

      if (job.jobStatus === "Active") {
        return { data: job };
      }

      return ctx.notFound("İlan bulunamadı");
    },

    async create(ctx) {
      const user = ctx.state.user;

      if (user.role.name !== "Employee") {
        const companyProfile = await strapi.db
          .query("api::company-profile.company-profile")
          .findMany({
            where: { owner: user.id },
            select: ["id"],
          });

        if (companyProfile.length === 0) {
          return ctx.notFound("Şirket profiliniz bulunmamaktadır");
        }

        // Posting right kontrolü
        const postingRight = await strapi.db
          .query("api::posting-right.posting-right")
          .findOne({
            where: { company: companyProfile[0].id },
          });

        if (!postingRight) {
          return ctx.notFound("İlan yayınlama hakkınız bulunmamaktadır");
        }

        if (postingRight.postingsUsed >= postingRight.postingQuota) {
          return ctx.notFound("İlan yayınlama kotanız dolmuştur");
        }

        ctx.request.body.data.company = companyProfile[0].id;
        ctx.request.body.data.jobStatus = "Pending";

        const job = await strapi.db.query("api::job-listing.job-listing").create({
          data: ctx.request.body.data,
        });

        // Posting right güncelleme
        await strapi.db.query("api::posting-right.posting-right").update({
          where: { id: postingRight.id },
          data: {
            postingsUsed: postingRight.postingsUsed + 1,
          },
        });

        return { data: job };
      }

      const job = await strapi.db.query("api::job-listing.job-listing").create({
        data: ctx.request.body.data,
      });

      return { data: job };
    },

    async update(ctx) {
      const { id } = ctx.params;
      const { jobStatus } = ctx.request.body.data;

      // Sadece jobStatus değişikliği için kontrol
      if (jobStatus) {
        const job = await strapi.db.query("api::job-listing.job-listing").findOne({
          where: { id },
          populate: ['company'],
        });

        if (!job) {
          return ctx.notFound("İlan bulunamadı");
        }

        if (job.jobStatus === "Active" && jobStatus === "Active") {
          return ctx.badRequest("İlan zaten aktif durumda");
        }

        if (job.jobStatus === "Expired" && jobStatus === "Active") {
          return ctx.badRequest("Süresi dolmuş ilanı aktif yapamazsınız");
        }

        // NOT: İlan oluşturulurken zaten posting right kullanılıyor (create metodunda)
        // Bu yüzden "Pending" -> "Active" değişikliğinde posting right tekrar azaltılmamalı
        // Sadece kota kontrolü yap ama azaltma
        if (jobStatus === "Active" && job.jobStatus === "Pending") {
          const postingRight = await strapi.db
            .query("api::posting-right.posting-right")
            .findOne({
              where: { company: job.company.id },
            });

          if (!postingRight) {
            return ctx.badRequest("İlan yayınlama hakkınız bulunmamaktadır");
          }

          // Kota kontrolü - ama artık AZALTMA YAPMA çünkü create'de zaten azaltıldı
          // Bu kontrol sadece güvenlik için (eğer birisi manuel olarak pending'e çevirip tekrar active yaparsa)
        }
      }

      const job = await strapi.db.query("api::job-listing.job-listing").update({
        where: { id },
        data: ctx.request.body.data,
      });

      return { data: job };
    },

    async delete(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      const job = await strapi.db.query("api::job-listing.job-listing").findOne({
        where: { id },
        populate: ['company'],
      });

      if (!job) {
        return ctx.notFound("İlan bulunamadı");
      }

      const companyProfile = await strapi.db
        .query("api::company-profile.company-profile")
        .findOne({
          where: { owner: user.id },
        });

        if (user.role.name !== 'Employee') {
          const companyProfile = await strapi.db
            .query("api::company-profile.company-profile")
            .findOne({
              where: { owner: user.id },
            });
      
          if (!companyProfile || companyProfile.id !== job.company?.id) {
            return ctx.forbidden("Bu işlemi yapmaya yetkiniz yok");
          }
        }

      if (job.jobStatus === "Active") {
        const postingRight = await strapi.db
          .query("api::posting-right.posting-right")
          .findOne({
            where: { company: job.company.id },
          });

        if (postingRight) {
          await strapi.db.query("api::posting-right.posting-right").update({
            where: { id: postingRight.id },
            data: {
              postingsUsed: postingRight.postingsUsed - 1,
            },
          });
        }
      }

      const deletedJob = await strapi.db
        .query("api::job-listing.job-listing")
        .delete({
          where: { id },
        });

      return { data: deletedJob };
    },
  })
);