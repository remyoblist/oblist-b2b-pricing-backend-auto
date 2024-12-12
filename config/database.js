const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("actifai", "postgres", "!@3Billion", {
  host: "localhost",
  dialect: "postgres",
  logging: false, // Disable logging for cleaner output
});

module.exports = sequelize;
