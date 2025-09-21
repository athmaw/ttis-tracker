const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const { Sale, Item, sequelize } = require("../models");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", async (req, res) => {
  try {
    const sales = await Sale.findAll({ include: [Item], order: [["date", "DESC"]] });
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sales" });
  }
});

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

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = xlsx.readFile(req.file.path, { cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const excelSerialToJSDate = (serial) => {
      return new Date(Math.round((serial - 25569) * 86400 * 1000));
    };

    for (const row of rows) {
      const itemName = row.Item;
      const qty = Number(row.Quantity) || 0;
      const price = Number(row.Price) || 0;
      const customer = row.Customer || "";

      let saleDate;
      if (row.Date === undefined || row.Date === null || row.Date === "") {
        saleDate = new Date();
      } else if (row.Date instanceof Date) {
        saleDate = row.Date;
      } else if (typeof row.Date === "number") {
        saleDate = excelSerialToJSDate(row.Date);
      } else {
        const parsed = new Date(row.Date);
        if (!isNaN(parsed.getTime())) saleDate = parsed;
        else saleDate = new Date(); 
      }

      let item = await Item.findOne({ where: { name: itemName } });
      if (!item) {
        item = await Item.create({
          name: itemName,
          quantity: 0,
          price: price || 0,
        });
        console.log(`Created new item: ${itemName}`);
      }

      await Sale.create({
        itemId: item.id,
        quantity: qty,
        totalPrice: price,
        customer,
        date: saleDate,
      });

      console.log(`Added sale: item=${itemName} qty=${qty} date=${saleDate.toISOString().slice(0,10)}`);
    }

    res.json({ message: "File uploaded and sales added successfully" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Failed to upload sales" });
  }
});

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