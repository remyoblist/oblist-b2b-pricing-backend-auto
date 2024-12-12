const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Group = require("./Group"); // Assuming Group is in the same folder
const UserGroup = require("./UserGroup"); // Assuming Group is in the same folder

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

// Define association between User and Group through UserGroup
User.belongsToMany(Group, {
  through: UserGroup, // Define the bridge model
  foreignKey: "user_id", // Foreign key in the UserGroup table
  as: "Groups", // Alias for the associated Group model
});

Group.belongsToMany(User, {
  through: UserGroup, // Define the bridge model
  foreignKey: "group_id", // Foreign key in the UserGroup table
  as: "Users", // Alias for the associated User model
});

module.exports = User;
