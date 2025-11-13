
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/about-pages/public',
      handler: 'about-page.public',
      config: {
        auth: false, // Dışarıdan erişilebilir
      }
    }
  ]
}

