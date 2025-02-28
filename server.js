"use strict";

const express = require("express");

const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const pricingRuleRoutes = require("./routes/pricingrule.routes");
const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const {
  getAllProductTypes,
  getAllProductTags,
} = require("./controllers/product.shopify.controller");
const { authenticateToken } = require("./middlewares/auth.middleware");

// Constants
const PORT = 3000;
const HOST = "0.0.0.0";

// App
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Parse incoming URL-encoded requests (if necessary)
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.send("Hello World");
});

// Write your endpoints here

// Register routes
app.use(authRoutes); // User routes
app.use("/api/pricing_rule", authenticateToken, pricingRuleRoutes); // User routes
app.use("/api/product", productRoutes); // User routes
app.get("/api/product_tags", getAllProductTags); // User routes
// app.use("/api/shopify", shopifyRoutes);

app.listen(PORT, HOST);
console.log(`Server is running on http://${HOST}:${PORT}`);

module.exports = app;
