'use strict';

/**
 * worker controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const crypto = require('crypto');

module.exports = createCoreController('api::worker.worker', ({ strapi }) => ({
  /**
   * Override find method to filter by company
   */
  async find(ctx) {
    try {
      // Get current user
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Oturum açmanız gerekiyor');
      }

      // Get user's company profile
      const companyProfile = await strapi.db.query('api::company-profile.company-profile').findOne({
        where: { owner: user.id }
      });

      if (!companyProfile) {
        return ctx.notFound('Şirket profili bulunamadı');
      }

      // Add company filter to query
      ctx.query = {
        ...ctx.query,
        filters: {
          ...ctx.query.filters,
          company: {
            id: companyProfile.id
          }
        }
      };

      // Call default find method with updated query
      const { data, meta } = await super.find(ctx);
      return { data, meta };
    } catch (error) {
      console.error('Error in worker find:', error);
      return ctx.badRequest('Çalışanlar yüklenirken hata oluştu');
    }
  },

  /**
   * Override create method - Don't create user, just create worker
   */
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // Just create worker with the data from frontend
      // Frontend already creates the user separately
      const entity = await strapi.entityService.create('api::worker.worker', {
        data: data,
        populate: ['department', 'branch', 'position', 'company', 'user']
      });

      return this.transformResponse(entity);
    } catch (error) {
      console.error('Error in worker create:', error);
      return ctx.badRequest(error.message || 'Worker creation failed');
    }
  },

  /**
   * Override update method to update worker's user account
   */
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      // Get existing worker
      const worker = await strapi.db.query('api::worker.worker').findOne({
        where: { documentId: id },
        populate: ['user']
      });

      if (!worker) {
        return ctx.notFound('Worker not found');
      }

      // NOT: Password ve user account yönetimi kaldırıldı - farklı yöntem uygulanacak

      // Update worker
      const entity = await strapi.entityService.update('api::worker.worker', worker.id, {
        data,
        populate: ['department', 'branch', 'position', 'company', 'user']
      });

      return this.transformResponse(entity);
    } catch (error) {
      console.error('Error in worker update:', error);
      return ctx.badRequest('Worker update failed');
    }
  },

  /**
   * Generate upload token for a worker
   * POST /api/workers/:id/generate-token
   */
  async generateToken(ctx) {
    try {
      const { id } = ctx.params;

      // Get worker by documentId
      const worker = await strapi.db.query('api::worker.worker').findOne({
        where: { documentId: id },
        populate: ['company']
      });

      if (!worker) {
        return ctx.notFound('Çalışan bulunamadı');
      }

      // Check if user has permission (only company owner can generate tokens)
      const user = ctx.state.user;
      if (user && worker.company && worker.company.id) {
        const companyProfile = await strapi.db.query('api::company-profile.company-profile').findOne({
          where: { id: worker.company.id },
          populate: ['owner']
        });

        if (!companyProfile || !companyProfile.owner || companyProfile.owner.id !== user.id) {
          return ctx.forbidden('Bu çalışan için token oluşturamazsınız');
        }
      }

      // Generate unique token
      const uploadToken = crypto.randomBytes(32).toString('hex');
      
      // Set expiration date (30 days from now)
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30);

      // Update worker with token
      const updatedWorker = await strapi.db.query('api::worker.worker').update({
        where: { id: worker.id },
        data: {
          uploadToken,
          tokenExpiresAt
        }
      });

      // Generate upload URL
      const uploadUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/belge-yukle?token=${uploadToken}`;

      return ctx.send({
        data: {
          uploadToken,
          uploadUrl,
          expiresAt: tokenExpiresAt,
          worker: {
            id: updatedWorker.documentId,
            firstName: updatedWorker.firstName,
            lastName: updatedWorker.lastName,
            email: updatedWorker.email
          }
        }
      });
    } catch (error) {
      console.error('Token generation error:', error);
      return ctx.internalServerError('Token oluşturulurken bir hata oluştu');
    }
  },

  /**
   * Get worker by upload token (public route)
   * GET /api/workers/by-token/:token
   */
  async getByToken(ctx) {
    try {
      const { token } = ctx.params;

      const worker = await strapi.db.query('api::worker.worker').findOne({
        where: { uploadToken: token },
        populate: [
          'photo',
          'criminalRecordDoc',
          'populationRegistryDoc',
          'identityDoc',
          'residenceDoc',
          'militaryDoc'
        ]
      });

      if (!worker) {
        return ctx.notFound('Geçersiz token');
      }

      // Check if token is expired
      if (worker.tokenExpiresAt && new Date(worker.tokenExpiresAt) < new Date()) {
        return ctx.forbidden('Token süresi dolmuş');
      }

      // Return limited worker data (don't expose sensitive info)
      return ctx.send({
        data: {
          id: worker.documentId,
          firstName: worker.firstName,
          lastName: worker.lastName,
          photo: worker.photo,
          documents: {
            criminalRecordDoc: !!worker.criminalRecordDoc,
            populationRegistryDoc: !!worker.populationRegistryDoc,
            identityDoc: !!worker.identityDoc,
            residenceDoc: !!worker.residenceDoc,
            militaryDoc: !!worker.militaryDoc
          }
        }
      });
    } catch (error) {
      console.error('Get by token error:', error);
      return ctx.internalServerError('Bir hata oluştu');
    }
  },

  /**
   * Upload document for worker (public route with token validation)
   * POST /api/workers/upload-document
   */
  async uploadDocument(ctx) {
    try {
      const { token, documentType } = ctx.request.body;
      const files = ctx.request.files;

      if (!token || !documentType) {
        return ctx.badRequest('Token ve belge türü gereklidir');
      }

      if (!files || !files.file) {
        return ctx.badRequest('Dosya yüklenmelidir');
      }

      // Validate document type
      const validDocTypes = [
        'criminalRecordDoc',
        'populationRegistryDoc',
        'identityDoc',
        'residenceDoc',
        'militaryDoc'
      ];

      if (!validDocTypes.includes(documentType)) {
        return ctx.badRequest('Geçersiz belge türü');
      }

      // Validate file type (only PDF)
      const file = files.file;
      if (file.type !== 'application/pdf') {
        return ctx.badRequest('Sadece PDF formatında dosya yükleyebilirsiniz');
      }

      // Find worker by token
      const worker = await strapi.db.query('api::worker.worker').findOne({
        where: { uploadToken: token }
      });

      if (!worker) {
        return ctx.notFound('Geçersiz token');
      }

      // Check if token is expired
      if (worker.tokenExpiresAt && new Date(worker.tokenExpiresAt) < new Date()) {
        return ctx.forbidden('Token süresi dolmuş');
      }

      // Upload file to Strapi
      const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
        data: {
          fileInfo: {
            name: `${documentType}_${worker.firstName}_${worker.lastName}`,
            caption: `${documentType} for ${worker.firstName} ${worker.lastName}`
          }
        },
        files: file
      });

      if (!uploadedFiles || uploadedFiles.length === 0) {
        return ctx.internalServerError('Dosya yüklenemedi');
      }

      const uploadedFile = uploadedFiles[0];

      // Update worker with document
      const updatedWorker = await strapi.db.query('api::worker.worker').update({
        where: { id: worker.id },
        data: {
          [documentType]: uploadedFile.id
        },
        populate: [
          'criminalRecordDoc',
          'populationRegistryDoc',
          'identityDoc',
          'residenceDoc',
          'militaryDoc'
        ]
      });

      return ctx.send({
        data: {
          message: 'Belge başarıyla yüklendi',
          documentType,
          documents: {
            criminalRecordDoc: !!updatedWorker.criminalRecordDoc,
            populationRegistryDoc: !!updatedWorker.populationRegistryDoc,
            identityDoc: !!updatedWorker.identityDoc,
            residenceDoc: !!updatedWorker.residenceDoc,
            militaryDoc: !!updatedWorker.militaryDoc
          }
        }
      });
    } catch (error) {
      console.error('Document upload error:', error);
      return ctx.internalServerError('Belge yüklenirken bir hata oluştu');
    }
  },

  /**
   * Get workers for a company with document status
   * GET /api/workers/company/:companyId
   */
  async getCompanyWorkers(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Giriş yapmalısınız');
      }

      // Get user's company profile
      const companyProfile = await strapi.db.query('api::company-profile.company-profile').findOne({
        where: { owner: user.id }
      });

      if (!companyProfile) {
        return ctx.forbidden('Şirket profili bulunamadı');
      }

      // Get all workers for this company
      const workers = await strapi.db.query('api::worker.worker').findMany({
        where: { 
          company: companyProfile.id,
          isActive: true
        },
        populate: [
          'photo',
          'department',
          'criminalRecordDoc',
          'populationRegistryDoc',
          'identityDoc',
          'residenceDoc',
          'militaryDoc'
        ],
        orderBy: { createdAt: 'desc' }
      });

      // Format response with document status
      const formattedWorkers = workers.map(worker => ({
        id: worker.documentId,
        firstName: worker.firstName,
        lastName: worker.lastName,
        email: worker.email,
        phone: worker.phone,
        photo: worker.photo,
        department: worker.department,
        hireDate: worker.hireDate,
        profession: worker.profession,
        uploadToken: worker.uploadToken,
        tokenExpiresAt: worker.tokenExpiresAt,
        documents: {
          criminalRecordDoc: !!worker.criminalRecordDoc,
          populationRegistryDoc: !!worker.populationRegistryDoc,
          identityDoc: !!worker.identityDoc,
          residenceDoc: !!worker.residenceDoc,
          militaryDoc: !!worker.militaryDoc
        }
      }));

      return ctx.send({
        data: formattedWorkers
      });
    } catch (error) {
      console.error('Get company workers error:', error);
      return ctx.internalServerError('Çalışanlar yüklenirken bir hata oluştu');
    }
  },

  /**
   * Calculate severance and notice pay for a worker
   * POST /api/workers/:id/calculate-severance
   */
  async calculateSeverance(ctx) {
    try {
      const { id } = ctx.params;
      const { netSalary, noticeWeeks } = ctx.request.body;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('Giriş yapmalısınız');
      }

      if (!netSalary || !noticeWeeks) {
        return ctx.badRequest('Net maaş ve ihbar haftası bilgileri gereklidir');
      }

      // Get worker by documentId
      const worker = await strapi.db.query('api::worker.worker').findOne({
        where: { documentId: id },
        populate: ['company']
      });

      if (!worker) {
        return ctx.notFound('Çalışan bulunamadı');
      }

      // Check if user has permission
      const companyProfile = await strapi.db.query('api::company-profile.company-profile').findOne({
        where: { id: worker.company.id },
        populate: ['owner']
      });

      if (!companyProfile || !companyProfile.owner || companyProfile.owner.id !== user.id) {
        return ctx.forbidden('Bu çalışan için tazminat hesaplayamazsınız');
      }

      // Calculate years of service
      const hireDate = new Date(worker.hireDate);
      const terminationDate = worker.terminationDate ? new Date(worker.terminationDate) : new Date();
      const yearsOfService = (terminationDate - hireDate) / (365.25 * 24 * 60 * 60 * 1000);

      // Convert net salary to gross (approximate)
      const grossSalary = netSalary * 1.175;

      // Calculate severance pay (Kıdem Tazminatı)
      // Formula: Gross salary × Years of service
      const grossSeverance = grossSalary * Math.floor(yearsOfService);
      
      // Deduct stamp tax (0.759%)
      const netSeverance = grossSeverance * 0.99241;

      // Calculate notice pay (İhbar Tazminatı)
      // Formula: (Gross salary / 30) × (Notice weeks × 7)
      const noticeDays = noticeWeeks * 7;
      const grossNoticePay = (grossSalary / 30) * noticeDays;
      
      // Deduct stamp tax (0.759%)
      const netNoticePay = grossNoticePay * 0.99241;

      // Total compensation
      const totalCompensation = netSeverance + netNoticePay;

      return ctx.send({
        data: {
          worker: {
            id: worker.documentId,
            firstName: worker.firstName,
            lastName: worker.lastName,
            hireDate: worker.hireDate,
            terminationDate: terminationDate
          },
          calculation: {
            netSalary,
            grossSalary: Math.round(grossSalary * 100) / 100,
            yearsOfService: Math.floor(yearsOfService),
            noticeWeeks,
            noticeDays,
            severance: {
              gross: Math.round(grossSeverance * 100) / 100,
              net: Math.round(netSeverance * 100) / 100
            },
            noticePay: {
              gross: Math.round(grossNoticePay * 100) / 100,
              net: Math.round(netNoticePay * 100) / 100
            },
            totalCompensation: Math.round(totalCompensation * 100) / 100
          }
        }
      });
    } catch (error) {
      console.error('Calculate severance error:', error);
      return ctx.internalServerError('Tazminat hesaplanırken bir hata oluştu');
    }
  },

  /**
   * Bulk import workers from Excel
   * POST /api/workers/bulk-import
   */
  async bulkImport(ctx) {
    try {
      const { workers } = ctx.request.body;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('Giriş yapmalısınız');
      }

      if (!workers || !Array.isArray(workers) || workers.length === 0) {
        return ctx.badRequest('Çalışan listesi gereklidir');
      }

      // Get user's company profile
      const companyProfile = await strapi.db.query('api::company-profile.company-profile').findOne({
        where: { owner: user.id }
      });

      if (!companyProfile) {
        return ctx.forbidden('Şirket profili bulunamadı');
      }

      const createdWorkers = [];
      const errors = [];

      // NOT: Worker role kontrolü kaldırıldı - user account oluşturma devre dışı

      for (let i = 0; i < workers.length; i++) {
        const workerData = workers[i];
        
        try {
          // Validate required fields
          if (!workerData.firstName || !workerData.lastName || !workerData.email || !workerData.hireDate) {
            errors.push({
              row: i + 1,
              error: 'Ad, Soyad, Email ve İşe Giriş Tarihi zorunludur'
            });
            continue;
          }

          // Check if email already exists in workers
          const existingWorker = await strapi.db.query('api::worker.worker').findOne({
            where: { email: workerData.email }
          });

          if (existingWorker) {
            errors.push({
              row: i + 1,
              error: `Email zaten kullanımda: ${workerData.email}`
            });
            continue;
          }

          // NOT: User account oluşturma kaldırıldı - şifre sistemi için farklı yöntem uygulanacak
          
          // Create worker
          const newWorker = await strapi.db.query('api::worker.worker').create({
            data: {
              ...workerData,
              company: companyProfile.id,
              isActive: true
            }
          });

          createdWorkers.push(newWorker);
        } catch (error) {
          console.error(`Bulk import row ${i + 1} error:`, error);
          errors.push({
            row: i + 1,
            error: error.message
          });
        }
      }

      return ctx.send({
        data: {
          success: createdWorkers.length,
          failed: errors.length,
          createdWorkers: createdWorkers.map(w => ({
            id: w.documentId,
            firstName: w.firstName,
            lastName: w.lastName,
            email: w.email
          })),
          errors
        }
      });
    } catch (error) {
      console.error('Bulk import error:', error);
      return ctx.internalServerError('Toplu çalışan eklenirken bir hata oluştu');
    }
  }
}));

