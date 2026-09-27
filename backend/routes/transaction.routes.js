const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/transaction.controller');

router.use(auth);
router.post('/', ctrl.addTransaction);
router.get('/', ctrl.getTransactions);
router.delete('/:id', ctrl.deleteTransaction);

module.exports = router;
