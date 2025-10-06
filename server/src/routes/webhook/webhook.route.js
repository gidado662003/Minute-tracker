const express = require("express");
const router = express.Router();
const { handleWebhook } = require("./webhook.controller");
router.post("/", handleWebhook);

module.exports = router;
