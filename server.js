"use strict";

const express = require("express");

const userRoutes = require("./routes/users");
const groupRoutes = require("./routes/groups");
const saleRoutes = require("./routes/sales");
const userGroupRoutes = require("./routes/userGroups");

const seeder = require("./seed");

// Constants
const PORT = 3000;
const HOST = "0.0.0.0";

async function start() {
  // Seed the database
  await seeder.seedDatabase();

  // App
  const app = express();

  // Health check
  app.get("/health", (req, res) => {
    res.send("Hello World");
  });

  // Write your endpoints here

  // Register routes
  app.use("/api/users", userRoutes); // User routes
  app.use("/api/groups", groupRoutes); // Group routes
  app.use("/api/sales", saleRoutes); // Sales routes
  app.use("/api/userGroups", userGroupRoutes); // User-Group routes

  app.listen(PORT, HOST);
  console.log(`Server is running on http://${HOST}:${PORT}`);
}

start();
