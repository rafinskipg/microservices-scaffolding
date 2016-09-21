'use strict'

const config = require('config')
const corbel = require('corbel-js')
const trace = require('debug')('trace')

function corbelDriverSetup (token, domain) {
  var corbelConfig = {
    urlBase: config.get('corbel.options.urlBase'),
    iamToken: {
      accessToken: token
    },
    domain: domain
  }

  var corbelDriver = corbel.getDriver(corbelConfig)

  corbelDriver.on('request', function(data){
    trace('Corbel user request token: %s, method %s, url %s', data.headers.Authorization, data.method, data.url);
  })

  return corbelDriver
}

module.exports = corbelDriverSetup
