var Joi = require('joi')

var planById = Joi.object().keys({
  id: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
})

module.exports = planById
