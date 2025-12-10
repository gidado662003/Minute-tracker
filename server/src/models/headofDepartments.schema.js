const mongoose = require("mongoose");

const headOfDepartmentsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
});

const HeadOfDepartments = mongoose.model(
  "HeadOfDepartments",
  headOfDepartmentsSchema
);

module.exports = HeadOfDepartments;
