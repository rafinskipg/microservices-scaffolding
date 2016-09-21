'use strict'

const corbel = require('corbel-js')
const config = require('config')
const corbelConfig = config.get('corbel')
const debug = require('debug')('service')
const trace = require('debug')('trace')
const error = require('debug')('error')

var DRIVER_INSTANCE = null

function initDriver () {
  var clientCredentials = {
    'clientId': corbelConfig.credentials.clientId,
    'clientSecret': corbelConfig.credentials.clientSecret,
    'scopes': corbelConfig.credentials.scopes,
    'audience': 'http://iam.bqws.io',
    'domain': corbelConfig.credentials.domain,
    'urlBase': corbelConfig.options.urlBase
  }

  var corbelDriver = corbel.getDriver(clientCredentials)

  corbelDriver.on('request', function(data){
    trace('Corbel request token: %s, method %s, url %s', data.headers.Authorization, data.method, data.url);
  })

  let userCredentials = {
    claims: {
      'basic_auth.username': corbelConfig.credentials.username,
      'basic_auth.password': corbelConfig.credentials.userpassword,
      'scope': corbelConfig.credentials.userscopes
    }
  }

  return corbelDriver
    .iam
    .token()
    .create(userCredentials)
    .then(response => {
      // Credentials are good!
      DRIVER_INSTANCE = corbelDriver
      debug('corbel token %s', response.data.accessToken)
      return DRIVER_INSTANCE
    })
    .catch(err => {
      error('Corbel Connector, error connecting %s %s', err.status, err.data)
      throw new Error(err.data)
    })
}

module.exports = {
  get: () => DRIVER_INSTANCE,
  init: initDriver
}
