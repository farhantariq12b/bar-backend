const router = require('express').Router();
const deal = require('.');

router.get('/', deal.list);
router.post('/', deal.create);
router.put('/:id', deal.update);
router.get('/:id', deal.show);
router.delete('/:id', deal.delete);

// Export the router
module.exports = router;
