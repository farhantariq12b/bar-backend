const { Schema, model } = require('mongoose');

const dealsSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    addon: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
    discount: { type: Number, required: true, default: 0 },
    discount_type: {
        type: String, required: false,
        enum: ['percent', 'amount'],
        default: 'amount'
    },
    max_discount_cap: { type: Number, required: true }
}, { timestamps: true });

module.exports = model('Deal', dealsSchema, 'deals');