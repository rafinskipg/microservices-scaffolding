var Joi = require('joi')

var planSchema = Joi.object().keys({
  name: Joi.string().alphanum().min(3).max(200).required(),
  id: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
  trial: Joi.string().alphanum().min(2).max(30),
  scopes: ['all books']
})

module.exports = planSchema
