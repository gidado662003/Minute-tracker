const http = require("http");
const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://syscode:syscode@localhost:27017/mini-erp";
// Uncomment the following line for production use
// "mongodb://localhost:27017/mini-erp-dev";

async function startServer() {
  await mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log("✅ Connected to MongoDB");
      server.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
    });
}
startServer();
