const UserGroup = require("./UserGroup");
const User = require("./User");
const Group = require("./Group");
const Sale = require("./Sale");

// Associations
User.belongsToMany(Group, { through: UserGroup, foreignKey: "user_id" });
Group.belongsToMany(User, { through: UserGroup, foreignKey: "group_id" });
User.hasMany(Sale, { foreignKey: "user_id" });
Sale.belongsTo(User, { foreignKey: "user_id" });

module.exports = { User, Group, UserGroup, Sale };
