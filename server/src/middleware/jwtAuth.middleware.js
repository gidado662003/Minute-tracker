const jwt = require("jsonwebtoken");
const { laravelAuthMiddleware } = require("./laravelAuth.middleware");

function jwtAuthMiddleware(req, res, next) {
  console.log("[SERVER] Incoming request:", {
    method: req.method,
    path: req.path,
    hasAuthHeader: !!req.headers.authorization,
    authHeaderPreview: req.headers.authorization
      ? req.headers.authorization.slice(0, 20) + "..."
      : null,
  });

  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      console.log("[SERVER] No Bearer token found");
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
      console.log(
        "[SERVER] Detected opaque token (likely Laravel PAT). Delegating to laravelAuthMiddleware."
      );
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

    // Debug logs (safe)
    console.log("[SERVER] ✅ Token verified successfully:", {
      userId: req.user.id,
      email: req.user.email,
      department: req.department,
      exp: payload?.exp ? new Date(payload.exp * 1000).toISOString() : null,
      issuer: payload.iss,
      audience: payload.aud,
    });

    return next();
  } catch (err) {
    console.error("[SERVER] ❌ Token verification failed:", {
      errorName: err?.name,
      errorMessage: err?.message,
      stack: err?.stack?.split("\n")[0],
      path: req.path,
    });
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { jwtAuthMiddleware };
