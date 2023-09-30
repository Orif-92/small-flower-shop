const {Router} = require('express');
const router = Router();
const productsController = require('../controllers/productController');

router.get('/', productsController.listProducts);


module.exports = router;
