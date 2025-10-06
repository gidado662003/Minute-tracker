const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const meetingRoutes = require("../src/routes/api");
const app = express();

// Allow requests from the Next.js client and send cookies/credentials.
// Adjust the origin to match your client URL in production.
app.use(
  cors({
    origin: [
      "http://192.168.100.154:3000",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use("/api", meetingRoutes);

module.exports = app;
