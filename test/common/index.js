var Seneca = require('seneca')
var SrvFakeData = require('../integration/service-data')

var Obj = function () {
  return this
}

Obj.prototype.init = function () {
  var params = {
    log: 'silent',
    strict: 'false',
    errhandler: (err) => {
      if (err.at) console.dir(err)
    }
  }

  this.seneca = Seneca(params).use('entity')
  return this
}

Obj.prototype.addRoutes = function () {
  this.seneca.add('role:info,req:part', function (args, cb) {
    return cb(null, JSON.stringify(SrvFakeData))
  })

  this.seneca.add('role:info,res:part', (msg, cb) => {
    return cb(null, msg)
  })

  return this
}

module.exports = new Obj()
