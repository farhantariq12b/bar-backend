
const Deals = require('../../models/deals');
const Product = require('../../models/product');

/**
* @typedef OrderObject
* @type {object}
* @property {string} user_id
* @property {{id: string; quantity: number}[]} items
*/


/**
 *
 * @param {OrderObject} cartItems
 * @param {Schema.Types.ObjectId} orderID
 * @returns
 */
exports.calculateOrderTotal = async (cartItems, orderID) => {
    const flattenItems = cartItems.flatMap(item => Array.from({ length: item.quantity }).fill({ ...item, quantity: 1 }));
    /** @type {string[]} */
    const cartItemsIds = flattenItems.map(item => item.id);

    const products = await Product.find({
        _id: {
            $in: cartItemsIds
        },
        deleted: false
    }).exec();

    const deals = await Deals.find({
        item: {
            $in: cartItemsIds
        },
        deleted: false
    }).exec();

    const items = [];
    const used = [];

    flattenItems.forEach((item) => {
        const { id, quantity } = item;
        const product = products.find(prod => prod._id.toString() === id).toObject();
        if (!product) {
            return;
        }
        const productTax = product.price * (product.tax / 100);
        const discount = product.discount_type === 'percent' ? product.price * (product.discount / 100) : product.discount;
        const discountValue = product.max_discount_cap && discount > product.max_discount_cap ? product.max_discount_cap : discount;

        const actualPrice = product.price * quantity;
        const totalDiscount = discountValue * quantity;
        const totalTaxApplied = productTax * quantity;
        const total = ((product.price - discountValue) + productTax) * quantity;

        const filterCartItems = cartItemsIds.filter((_, index) => !used.includes(index));

        const allDeals = deals.filter(deal =>
            deal.addon.equals(id) &&
            filterCartItems.includes(deal.item.toJSON().valueOf()));

        let dealId = null;
        if (allDeals.length) {
            const deal = deals.reduce((prev, curr) => {
                const currentDiscount = curr.discount_type === "percent" ? product.price * (curr.discount / 100) : curr.discount;
                const prevDiscount = prev.discount_type === "percent" ? product.price * (prev.discount / 100) : prev.discount;
                return prevDiscount < currentDiscount ? prev : curr;
            })?.toObject();
            if (deal) {
                dealId = deal._id;
                const dealItemId = deal.item.toString();
                const index = filterCartItems.findIndex(item => item === dealItemId);
                used.push(index);
            }
        }

        items.push(
            {
                order_id: orderID,
                item_id: id,
                offer_id: dealId,
                quantity,
                actual_price: actualPrice,
                discount: totalDiscount,
                tax: totalTaxApplied,
                price: total
            }
        );
    });

    const itemsWithOfferDiscounts = [];

    items.forEach(async (item) => {

        if (item.offer_id) {
            const offerDetails = deals.find(deal => deal._id.equals(item.offer_id));

            if (!offerDetails) {
                itemsWithOfferDiscounts.push(item);
                return;
            }
            const discount = offerDetails.discount_type === 'percent' ? item.price * (offerDetails.discount / 100) : offerDetails.discount;
            const discountValue = offerDetails.max_discount_cap && discount > offerDetails.max_discount_cap ? offerDetails.max_discount_cap : discount;

            const total = item.price - discountValue;
            itemsWithOfferDiscounts.push({ ...item, price: total < 0 ? 0 : total, discount: item.discount + discountValue });
            return;
        }
        itemsWithOfferDiscounts.push(item);
    });

    const orderTotal = itemsWithOfferDiscounts.reduce((a, b) => a + b.price, 0);

    return { cartItems: itemsWithOfferDiscounts, orderTotal };
};