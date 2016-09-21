'use strict'

var Lab = require('lab')
var Code = require('code')
var index = require('../common/index.js')

var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it
var expect = Code.expect

var senecaInstance = index.init().addRoutes()

// Function.prototype.call(senecaInstance.seneca.use,senecaInstance.seneca)

process.setMaxListeners(999)

describe('A valid role:info,req:part call', () => {
  it('Has no error and has data', (done) => {
    var payload = {
      name: 'seneca-entity'
    }

    senecaInstance.seneca.act('role:books,cmd:get', payload, (err, reply) => {
      expect(err).to.not.exist()
      expect(reply).to.exist()
      done()
    })
  })

  it('Responds via role:info,res:part', (done) => {
    var payload = {
      name: 'seneca-entity'
    }

    senecaInstance.seneca.act('role:info,res:part', payload, function (err, reply) {
      expect(err).to.not.exist()
      expect(reply).to.exist()
      done()
    })
  })
})
