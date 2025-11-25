const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const meetingRoutes = require("../src/routes/api");

// Load environment variables based on NODE_ENV
require("dotenv").config({
  path: `${__dirname}/../.env.${process.env.NODE_ENV || "development"}`,
});

const app = express();

// Allow requests from configured origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://102.36.135.18:3000"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(process.env.API_PREFIX || "/api", meetingRoutes);

module.exports = app;
