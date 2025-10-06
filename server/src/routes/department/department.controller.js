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
  // Set cookie first, then send JSON response so the Set-Cookie header is present.
  res.cookie("department", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Department selected", token });
}
function getDepartment(req, res) {
  res.send("testing");
}
module.exports = { selectDepartment, getDepartment };
