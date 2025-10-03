const jwt = require("jsonwebtoken");

function selectDepartment(req, res) {
  const { department } = req.body;
  if (!department) {
    return res.status(400).json({ message: "Department is required" });
  }
  const payload = {
    department,
  };
  const token = jwt.sign(payload, "test", { expiresIn: "1h" });

  res.json({ message: "Department selected", token });
  res.cookie("department", token, { httpOnly: true });
}

module.exports = { selectDepartment };
