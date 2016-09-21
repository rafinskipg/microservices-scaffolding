'use strict'

var config = require('config')
var url = require('url')
var path = require('path')
var assert = require('assert-plus')
var easyAmqp = require('easy-amqp')
var conn = null

const rabbitUrl = config.get('rabbitmq.uri')
const EVENT_BUS_EXCHANGE = 'eventbus.exchange' // Nos conectamos al eventbus de corbel

function addConnections (connections) {
  assert.arrayOfObject(connections)

  connections.forEach(function (connection) {
    if (connection.collection) {
      addEventBusConnection(connection)
    } else {
      addConnection(connection)
    }
  })
}

/*
 connection: {
  queue : '',
  exchange: '',
  cb: function(msg) {}
 }
*/
function addConnection (connection) {
  assert.func(connection.cb)
  assert.string(connection.exchange)
  assert.string(connection.queue)

  if (!conn) {
    conn = easyAmqp
      .createConnection(rabbitUrl)
  }

  conn.queue(connection.queue)
    .bind(connection.exchange, '')
    .subscribe(function (msg) {
      if (msg) {
        connection.cb(msg)
      }
    })
}

/*
  connection: {
    queue: 'my-queue'
    collection: books:Book
    actions: ['CREATE', 'UPDATE', 'DELETE'],
    cb : function(err, item){
        // Item : { action: 'CREATE', elementId : 'resourceId'}
    }
  }

*/
function addEventBusResourcesConnection (connection) {
  assert.func(connection.cb)
  assert.string(connection.queue)
  assert.string(connection.collection)
  assert.arrayOfString(connection.actions)

  function cb (msg) {
    var type = msg.type
    var action = msg.action
    // actions can be CREATE UDPATE DELETE
    if (type === connection.collection && action.indexOf(connection.action) !== -1) {
      try {
        var urlFormated = url.parse(msg.resourceId)
        var elementId = msg.resourceId.indexOf('http') !== -1 ? path.parse(urlFormated.pathname).name : msg.resourceId

        // Return the ID of the element that
        connection.cb(null, {
          action: action,
          elementId: elementId
        })
      } catch (e) {
        connection.cb(e, null)
      }
    }
  }

  addEventBusConnection({
    queue: connection.queue,
    cb: cb
  })
}

/*
  connection: {
    queue: 'my-queue'
    collection: books:Book
    actions: ['CREATE', 'UPDATE', 'DELETE'],
    cb : function(err, item){
        // Item : { action: 'CREATE', elementId : 'resourceId'}
    }
  }

*/
function addEventBusConnection (connection) {
  assert.func(connection.cb)
  assert.string(connection.queue)

  function cb (msg) {
    if (msg) {
      connection.cb(msg)
    }
  }

  addConnection({
    queue: connection.queue,
    exchange: EVENT_BUS_EXCHANGE,
    cb: cb
  })
}

function publish (exchange, routingKey, message) {
  conn
    .exchange(exchange)
    .publish(routingKey, message)
}

module.exports = {
  addConnection,
  addConnections,
  addEventBusResourcesConnection,
  addEventBusConnection,
  publish}
