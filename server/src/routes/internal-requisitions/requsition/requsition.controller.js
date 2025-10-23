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

async function updateInternalRequisition(req, res) {
  const id = req.params.id;

  const newStatus = req.body.status;

  try {
    const updatedDocument = await InternalRequisition.findByIdAndUpdate(
      id,
      { $set: { status: newStatus } }, // <-- This is your $set update
      { new: true } // Option to return the updated document
    );

    if (!updatedDocument) {
      return res
        .status(404)
        .json({ message: `Requisition with ID ${id} not found.` });
    }

    res.status(200).json({
      message: `Requisition ${id} successfully updated to status: ${newStatus}`,
      data: updatedDocument,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error processing update.", error: error.message });
  }
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
