const express = require("express");

const router = express.Router();
const {
  selectDepartment,
  getDepartment,
} = require("../department/department.controller");

router.post("/", selectDepartment);
router.get("/", getDepartment);

module.exports = router;
