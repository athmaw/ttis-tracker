const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/inventory", require("./inventory"));
router.use("/sales", require("./sales"));

module.exports = router;