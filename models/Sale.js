const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Sale = sequelize.define(
  "Sale",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Refers to the 'users' table
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    amount: {
      type: DataTypes.FLOAT, // Use FLOAT for monetary values
      allowNull: false,
      validate: {
        min: 0, // Ensure amount is non-negative
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true, // Ensures the value is a valid date
      },
    },
  },
  {
    tableName: "sales",
    timestamps: false,
  }
);

// Define associations with User
Sale.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Sale, { foreignKey: "user_id", as: "sales" });

module.exports = Sale;
