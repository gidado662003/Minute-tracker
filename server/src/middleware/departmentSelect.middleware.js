const jwt = require("jsonwebtoken");

const departmentSelect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "1 JWT secret not configured" });
    }

    const verifyOptions = {
      algorithms: [process.env.JWT_ALG || "HS256"],
    };

    if (process.env.JWT_ISSUER) verifyOptions.issuer = process.env.JWT_ISSUER;
    if (process.env.JWT_AUDIENCE)
      verifyOptions.audience = process.env.JWT_AUDIENCE;

    const decoded = jwt.verify(token, secret, verifyOptions);

    // Debug: inspect token contents (payload and select claims)
    try {
      console.log(
        "[departmentSelect] token preview:",
        token?.slice(0, 16) + "..."
      );
      console.log("[departmentSelect] decoded payload:", decoded);
      if (decoded?.exp)
        console.log(
          "[departmentSelect] exp:",
          new Date(decoded.exp * 1000).toISOString()
        );
      if (decoded?.iss) console.log("[departmentSelect] iss:", decoded.iss);
      if (decoded?.aud) console.log("[departmentSelect] aud:", decoded.aud);
    } catch {}

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
