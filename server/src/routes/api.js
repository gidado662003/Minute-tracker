const express = require("express");
const router = express.Router();
const Meeting = require("../routes/meetings/meeting.route");
const Department = require("../routes/department/department.route");
const departmentSelect = require("../middleware/departmentSelect.middleware");
const { jwtAuthMiddleware } = require("../middleware/jwtAuth.middleware");
const webhookRouter = require("../routes/webhook/webhook.route");
const internalRequisitionRouter = require("../routes/internal-requisitions/requsition/requsition.route");
const internalReqDashboardRouter = require("../routes/internal-requisitions/dashboard/dashboard.route");
const meRouter = require("../routes/me/me.route");
// Apply departmentSelect middleware to all routes in this router

router.use("/department", Department);

// router.use(departmentSelect);
router.use("/internal-requisitions/dashboard", internalReqDashboardRouter);
router.use(jwtAuthMiddleware);
router.use("/internal-requisitions", internalRequisitionRouter);
router.use("/meetings", Meeting);
router.use("/me", meRouter);
router.use("/webhook", webhookRouter);
module.exports = router;
