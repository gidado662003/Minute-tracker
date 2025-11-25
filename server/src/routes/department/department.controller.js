const jwt = require("jsonwebtoken");

function selectDepartment(req, res) {
  const { department } = req.body;
  if (!department) {
    return res.status(400).json({ message: "Department is required" });
  }
  const payload = {
    department,
  };
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "jwt secret not configured" });
  }

  const ttlSeconds = parseInt(process.env.JWT_TTL_SECONDS || "3600", 10);
  const signOptions = {
    expiresIn: ttlSeconds,
    algorithm: process.env.JWT_ALG || "HS256",
  };
  if (process.env.JWT_ISSUER) signOptions.issuer = process.env.JWT_ISSUER;
  if (process.env.JWT_AUDIENCE) signOptions.audience = process.env.JWT_AUDIENCE;

  const token = jwt.sign(payload, secret, signOptions);

  // Debug: inspect newly issued token (header and payload)
  try {
    const decodedFull = jwt.decode(token, { complete: true });
  } catch {}

  // Set cookie first, then send response
  res.cookie("department", token, { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Department selected", token });
}
function getDepartment(req, res) {
  res.send("testing");
}
module.exports = { selectDepartment, getDepartment };
