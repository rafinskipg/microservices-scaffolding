var MongoClient = require('mongodb').MongoClient
var config = require('config')

var DB

function connect (dbName) {
  return new Promise(function (resolve, reject) {
    var mongoConfig = config.get('mongo')

    var url = 'mongodb://' + mongoConfig.user + ':' + encodeURIComponent(mongoConfig.password) +
      '@' + mongoConfig.endpoint + '/' + dbName + '?authSource=admin'

    MongoClient.connect(url, function (err, db) {
      if (err) {
        return reject(err)
      }
      console.log('Connected')
      DB = db

      resolve(db)
    })
  })
}

function close () {
  DB.close()
}

module.exports = {
  connect: connect,
  db: function () {
    return DB
  },
  close: close
}
