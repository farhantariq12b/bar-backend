const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().min(5).required(),
  rating: Joi.number().min(1).max(5).required(),
  review: Joi.string().min(15).required(),
  image: Joi.allow(null, '')
});

exports.reviewValidation = schema;