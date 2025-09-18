const express = require('express');
const router = express.Router();
const { Item } = require('../models');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  const items = await Item.findAll({order:[['name','ASC']]});
  res.json(items);
});

router.post('/', authMiddleware, requireAdmin, async (req, res) => {
  const { name, category, description, batchNo, quantity, price } = req.body;
  const item = await Item.create({ name, category, description, batchNo, quantity, price });
  res.json(item);
});

router.put('/:id', authMiddleware, requireAdmin, async (req, res) => {
  const item = await Item.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  await item.update(req.body);
  res.json(item);
});

router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  const item = await Item.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  await item.destroy();
  res.json({ message: 'deleted' });
});

module.exports = router;