
const { default: mongoose } = require('mongoose');
const { ObjectId } = require('mongodb');
const { pagination } = require('../../helpers/utils');

const Order = require('../../../models/order');
const { validateOrder, validateOrderUpdate } = require('../../validations/order');
const OrderItem = require('../../../models/order_items');
const { calculateOrderTotal } = require('../../services/calculate-order-total');


/* global
successResponse:readonly
errorResponse:readonly
newHttpError:readonly
pusher:readonly
logger:readonly
*/

exports.list = async (req, res) => {
    try {
        const { page = 1, limit = 10, user_id } = req.query;

        const query = [
            {
                $lookup: {
                    from: 'order_items',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'items'
                }
            },
            { $match: { user_id } },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit }
        ];

        const orders = await Order.aggregate(query).exec();

        const ordersCount = await Order.find({ user_id }).count().exec();

        res.status(200).send(successResponse({ orders, result: pagination(page, limit, ordersCount) }));
    } catch (e) {
        res.status(e?.status ?? 500).send(errorResponse(e.message, e?.status ?? 500));
        logger.error(e);
    }
};

exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.query;
        const query = [
            {
                $lookup: {
                    from: 'order_items',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'items'
                }
            },
            {
                $match: {
                    $and: [
                        { user_id },
                        { _id: new ObjectId(id) }
                    ]
                }
            }
        ];

        const order = await Order.aggregate(query).exec();

        if (!order.length) {
            throw newHttpError(404, 'Order not found');
        }

        res.status(200).send(successResponse(order?.[0]));
    } catch (e) {
        res.status(e?.status ?? 500).send(errorResponse(e.message, e?.status ?? 500));
        logger.error(e);
    }
};

exports.create = async (req, res) => {
    try {
        await validateOrder.validateAsync(req.body);

        const {
            user_id,
            items
        } = req.body;

        const order = new Order({
            user_id,
            status: 'placed'
        });

        const { cartItems, orderTotal } = await calculateOrderTotal(items, order._id);
        order.total = orderTotal;

        const { connection } = mongoose;
        const session = await connection.startSession();

        await session.withTransaction(async () => {
            await order.save({ session });
            await OrderItem.create(cartItems, { session });

            return order;
        });

        session.endSession();

        res.status(200).send(successResponse(order));
    } catch (e) {
        res.status(e?.status ?? 500).send(errorResponse(e.message, e?.status ?? 500));
        logger.error(e);
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;

        await validateOrderUpdate.validateAsync(req.body);

        const {
            status
        } = req.body;

        const order = await Order.findById(id).exec();

        if (order.status === status) {
            throw newHttpError(422, "Order status is the same as the older");
        }

        await order.update({
            status
        }, { new: true }).exec();

        try {
            pusher.trigger("order_update", `order_status_update_${order.user_id}`, {
                message: { order_id: order._id, status: order.status }
            });
        } catch (e) {
            logger.error(e);
        }

        res.status(200).send(successResponse({ ...order.toObject(), status }));
    } catch (e) {
        res.status(e?.status ?? 500).send(errorResponse(e.message, e?.status ?? 500));
        logger.error(e);
    }
};


exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Order.findById(id).exec();
        if (!data) {
            throw newHttpError(404, 'Order not found');
        }
        await OrderItem.deleteMany({ order_id: data._id }).then(() => {
            data.remove();
        });
        res.status(200).send(successResponse(null));
    } catch (e) {
        res.status(500).send(errorResponse(e?.message ?? e));
        logger.info(e);
    }
};