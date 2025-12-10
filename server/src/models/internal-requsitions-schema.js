// models/requisition.model.js
const mongoose = require("mongoose");
const itemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  unit: { type: String },
  id: { type: String },
  total: {
    type: Number,
    default: function () {
      return this.quantity * this.unitPrice;
    },
  },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },

    role: { type: String },
  },
  { _id: false }
);

const approvedByFinanceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },

    role: { type: String },
  },
  { _id: false }
);

const accountToPaySchema = new mongoose.Schema(
  {
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
  },
  { _id: false }
);

const requisitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    priority: { type: String },
    category: { type: String, required: true },
    approvedOn: { type: Date, default: null },
    rejectedOn: { type: Date, default: null },
    comment: { type: String, default: null },
    requestedOn: { type: Date, default: Date.now },
    items: { type: [itemSchema], required: true },
    user: { type: userSchema, required: true },
    attachments: [{ type: String }],
    approvedByFinance: {
      type: approvedByFinanceSchema,
      default: null,
    },
    approvedByHeadOfDepartment: { type: Boolean, default: false },
    totalAmount: { type: Number, default: 0 },
    requisitionNumber: { type: String, unique: true },
    accountToPay: { type: accountToPaySchema, default: null },
    status: {
      type: String,
      enum: ["pending", "in review", "approved", "rejected", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InternalRequisition", requisitionSchema);
