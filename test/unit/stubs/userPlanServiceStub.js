'use strict'

function userPlanServiceStub (sandbox) {
  return {
    subscribe: sandbox.stub().returns(Promise.resolve()),
    other: sandbox.stub().yields(null, {})
  }
}

module.exports = userPlanServiceStub
