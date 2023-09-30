const {Router} = require('express');
const router = Router();
const commentsController = require('../controllers/commentController');


router.get('/comments', commentsController.listComments);
router.post('/add-comment', commentsController.addComment);

module.exports = router;
