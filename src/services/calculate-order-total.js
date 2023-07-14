
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
    let cartItemsIds = flattenItems.map(item => ({ id: item.id, consumed: false }));

    const products = await Product.find({
        _id: {
            $in: cartItemsIds.map(item => item.id)
        },
        deleted: false
    }).exec();

    const deals = await Deals.find({
        deleted: false
    }).exec();

    const items = [];

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


        const allDeals = deals.filter(deal => deal.addon.equals(id) &&
            cartItemsIds
                .filter(cartItem => cartItem.id !== id && cartItem.consumed === false)
                .map(item => item.id)
                .includes(deal.item.toJSON().valueOf())
        );

        let dealId = null;
        if (allDeals.length) {
            const deal = allDeals.reduce((prev, curr) => {
                const currentDiscount = curr.discount_type === "percent" ? product.price * (curr.discount / 100) : curr.discount;
                const prevDiscount = prev.discount_type === "percent" ? product.price * (prev.discount / 100) : prev.discount;
                return prevDiscount < currentDiscount ? prev : curr;
            })?.toObject();

            if (deal) {
                dealId = deal._id;
                const index = cartItemsIds.findIndex(item => item.id === deal.item.toJSON().valueOf() && item.consumed === false);
                if (index >= 0) {
                    cartItemsIds = cartItemsIds.map((item, idx) => {
                        if (idx === index) {
                            return { ...item, consumed: true };
                        }
                        return { ...item };
                    });
                }
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
                price: total,
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
            let discountValue = offerDetails.max_discount_cap && discount > offerDetails.max_discount_cap ? offerDetails.max_discount_cap : discount;

            if (item.discount && (item.discount < discountValue)) {
                discountValue = item.discount;
            }

            const total = (item.price + item.discount) - discountValue;
            itemsWithOfferDiscounts.push({ ...item, price: total < 0 ? 0 : total, discount: discountValue });
            return;
        }
        itemsWithOfferDiscounts.push(item);
    });

    const orderTotal = itemsWithOfferDiscounts.reduce((a, b) => a + b.price, 0);
    console.log(cartItemsIds);

    return { cartItems: itemsWithOfferDiscounts, orderTotal };
};