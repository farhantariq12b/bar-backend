const Joi = require('joi');

const schema = Joi.object({
  user_id: Joi.string().min(5).required(),
  items: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    quantity: Joi.number().min(1).required()
  })).required(),
});

const updateSchema = Joi.object({
  status: Joi.string().valid('placed', 'in_transit', 'completed', 'canceled').required()
});

exports.validateOrder = schema;
exports.validateOrderUpdate = updateSchema;