const router = require('express').Router();
const products = require('.');

router.get('/', products.list);
router.post('/', products.create);
router.put('/:id', products.update);
router.get('/:id', products.show);
router.delete('/:id', products.delete);

// Export the router
module.exports = router;
