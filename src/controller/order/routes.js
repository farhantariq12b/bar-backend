const router = require('express').Router();
const order = require('.');

router.get('/', order.list);
router.post('/', order.create);
router.put('/:id', order.update);
router.get('/:id', order.show);
router.delete('/:id', order.delete);

// Export the router
module.exports = router;
