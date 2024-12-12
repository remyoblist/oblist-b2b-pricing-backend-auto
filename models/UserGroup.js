const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserGroup = sequelize.define(
  "UserGroup",
  {
    user_id: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" },
    },
    group_id: {
      type: DataTypes.INTEGER,
      references: { model: "groups", key: "id" },
    },
  },
  {
    tableName: "user_groups",
    timestamps: false,
  }
);

module.exports = UserGroup;
