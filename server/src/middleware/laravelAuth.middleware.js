// middleware/laravelAuth.js

const axios = require("axios");

// Laravel ERP base URL (override with env LARAVEL_URL)
const LARAVEL_URL = process.env.LARAVEL_URL || "http://102.36.135.18:8000";

async function laravelAuthMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing or invalid token",
        redirectTo: "http://10.0.0.253:8000",
      });
    }

    const token = auth.slice(7);

    // Prefer introspection (POST /api/auth/introspect) if available
    try {
      const introspect = await axios.post(
        `${LARAVEL_URL}/api/auth/introspect`,
        { token },
        { headers: { Accept: "application/json" }, timeout: 5000 }
      );

      if (introspect.data?.active && introspect.data.user) {
        req.user = introspect.data.user;
        console.log(
          `[SERVER] User logged in: ${req.user.email} (${req.user.name}) - ${req.user.department}`
        );
        return next();
      }
      // If inactive, treat as invalid
      return res.status(401).json({
        message: "Invalid token",
        redirectTo: "http://10.0.0.253:8000",
      });
    } catch (e) {
      // Fall back to GET /api/auth/verify with Bearer if introspect not available
      try {
        const verify = await axios.get(`${LARAVEL_URL}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          timeout: 5000,
        });

        // Accept either { active, user } or { user }
        const data = verify.data || {};
        if ((data.active === undefined || data.active === true) && data.user) {
          req.user = data.user;
          console.log(
            `[SERVER] User logged in: ${req.user.email} (${req.user.name}) - ${req.user.department}`
          );
          return next();
        }
        return res.status(401).json({
          message: "Invalid token",
          redirectTo: "http://10.0.0.253:8000",
        });
      } catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.error("Auth error:", err?.message, {
          url: err?.config?.url,
          status,
          dataSnippet:
            typeof data === "object"
              ? JSON.stringify(data).slice(0, 200)
              : String(data).slice(0, 200),
        });

        if (status === 401 || status === 403) {
          return res.status(401).json({
            message: "Token validation failed",
            redirectTo: "http://10.0.0.253:8000",
          });
        }
        if (!status) {
          return res.status(503).json({
            message: "Authentication service unavailable",
            redirectTo: "http://10.0.0.253:8000",
          });
        }
        return res.status(500).json({
          message: "Authentication service unavailable",
          redirectTo: "http://10.0.0.253:8000",
        });
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({
        message: "Token validation failed",
        redirectTo: "http://10.0.0.253:8000",
      });
    }
    console.error("Auth error:", error.message);
    return res.status(500).json({
      message: "Authentication service unavailable",
      redirectTo: "http://10.0.0.253:8000",
    });
  }
}

module.exports = { laravelAuthMiddleware };
