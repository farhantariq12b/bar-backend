const Joi = require('joi');

const schema = Joi.object({
    item: Joi.string().required(),
    addon: Joi.string().disallow(Joi.ref('item')).required(),
    discount: Joi.number().min(0).allow('', null).optional(),
    discount_type: Joi.string().allow('amount', 'percent', ''),
    max_discount_cap: Joi.number().min(0).required()
});

exports.validateDeal = schema;