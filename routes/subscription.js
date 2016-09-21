'use strict'

const Boom = require('boom')

// All the API Joi schemas
const planSchema = require('./schema/planSchema')
const planById = require('./schema/planByIdSchema')

function standardActResponse (reply) {
  return function (err, data) {
    // TODO: No llega aqui
    if (err) {
      if (err.isBoom) {
        reply(err)
      } else {
        reply(Boom.internal(err))
      }
      return
    }

    // If we want to send another status code use the internal payload object
    if (data.status && data.body) {
      return reply.payload().code(data.status).send(data.body)
    }

    return reply(data)
  }
}

module.exports = [
  {
    method: 'GET',
    path: '/api/plan',
    config: {
      auth: 'simple',
      description: 'Get plans list',
      notes: 'Get all platform plans list',
      tags: ['api', 'plan', 'list']
    },
    handler: function (request, reply) {
      var pattern = {role: 'books', cmd: 'getAll'}
      var payload = {
        driver: request.auth.artifacts.corbelDriver,
        domain: request.auth.artifacts.tokenObject.getDomainId()
      }

      request.seneca.act(pattern, payload, standardActResponse(reply))
    }
  },
  {
    method: 'GET',
    path: '/api/plan/{planId}',
    config: {
      auth: 'simple',
      description: 'Get plan by id',
      notes: 'foo',
      tags: ['api', 'plan', 'get'],
      validate: {
        params: planById
      }
    },
    handler: function (request, reply) {
      var pattern = {role: 'subscription', cmd: 'getById'}
      var payload = {
        driver: request.auth.artifacts.corbelDriver,
        domain: request.auth.artifacts.tokenObject.getDomainId()
      }

      request.seneca.act(pattern, payload, standardActResponse(reply))
    }
  },
  {
    method: 'POST',
    path: '/api/plan',
    config: {
      auth: 'simple',
      description: 'Create plan',
      notes: 'foo',
      tags: ['api', 'plan', 'create'],
      validate: {
        payload: planSchema
      }
    },
    handler: function (request, reply) {
      var pattern = {role: 'subscription', cmd: 'create'}
      var payload = {
        driver: request.auth.artifacts.corbelDriver,
        domain: request.auth.artifacts.tokenObject.getDomainId()
      }

      request.seneca.act(pattern, payload, standardActResponse(reply))
    }
  },
  {
    method: 'GET',
    path: '/api/subscription/{userId}',
    config: {
      auth: 'simple',
      description: 'Get user subscription',
      notes: 'foo',
      tags: ['api', 'subscription', 'get']
    },
    handler: function (request, reply) {
      var pattern = {role: 'subscription', cmd: 'get', userId: request.params.userId}
      var payload = {
        driver: request.auth.artifacts.corbelDriver,
        domain: request.auth.artifacts.tokenObject.getDomainId()
      }

      request.seneca.act(pattern, payload, standardActResponse(reply))
    }
  },
  {
    method: 'DELETE',
    path: '/api/subscription/{userId}/{subscriptionId}',
    config: {
      auth: 'simple',
      description: 'Delete user subscription',
      tags: ['api', 'subscription', 'delete']
    },
    handler: function (request, reply) {
      var pattern = {role: 'subscription', cmd: 'remove', userId: request.params.userId, subscriptionId: request.params.subscriptionId}
      var payload = {
        driver: request.auth.artifacts.corbelDriver,
        domain: request.auth.artifacts.tokenObject.getDomainId()
      }

      request.seneca.act(pattern, payload, standardActResponse(reply))
    }
  },
  {
    method: 'POST',
    path: '/api/subscription/{planId}/{userId}',
    config: {
      auth: 'simple',
      description: 'Create user subscription',
      notes: 'implemented logic only for requests from composr',
      tags: ['api', 'subscription', 'create']
    },
    handler: function (request, reply) {
      var pattern = {role: 'subscription', cmd: 'add', planId: request.params.planId, userId: request.params.userId}
      var payload = {
        driver: request.auth.artifacts.corbelDriver,
        domain: request.auth.artifacts.tokenObject.getDomainId()
      }

      request.seneca.act(pattern, payload, standardActResponse(reply))
    }
  },
  // Default routes
  {
    method: ['POST', 'DELETE', 'PUT'],
    path: '/{path*}',
    handler: function (request, reply) {
      reply(Boom.notFound('missing'))
    }
  },
  // Status page
  {
    method: 'GET',
    path: '/{path*}',
    handler: function (request, reply) {
      reply('Hello from WS-SUBSCRIPTION EBOOKS')
    }
  }
]
