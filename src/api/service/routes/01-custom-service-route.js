
module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/services/slug/:slug',
        handler: 'service.findBySlug',
        config: {
          policies: [],
          auth: false,
        }
      }
    ]
  } 