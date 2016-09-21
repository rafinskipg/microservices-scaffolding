'use strict'

function getCorbelStubs (sandbox) {
  var apiStub = {
    get: sandbox.stub().returns(Promise.resolve()),
    add: sandbox.stub().returns(Promise.resolve())
  }

  var collectionStub = sandbox.stub().returns(apiStub)

  var resourcesStub = {
    collection: collectionStub
  }

  var corbelStub = {
    domain: () => corbelStub,
    resources: resourcesStub
  }

  var corbelStoreStub = {
    get: () => corbelStub
  }

  return {
    corbelStoreStub,
    corbelStub,
    resourcesStub,
    collectionStub,
    apiStub}
}

module.exports = getCorbelStubs
