
const { pagination } = require('../../helpers/utils');
/* global
successResponse:readonly
errorResponse:readonly
logger:readonly
*/

const Deal = require('../../../models/deals');
const { validateDeal } = require('../../validations/deal');
const { newHttpError } = require('../../errors/error');

exports.list = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const deals = await Deal.find()
            .sort({
                createdAt: -1,
            })
            .populate(['item', 'addon'])
            .skip(limit * (page - 1))
            .limit(limit)
            .exec();

        const dealsCount = await Deal.count().exec();

        res.status(200).send(successResponse({ deals, result: pagination(page, limit, dealsCount) }));
    } catch (e) {
        res.status(e?.status ?? 500).send(errorResponse(e.message, e?.status ?? 500));
        logger.error(e);
    }
};

exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const deals = await Deal.findById(id).populate(['item', 'addon']).exec();
        res.status(200).send(successResponse(deals));
    } catch (e) {
        res.status(e?.status ?? 500).send(errorResponse(e.message, e?.status ?? 500));
        logger.error(e);
    }
};

exports.create = async (req, res) => {
    try {
        await validateDeal.validateAsync(req.body);

        const {
            item,
            addon,
            discount,
            discount_type,
            max_discount_cap
        } = req.body;

        const dealFound = await Deal.findOne({ item, addon }).exec();

        if (dealFound) {
            throw newHttpError(400, 'Deal already exists');
        }

        const deal = await Deal.create({
            item,
            addon,
            discount,
            discount_type,
            max_discount_cap
        });

        res.status(200).send(successResponse(deal));
    } catch (e) {
        res.status(e?.status ?? 500).send(errorResponse(e.message, e?.status ?? 500));
        logger.error(e);
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        await validateDeal.validateAsync(req.body);

        const {
            item,
            addon,
            discount,
            discount_type,
            max_discount_cap
        } = req.body;

        const deal = await Deal.findByIdAndUpdate(id, {
            item,
            addon,
            discount,
            discount_type,
            max_discount_cap
        }, { new: true }).exec();

        res.status(200).send(successResponse(deal));
    } catch (e) {
        res.status(e?.status ?? 500).send(errorResponse(e.message, e?.status ?? 500));
        logger.error(e);
    }
};


exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Deal.findById(id).exec();
        if (!data) {
            throw new Error('Deal not found');
        }
        data.remove();
        res.status(200).send(successResponse(null));
    } catch (e) {
        res.status(500).send(errorResponse(e?.message ?? e));
        logger.info(e);
    }
};