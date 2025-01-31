"use strict";

const express = require("express");

const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config();

const pricingRuleRoutes = require('./routes/pricingrule.routes')
const prouctRoutes = require('./routes/product.routes')
const shopifyRoutes = require('./routes/shopify.routes');
const { getAllProductTypes } = require("./controllers/product.shopify.controller");

// Constants
const PORT = 3000;
const HOST = "0.0.0.0";

async function start() {
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
  app.use("/api/pricing_rule", pricingRuleRoutes); // User routes
  app.get("/api/product_types", getAllProductTypes); // User routes
  // app.use("/api/shopify", shopifyRoutes);

  app.listen(PORT, HOST);
  console.log(`Server is running on http://${HOST}:${PORT}`);
}

start();
