'use strict'
/**
 *  eBooks 2.0 microservice scaffolding
 */

// Our hapi server bits
const Chairo = require('chairo')
const Hapi = require('hapi')
const Config = require('config')
const Path = require('path')
const Seneca = require('seneca')()
const debug = require('debug')('service')
const error = require('debug')('error')

// const Entities = require('seneca-entity')

// Our server routes
const ApiRoutes = require('../routes')

// Our middlewares
const authMiddleware = require('../middlewares/authToken')

// Our actions
const ActionSubscription = '../lib/subscription_plugin'

// Bind connections
const bindConnections = require('./bindConnections')

const envs = process.env
const opts = {
  seneca: {
    tag: envs.SERVICE_TAG || 'ws-thing',
    strict: {
      result: false,
      add: false,
      find: true,
      maxloop: 11
    }
  },
  vidi_metrics: {
    emitter: {
      enabled: false
    }
  },
  seneca_metrics: {
    group: 'project',
    tag: 'ws-thing',
    pins: [
      'role:info,cmd:get',
      'role:search,cmd:search'
    ]
  }
}

function endIfErr (err) {
  if (err) {
    error(err)
    process.exit(1)
  }
}

const service = new Hapi.Server()

service.connection({
  port: Config.get('port') || 3000
})

// Add custom middlewares
authMiddleware(service)

const plugins = [
  require('inert'),
  require('vision'),
  {register: Chairo, options: {seneca: Seneca}},
  {register: require('lout')},
  {register: require('blipp'), options: {}}
]

service.register(plugins, (err) => {
  endIfErr(err)

  service.route(ApiRoutes)

  var seneca = service.seneca

  if (envs.RUN_ISOLATED) {
    seneca.add('role:info,cmd:get', (msg, done) => {
      try {
        var dummyDataPath = Path.join(__dirname, '../test/dummy/')

        done(null, JSON.parse(require('fs').readFileSync(dummyDataPath + msg.name)))
      } catch (e) {
        done(null, {})
      }
    })
  } else {
    // ActionSubscription
    seneca.use(ActionSubscription, opts)

    // metrics
    seneca.use('vidi-metrics', opts.vidi_metrics)

    seneca.use('vidi-seneca-metrics', opts.seneca_metrics)
  }
  // Process title and info starup
  process.title = Config.get('name')
  seneca.log.info('hapi', service.info)

  // Connect to external services
  bindConnections(() => {
    service.start(() => {
      debug('Server running at:', service.info.uri)
    })
  })
})
