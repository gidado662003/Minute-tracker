const express = require("express");
const router = express.Router();
const {
  createInternalRequisition,
  getInternalRequisitions,
  getInternalRequisitionById,
  updateInternalRequisition,
  deleteInternalRequisition,
} = require("./requsition.controller");
router.post("/create", createInternalRequisition);
router.get("/list", getInternalRequisitions);
router.get("/:id", getInternalRequisitionById);
router.put("/:id/status", updateInternalRequisition);
router.delete("/:id", deleteInternalRequisition);

module.exports = router;
