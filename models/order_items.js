const { Schema, model } = require('mongoose');

const OrderItemSchema = new Schema({
    order_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Order'
    },
    item_id: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
    offer_id: { type: Schema.Types.ObjectId, required: false, ref: 'Deal' },
    quantity: { type: Schema.Types.Number, required: false, default: 1 },
    actual_price: {
        type: Schema.Types.Number,
        required: true
    },
    discount: {
        type: Schema.Types.Number,
        required: true
    },
    tax: {
        type: Schema.Types.Number,
        required: true
    },
    price: {
        type: Schema.Types.Number,
        required: true
    }
}, { timestamps: true });

module.exports = model('OrderItem', OrderItemSchema, 'order_items');