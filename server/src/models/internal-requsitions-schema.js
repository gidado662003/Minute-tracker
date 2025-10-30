// models/requisition.model.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  description: String,
  quantity: Number,
  unitPrice: Number,
  unit: String,
  category: String,
  id: String,
  total: Number,
});

const requisitionSchema = new mongoose.Schema(
  {
    title: String,
    department: String,
    priority: String,
    approvedOn: {
      default: null,
      type: Date,
    },
    comment: {
      default: null,
      type: String,
    },
    requestedOn: String,
    purpose: String,
    items: [itemSchema],
    // approvedByDepartmenthead: String,
    attachments: [String],
    totalAmount: Number,
    requisitionNumber: String,
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InternalRequisition", requisitionSchema);
