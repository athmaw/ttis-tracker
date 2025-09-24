const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const { Sale, Item, sequelize } = require("../models");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Get all sales
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [Item],
      order: [["date", "DESC"]],
    });
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sales" });
  }
});

// Create sale
router.post("/", async (req, res) => {
  try {
    const { itemId, quantity, customer } = req.body;
    const item = await Item.findByPk(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const totalPrice = quantity * item.price;

    const sale = await Sale.create({
      itemId,
      quantity,
      totalPrice,
      customer,
      date: new Date(),
    });

    item.quantity -= quantity;
    await item.save();

    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create sale" });
  }
});

// Update sale
router.put("/:id", async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    const { itemId, quantity, customer } = req.body;
    const item = await Item.findByPk(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const totalPrice = quantity * item.price;

    await sale.update({ itemId, quantity, totalPrice, customer });
    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update sale" });
  }
});

// Delete sale
router.delete("/:id", async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    await sale.destroy();
    res.json({ message: "Sale deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete sale" });
  }
});

// Upload sales via Excel
router.post("/upload-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = xlsx.readFile(req.file.path, { cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const excelSerialToJSDate = (serial) =>
      new Date(Math.round((serial - 25569) * 86400 * 1000));

    for (const row of rows) {
      const itemName = row.Item;
      const qty = Number(row.Quantity) || 0;
      const price = Number(row.Price) || 0;
      const customer = row.Customer || "";

      // Parse Date properly
      let saleDate;
      if (!row.Date) {
        saleDate = new Date();
      } else if (row.Date instanceof Date) {
        saleDate = row.Date;
      } else if (typeof row.Date === "number") {
        saleDate = excelSerialToJSDate(row.Date);
      } else {
        const parsed = new Date(row.Date);
        saleDate = isNaN(parsed.getTime()) ? new Date() : parsed;
      }

      // Ensure Item exists
      let item = await Item.findOne({ where: { name: itemName } });
      if (!item) {
        item = await Item.create({
          name: itemName,
          quantity: 0,
          price: price || 0,
        });
        console.log(`Created new item: ${itemName}`);
      }

      // Save sale with correct total
      await Sale.create({
        itemId: item.id,
        quantity: qty,
        totalPrice: qty * price,
        customer,
        date: saleDate,
      });

      console.log(
        `✅ Added sale: ${itemName} x${qty} (₱${qty * price}) on ${saleDate.toISOString().slice(0, 10)}`
      );
    }

    res.json({ message: "File uploaded and sales added successfully" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Failed to upload sales" });
  }
});

// Monthly sales report
router.get("/reports/monthly", async (req, res) => {
  try {
    const results = await Sale.findAll({
      attributes: [
        [sequelize.fn("strftime", "%Y-%m", sequelize.col("date")), "month"], // SQLite
        [sequelize.fn("SUM", sequelize.col("totalPrice")), "total"],
      ],
      group: ["month"],
      order: [[sequelize.literal("month"), "DESC"]],
    });

    res.json(results);
  } catch (err) {
    console.error("Monthly sales error:", err);
    res.status(500).json({ message: "Failed to fetch monthly sales" });
  }
});

module.exports = router;