const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  name: { type: String, required: true, index: { unique: true } },
  price: { type: Number, required: true },
  tax: { type: Number, required: true, default: 0 },
  discount: { type: Number, required: false, default: 0 },
  discount_type: { type: String, required: false, default: 'amount', enum: ['amount', 'percent'] },
  max_discount_cap: { type: Number, required: true }
}, { timestamps: true });

module.exports = model('Product', productSchema, 'products');