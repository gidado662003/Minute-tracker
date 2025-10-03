const express = require("express");
const router = express.Router();
const Meeting = require("../routes/meetings/meeting.route");
const Department = require("../routes/department/department.route");
const departmentSelect = require("../middleware/departmentSelect.middleware");

// Apply departmentSelect middleware to all routes in this router

router.use("/department", Department);

router.use(departmentSelect);

router.use("/meetings", Meeting);

module.exports = router;
