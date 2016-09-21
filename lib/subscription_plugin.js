'use strict'

const subscriptionService = require('./service/subscriptionService')
const trace = require('debug')('trace')
const error = require('debug')('error')

var Boom = require('boom')

var defaults = {
  plugin: 'books',
  role: 'get'
}

function wrappedCallback (cb) {
  return function (err, resp) {
    trace('ended request subscription')

    if (err) {
      error('Error in request %s %s', err.status, err.data)
      // Actions must always reply with an Error instance
      return cb(Boom.create(err.status, err.message, err.data), null)
    }

    trace('no error in request')
    cb(null, resp)
  }
}

module.exports = function (opts) {
  var seneca = this
  var extend = seneca.util.deepextend

  opts = extend(defaults, opts)

  // Adds the plan to the user
  this.add('role:subscription,cmd:add', function (msg, cb) {
    subscriptionService.add(msg.driver, msg.domain, msg.userId, msg.planId, {}, wrappedCallback(cb))
  })

  // Creates the plan entity
  this.add('role:subscription,cmd:create', function (msg, cb) {
    planService.add(msg.driver, msg.domain, msg.payload, wrappedCallback(cb))
  })

  // Gets all the plans
  this.add('role:subscription,cmd:getAll', function (msg, cb) {
    subscriptionService.list(msg.driver, wrappedCallback(cb))
  })

  // Gets one plan by id
  this.add('role:subscription,cmd:getById', function (msg, cb) {
    subscriptionService.get(msg.driver, msg.userId, wrappedCallback(cb))
  })

  // Remove subscription from user
  this.add('role:subscription,cmd:remove', function (msg, cb) {
    subscriptionService.remove(msg.driver, msg.userId, msg.subscriptionId, wrappedCallback(cb))
  })

  // Microservice wrapping, see : http://senecajs.org/get-started/#writing-microservices
  this.wrap('role:subscription', function (msg, respond) {
    msg.userId = msg.userId ? msg.userId : 'me'

    this.prior(msg, respond)
  })

  return opts.plugin
}
