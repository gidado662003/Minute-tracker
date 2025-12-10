const jwt = require("jsonwebtoken");
const { laravelAuthMiddleware } = require("./laravelAuth.middleware");

function jwtAuthMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = auth.slice(7);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[SERVER] JWT_SECRET not configured");
      return res.status(500).json({ message: "jwt secret not configured" });
    }

    const verifyOptions = {
      algorithms: [process.env.JWT_ALG || "HS256"],
    };
    if (process.env.JWT_ISSUER) verifyOptions.issuer = process.env.JWT_ISSUER;
    if (process.env.JWT_AUDIENCE)
      verifyOptions.audience = process.env.JWT_AUDIENCE;

    // If token looks like JWT (has 2 dots), verify locally; otherwise delegate to Laravel
    const looksLikeJwt = token.split(".").length === 3;
    if (!looksLikeJwt) {
      return laravelAuthMiddleware(req, res, next);
    }

    const payload = jwt.verify(token, secret, verifyOptions);

    // Attach common user info if present
    req.user = {
      id: payload.sub || payload.id,
      email: payload.email,
      name: payload.name,
      roles: payload.roles,
      raw: payload,
    };

    // Normalize department field from various possible claims
    req.department =
      payload.department || payload.department_id || payload.dept || null;

    return next();
  } catch (err) {
    console.error("[SERVER] ❌ Token verification failed:", {
      errorName: err?.name,
      errorMessage: err?.message,
    });
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { jwtAuthMiddleware };
