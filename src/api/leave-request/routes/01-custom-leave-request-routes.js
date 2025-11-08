'use strict';

module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/leave-requests/:id/approve',
      handler: 'leave-request.approve',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/leave-requests/:id/reject',
      handler: 'leave-request.reject',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/leave-requests/worker/:workerId/remaining-days',
      handler: 'leave-request.getRemainingDays',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

