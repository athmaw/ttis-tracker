const express = require('express');
const router = express.Router();
const auth = require('./auth');
const inventory = require('./inventory');
const sales = require('./sales');

router.use('/auth', auth);
router.use('/inventory', inventory);
router.use('/sales', sales);

module.exports = router;