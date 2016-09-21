'use strict'

var Lab = require('lab')
var Code = require('code')

var lab = exports.lab = Lab.script()
var expect = Code.expect
var sinon = require('sinon')
var proxyquire = require('proxyquire')

var sandbox = sinon.sandbox.create()

// Stubs
var userPlanServiceStub = require('./stubs/userPlanServiceStub')(sandbox)
var corbelStubs = require('./stubs/corbelStubs')(sandbox)

var proxiedDeps = {
  './userPlanService': userPlanServiceStub,
  '../../connectors/corbel': corbelStubs.corbelStoreStub
}

var subscriptionService = proxyquire('../../lib/service/subscriptionService', proxiedDeps)

lab.experiment('Subscription service', () => {
  lab.beforeEach((done) => {
    sandbox.restore()
    done()
  })

  lab.test('exists module', (done) => {
    expect(subscriptionService).to.be.an.object()
    done()
  })

  lab.experiment('add subscription', () => {
    lab.experiment('Preconditions', () => {
      lab.test('if it does not has payment methods, reject', (done) => {

        //Stub subscribe
        subscriptionService.subscribe = sandbox.stub().returns(Promise.resolve(null))

        subscriptionService.add({}, 'domain', 'user', 'plan', {}, (err, res) => {
          expect(err).not.to.be.null
          expect(subscriptionService.subscribe.callCount).to.equals(1)
          done()
        })
      })

    })

  })
})
