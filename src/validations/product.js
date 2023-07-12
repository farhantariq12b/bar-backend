const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().min(2).required(),
  price: Joi.number().min(1).required(),
  tax: Joi.number().min(0).required(),
  discount: Joi.number().min(0).allow('', null).optional(),
  discount_type: Joi.string().allow('amount', 'percent', ''),
  max_discount_cap: Joi.number().min(0).required()
});

exports.validateProduct = schema;