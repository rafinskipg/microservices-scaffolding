'use strict'

// Connects to corbel and rabbit
const corbelConnector = require('../connectors/corbel')
const rabbitConnector = require('../connectors/rabbit')
const someWorker = require('../lib/worker/someWorker.worker')
const debug = require('debug')('service')

function listenTrialMessages () {
  rabbitConnector
    .addConnection({
      queue: 'myqueue-queue',
      exchange: 'subscription',
      cb: function (err, data) {
        if (!err) {
          workerTrialEnd(data)
        }
      }
    })

  debug('Subscribed to Tasks')
}

function listenECMessages () {
  rabbitConnector
    .addEventBusConnection({
      queue: 'worker-eventbus-corbel',
      cb: function (err, data) {
        if (!err) {
          someWorker(data)
        }
      }
    })
  debug('Subscribed to eventbus')
}

module.exports = function initConnections (done) {
  corbelConnector.init()
    .then(() => {
      debug('Corbel connected')

      listenECMessages()
    })

  done()
}
