const router = require('express').Router();
const middleware = require('./middlewares');
const errors = require('./errors/error');
const healthRouter = require('./health/router');
const productsRoutes = require('./controller/product/routes');
const dealRoutes = require('./controller/deal/routes');
const orders = require('./controller/order/routes');

// Wire up middleware
router.use(middleware.doSomethingInteresting);

// Wire up routers
router.use('/health', healthRouter);
router.use('/api/v1/products', productsRoutes);
router.use('/api/v1/deals', dealRoutes);
router.use('/api/v1/orders', orders);


// Wire up error-handling middleware
router.use(errors.errorHandler);
router.use(errors.nullRoute);

// Export the router
module.exports = router;
