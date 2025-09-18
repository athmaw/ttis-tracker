const express = require("express");
const router = express.Router();
const { Sale, Item } = require("../models");

router.get("/", async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [{ model: Item, attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(sales);
  } catch (err) {
    console.error("Error fetching sales:", err);
    res.status(500).json({ message: "Failed to fetch sales" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { itemId, quantity, customer } = req.body;
    if (!itemId || !quantity) {
      return res.status(400).json({ message: "Item and quantity are required" });
    }

    const item = await Item.findByPk(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    item.quantity -= quantity;
    await item.save();

    const totalPrice = quantity * item.price;

    const sale = await Sale.create({
      itemId,
      quantity,
      customer,
      totalPrice,
      date: new Date().toISOString().slice(0, 10),
    });

    res.json(sale);
  } catch (err) {
    console.error("Error creating sale:", err);
    res.status(500).json({ message: "Failed to create sale" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { itemId, quantity, customer } = req.body;

    const sale = await Sale.findByPk(id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    const item = await Item.findByPk(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const prevItem = await Item.findByPk(sale.itemId);
    if (prevItem) {
      prevItem.quantity += sale.quantity;
      await prevItem.save();
    }

    if (item.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }
    item.quantity -= quantity;
    await item.save();

    sale.itemId = itemId;
    sale.quantity = quantity;
    sale.customer = customer;
    sale.totalPrice = quantity * item.price;
    await sale.save();

    res.json(sale);
  } catch (err) {
    console.error("Error updating sale:", err);
    res.status(500).json({ message: "Failed to update sale" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findByPk(id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    const item = await Item.findByPk(sale.itemId);
    if (item) {
      item.quantity += sale.quantity; // return stock
      await item.save();
    }

    await sale.destroy();
    res.json({ message: "Sale deleted successfully" });
  } catch (err) {
    console.error("Error deleting sale:", err);
    res.status(500).json({ message: "Failed to delete sale" });
  }
});

router.get("/reports/monthly", async (req, res) => {
  try {
    const { Sale, sequelize } = require("../models");

    const monthlySales = await Sale.findAll({
      attributes: [
        [sequelize.fn("strftime", "%Y-%m", sequelize.col("date")), "month"], // works in SQLite
        [sequelize.fn("sum", sequelize.col("totalPrice")), "total"],
      ],
      group: ["month"],
      order: [[sequelize.fn("strftime", "%Y-%m", sequelize.col("date")), "DESC"]],
    });

    res.json(monthlySales);
  } catch (err) {
    console.error("Error fetching monthly sales:", err);
    res.status(500).json({ message: "Failed to fetch monthly sales" });
  }
});

module.exports = router;