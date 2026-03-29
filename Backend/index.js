// const cors = require("cors");
// const dotenv = require("dotenv");
// const express = require("express");
// const mongoose = require("mongoose");
// // Constants
// dotenv.config();
// const app = express();
// const port = process.env.PORT || 3000;

// // DB Connection
// mongoose.connection.on("connecting", function () {
//   console.log("connecting to MongoDB...");
// });

// mongoose.connection.on("error", function (error) {
//   console.error("Error in MongoDb connection: " + error);
// });

// mongoose.connection.on("connected", function () {
//   console.log("MongoDB connected!");
// });

// mongoose.connection.once("open", function () {
//   console.log("MongoDB connection opened!");
// });

// mongoose.connection.on("reconnected", function () {
//   console.log("MongoDB reconnected!");
// });

// mongoose.connection.on("disconnected", function () {
//   console.log("MongoDB disconnected!");
// });

// // Components
// const authroute = require("./routes/auth");
// const userroute = require("./routes/user");
// const flightroute = require("./routes/flight");

// const { authenticateToken } = require("./helpingfunctions/jwt");

// // Middleware
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow server-to-server or tools with no Origin header.
//       if (!origin) return callback(null, true);

//       // Allow localhost/127.0.0.1 with any dev port.
//       const isLocalhost =
//         /^http:\/\/localhost:\d+$/.test(origin) ||
//         /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

//       if (isLocalhost) return callback(null, true);

//       return callback(new Error("Not allowed by CORS"));
//     },
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "authorization"],
//   })
// );
// app.use(express.json());

// app.use("/auth", authroute);
// app.use("/user", authenticateToken, userroute);
// app.use("/flight", authenticateToken, flightroute);

// // Routes
// app.get("/", (req, res) => {
//   res.json({ msg: "Base path for API" });
// });

// // Starting
// const startServer = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URL);
//     app.listen(port, () => {
//       console.log(`Server started listening on port ${port}`);
//     });
//   } catch (error) {
//     console.error("Failed to start server: " + error);
//     process.exit(1);
//   }
// };

// startServer();
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");

// Config - MUST be first!
dotenv.config();

// Constants
const app = express();
const port = process.env.PORT || 3001;
mongoose.set("bufferCommands", false);

// DB Connection
if (process.env.MOCK_DB === "true") {
  console.log("MOCK_DB mode enabled - skipping MongoDB connection");
} else {
  const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
  if (!mongoUrl) {
    console.warn("MONGODB_URL/MONGODB_URI not set. Backend will try to connect but will likely fail.");
  }

  const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 20000,
  };

  mongoose.connect(mongoUrl, mongooseOptions).catch((err) => {
    console.error("Initial MongoDB connection error:", err && err.message ? err.message : err);
  });

  const db = mongoose.connection;

  db.on("connecting", () => console.log("connecting to MongoDB..."));
  db.on("error", (error) => console.error("Error in MongoDb connection:", error && error.message ? error.message : error));
  db.on("connected", () => console.log("MongoDB connected!"));
  db.once("open", () => console.log("MongoDB connection opened!"));
  db.on("reconnected", () => console.log("MongoDB reconnected!"));
  db.on("disconnected", () => console.log("MongoDB disconnected!"));
}

// Components
const authroute = require("./routes/auth");
const userroute = require("./routes/user");
const flightroute = require("./routes/flight");
const issueroute = require("./routes/issue");
const adminroute = require("./routes/admin");
const contactroute = require("./routes/contact");
const paymentroute = require("./routes/payment");

const { authenticateToken } = require("./helpingfunctions/jwt");

// Middleware
app.use(cors());
app.use(express.json());

app.use("/auth", authroute);
app.use("/user", authenticateToken, userroute);
app.use("/flight", authenticateToken, flightroute);
app.use("/issue", authenticateToken, issueroute);
app.use("/admin", adminroute);
app.use("/contact", contactroute);
app.use("/payment", authenticateToken, paymentroute);

// Routes
app.get("/", (req, res) => {
  res.json({ msg: "Base path for API" });
});

// Starting
const server = app.listen(port, () => {
  console.log(`Server started listening on port ${port}`);
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Change PORT or free the port and retry.`);
    process.exit(1);
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});
