const express = require("express");
const router = express.Router();
const Meeting = require("../routes/meetings/meeting.route");
const Department = require("../routes/department/department.route");
const departmentSelect = require("../middleware/departmentSelect.middleware");
const webhookRouter = require("../routes/webhook/webhook.route");

// Apply departmentSelect middleware to all routes in this router

router.use("/department", Department);

router.use(departmentSelect);
router.use("/meetings", Meeting);
router.use("/webhook", webhookRouter);

module.exports = router;
