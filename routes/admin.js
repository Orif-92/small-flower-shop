const {Router} = require('express');
const router = Router();
const adminController = require('../controllers/adminController'); 

router.get('/register', adminController.renderAdminDashboard);
router.post('/register', adminController.registerAdmin);
router.get('/login', adminController.loginAdmin);
router.post('/login', adminController.authAdmin);
router.get('/admin-dashboard', adminController.showAdminDashboard);
router.post('/admin-dashboard', adminController.posAdminDashboard);
router.get('/admin/new-product', adminController.showNewProduct);
router.post('/admin/products/new', adminController.createProduct);
router.get('/admin/products', adminController.showProductList);
router.get('/admin/edit-product/:productId', adminController.showEditProduct);
router.post('/admin/edit-product/:productId', adminController.updateProduct);
router.post('/admin/products/:id/delete', adminController.deleteProduct);
router.get('/admin/comments', adminController.showAdminComments);
router.post('/admin/comments/:id/delete', adminController.deleteComments);
router.get('/admin/orders', adminController.showAdminOrders);

module.exports = router;
