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
    neededBy: String,
    purpose: String,
    items: [itemSchema],
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
