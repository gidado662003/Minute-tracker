const jwt = require("jsonwebtoken");

const departmentSelect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, "test");

    // Only store the department string
    req.department = decoded.department;

    if (!req.department) {
      return res.status(403).json({ message: "Department not selected" });
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = departmentSelect;
