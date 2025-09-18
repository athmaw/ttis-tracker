const express = require('express');
const router = express.Router();
const { Sale, Item } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

router.post('/', authMiddleware, async (req, res) => {
  const { itemId, quantity, customer, date } = req.body;
  const item = await Item.findByPk(itemId);
  if (!item) return res.status(400).json({ message: 'Invalid item' });
  if (quantity <= 0) return res.status(400).json({ message: 'Invalid quantity' });

  if (item.quantity < quantity) return res.status(400).json({ message: 'Not enough stock' });
  item.quantity = item.quantity - quantity;
  await item.save();

  const totalPrice = parseFloat((quantity * item.price).toFixed(2));
  const sale = await Sale.create({
    itemId,
    quantity,
    totalPrice,
    customer,
    date: date || new Date(),
    createdBy: req.user.id
  });

  res.json(sale);
});

router.get('/', authMiddleware, async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from || to) {
    where.date = {};
    if (from) where.date[Op.gte] = from;
    if (to) where.date[Op.lte] = to;
  }
  const sales = await Sale.findAll({ where, include: [{ model: Item }] , order:[['date','DESC']]});
  res.json(sales);
});

router.get('/reports/monthly', authMiddleware, async (req, res) => {
  const sales = await Sale.findAll({ include: [Item] });
  const map = {};
  for (const s of sales) {
    const m = new Date(s.date).toISOString().slice(0,7);
    map[m] = (map[m] || 0) + s.totalPrice;
  }
  const arr = Object.keys(map).sort().map(k => ({ month: k, total: map[k] }));
  res.json(arr);
});

module.exports = router;