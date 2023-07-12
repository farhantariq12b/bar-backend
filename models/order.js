const { Schema, model } = require('mongoose');

const OrderSchema = new Schema({
    user_id: {
        type: Schema.Types.String,
        required: true,
    },
    total: { type: Number, required: false },
    status: {
        type: Schema.Types.String,
        required: false,
        default: 'in_transit',
        enum: ['placed', 'in_transit', 'completed', 'canceled']
    }
}, { timestamps: true });

module.exports = model('Order', OrderSchema, 'orders');