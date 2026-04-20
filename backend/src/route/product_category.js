const router = require('express').Router();
const product_category = require('../controller/product_categoryController');
const auth = require('../middleware/authMiddleware');


router.get('/', product_category.read);
router.post('/', auth.verifyLogin, auth.verifyAdmin, product_category.create);
router.put('/:id', auth.verifyLogin, auth.verifyAdmin, product_category.update);
router.delete('/:id', auth.verifyLogin, auth.verifyAdmin, product_category.delete);

module.exports = router;