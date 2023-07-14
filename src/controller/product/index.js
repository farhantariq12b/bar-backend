
const { pagination } = require('../../helpers/utils');
/* global
successResponse:readonly
errorResponse:readonly
newHttpError:readonly
logger:readonly
*/

const product = require('../../../models/product');
const { validateProduct } = require('../../validations/product');

exports.list = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, all } = req.query;
        let query = { deleted: false };
        if (search) {
            query = {
                ...query,
                name: { $regex: search, $options: 'i' },
            };
        }
        const products = all ? await product.find({ deleted: false }).exec() : await product.find(query)
            .sort({
                createdAt: -1,
            })
            .skip(limit * (page - 1))
            .limit(limit)
            .exec();
        const productsCount = await product.count(query).exec();
        res.status(200).send(successResponse({ products, result: pagination(page, limit, productsCount) }));
    } catch (e) {
        res.status(e?.status ?? 500).send(errorResponse(e.message, e?.status ?? 500));
        logger.error(e);
    }
};

exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await product.findById(id).exec();
        if (!products || products.deleted) {
            throw newHttpError(404, "Product not found");
        }
        res.status(200).send(successResponse(products));
    } catch (e) {
        res.status(e?.status ?? 500).send(errorResponse(e.message, e?.status ?? 500));
        logger.error(e);
    }
};

exports.create = async (req, res) => {
    try {
        await validateProduct.validateAsync(req.body);

        const {
            name,
            price,
            tax,
            discount,
            discount_type,
            max_discount_cap
        } = req.body;

        const prod = await product.findOne({ name }).exec();
        const productAdded = prod ? await prod.update({
            name,
            price,
            tax,
            discount,
            discount_type,
            max_discount_cap,
            deleted: false
        }) : await product.create({
            name,
            price,
            tax,
            discount,
            discount_type,
            max_discount_cap
        });
        res.status(200).send(successResponse(productAdded));
    } catch (e) {
        res.status(e?.status ?? 500).send(errorResponse(e.message, e?.status ?? 500));
        logger.error(e);
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        await validateProduct.validateAsync(req.body);

        const {
            name,
            price,
            tax,
            discount,
            discount_type,
            max_discount_cap
        } = req.body;
        const updatedProduct = await product.findByIdAndUpdate(id, {
            name,
            price,
            tax,
            discount,
            discount_type,
            max_discount_cap
        }, { new: true }).exec();
        res.status(200).send(successResponse(updatedProduct));
    } catch (e) {
        res.status(e?.status ?? 500).send(errorResponse(e.message, e?.status ?? 500));
        logger.error(e);
    }
};


exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await product.findById(id).exec();
        if (!data) {
            throw new Error('Product not found');
        }
        await data.update({ deleted: true });
        res.status(200).send(successResponse(null));
    } catch (e) {
        res.status(500).send(errorResponse(e?.message ?? e));
        logger.info(e);
    }
};