const {Router} = require('express');
const router = Router();
const ordersController = require('../controllers/orderController');

router.get('/orders', ordersController.geOrders);
router.post('/orders', ordersController.posOrders);


module.exports = router;
