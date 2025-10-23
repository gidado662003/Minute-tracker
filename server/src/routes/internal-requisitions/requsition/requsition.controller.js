const InternalRequisition = require("../../../models/internal-requsitions-schema");

async function createInternalRequisition(req, res) {
  console.log(req.body);
  const internalRequisition = new InternalRequisition(req.body);
  await internalRequisition.save();
  res.status(201).json(internalRequisition);
}

async function getInternalRequisitions(req, res) {
  try {
    const internalRequisitions = await InternalRequisition.find();
    res.status(200).json(internalRequisitions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function getInternalRequisitionById(req, res) {
  console.log(req.body);
  res
    .status(200)
    .json({ message: "Internal requisition fetched successfully" });
}

function updateInternalRequisition(req, res) {
  console.log(req.body);
  res
    .status(200)
    .json({ message: "Internal requisition updated successfully" });
}

function deleteInternalRequisition(req, res) {
  console.log(req.body);
  res
    .status(200)
    .json({ message: "Internal requisition deleted successfully" });
}

module.exports = {
  createInternalRequisition,
  getInternalRequisitions,
  getInternalRequisitionById,
  updateInternalRequisition,
  deleteInternalRequisition,
};
