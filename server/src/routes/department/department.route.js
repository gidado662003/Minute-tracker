const express = require("express");

const router = express.Router();
const { selectDepartment } = require("../department/department.controller");

router.post("/", selectDepartment);

module.exports = router;
