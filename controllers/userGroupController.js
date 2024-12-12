const { UserGroup } = require("../models");

exports.createUserGroup = async (req, res) => {
  const { user_id, group_id } = req.body;
  try {
    const userGroup = await UserGroup.create({ user_id, group_id });
    res.status(201).json(userGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user-group association" });
  }
};

exports.getAllUserGroups = async (req, res) => {
  try {
    const userGroups = await UserGroup.findAll();
    res.json(userGroups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user-group associations" });
  }
};

exports.deleteUserGroup = async (req, res) => {
  const { user_id, group_id } = req.body;
  try {
    const userGroup = await UserGroup.findOne({ where: { user_id, group_id } });
    if (!userGroup) {
      return res
        .status(404)
        .json({ error: "User-group association not found" });
    }
    await userGroup.destroy();
    res.status(204).send(); // No content
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user-group association" });
  }
};
