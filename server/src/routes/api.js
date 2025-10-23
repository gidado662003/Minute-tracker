const express = require("express");
const router = express.Router();
const Meeting = require("../routes/meetings/meeting.route");
const Department = require("../routes/department/department.route");
const departmentSelect = require("../middleware/departmentSelect.middleware");
const webhookRouter = require("../routes/webhook/webhook.route");
const internalRequisitionRouter = require("../routes/internal-requisitions/requsition/requsition.route");

// Apply departmentSelect middleware to all routes in this router

router.use("/department", Department);

router.use("/internal-requisitions", internalRequisitionRouter);
router.use(departmentSelect);
router.use("/meetings", Meeting);
router.use("/webhook", webhookRouter);
module.exports = router;
