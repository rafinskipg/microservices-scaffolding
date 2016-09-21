'use strict'

const AuthBearer = require('hapi-auth-bearer-token')
const tokenVerifier = require('corbel-token-verifier')
const corbelDriverSetup = require('./corbelDriverSetup')
const trace = require('debug')('trace')

function auth (server) {
  server.register(AuthBearer, (err) => {
    if (err) console.error(err)
    server.auth.strategy('simple', 'bearer-access-token', {
      validateFunc: function (token, callback) {
        // For convenience, the request object can be accessed
        // from `this` within validateFunc.
        // var request = this

        // Use a real strategy here,
        // comparing with a token from your database for example
        let tokenObject = tokenVerifier(token)

        if (!tokenObject) {
          trace('Invalid token, unauthorized')
          return callback(null, false, {tokenObject: null})
        } else {
          trace('Correct token, giving permission and driver')
          var corbelDriver = corbelDriverSetup(tokenObject.getToken(), tokenObject.getDomainId())
          return callback(null, true, {accessToken: tokenObject.getToken(), domain: tokenObject.getDomainId()}, {tokenObject: tokenObject, corbelDriver: corbelDriver})
        }
      }
    })
  })
}

module.exports = auth
