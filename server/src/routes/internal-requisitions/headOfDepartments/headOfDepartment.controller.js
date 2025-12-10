const HeadOfDepartments = require("../../../models/headofDepartments.schema");

async function getHeadOfDepartments(req, res) {
  try {
    const headOfDepartments = await HeadOfDepartments.find();
    res.status(200).json(headOfDepartments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createHeadOfDepartment(req, res) {
  try {
    const { name, email, department } = req.body;
    const headOfDepartment = await HeadOfDepartments.create(req.body);
    res.status(201).json(headOfDepartment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
module.exports = { getHeadOfDepartments, createHeadOfDepartment };
