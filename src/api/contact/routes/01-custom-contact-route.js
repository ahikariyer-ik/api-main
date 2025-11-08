
module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/contacts/public',
        handler: 'contact.public',
        config: {
          auth: false, // Dışarıdan erişilebilir
        }
      }
    ]
  } 