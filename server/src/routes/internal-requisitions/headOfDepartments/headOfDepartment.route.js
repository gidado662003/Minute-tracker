const express = require("express");
const router = express.Router();
const {
  getHeadOfDepartments,
  createHeadOfDepartment,
} = require("./headOfDepartment.controller");
router.get("/", getHeadOfDepartments);
router.post("/", createHeadOfDepartment);

module.exports = router;
