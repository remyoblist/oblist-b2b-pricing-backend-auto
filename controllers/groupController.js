const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
const { Group, User, Sale, UserGroup } = require("../models"); // Adjust imports as needed

exports.getGroupRevenueStats = async (req, res) => {
  const { groupId, month } = req.query; // Assuming groupId and month are passed as params

  if (!groupId || !month) {
    return res.status(400).json({ error: "Group ID and Month are required" });
  }

  try {
    // Find the group by ID
    const group = await Group.findOne({
      where: { id: groupId },
      include: [
        {
          model: User,
          through: {
            model: UserGroup, // Assuming a join table 'UserGroup' for many-to-many relationship
          },
          attributes: ["id"], // Only need the User ID
        },
      ],
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Get the list of user IDs associated with the group
    const userIds = group.Users.map((user) => user.id);

    // Fetch sales data for these users in the given month
    const salesData = await Sale.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("Sale.id")), "transactions"],
        [Sequelize.fn("SUM", Sequelize.col("Sale.amount")), "total_revenue"],
        [Sequelize.fn("AVG", Sequelize.col("Sale.amount")), "average_revenue"],
      ],
      where: {
        user_id: {
          [Op.in]: userIds, // Filtering by the users in the group
        },
        date: {
          [Op.gte]: new Date(`${month}-01`), // Start of the month
          [Op.lt]: new Date(`${month}-01`).setMonth(
            new Date(`${month}-01`).getMonth() + 2
          ), // End of the month
        },
      },
    });

    // If no sales data is found
    if (!salesData || salesData.length === 0) {
      return res.status(404).json({
        error: "No sales data found for this group in the given month",
      });
    }

    // Extract the aggregated values
    const { transactions, total_revenue, average_revenue } =
      salesData[0].dataValues;

    // Return the group revenue stats
    return res.status(200).json({
      group_id: group.id,
      group_name: group.name,
      total_revenue: total_revenue,
      average_revenue: average_revenue,
      transactions: transactions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.createGroup = async (req, res) => {
  const { name } = req.body;
  try {
    const group = await Group.create({ name });
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create group" });
  }
};

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

exports.getGroupById = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch group" });
  }
};

exports.updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    await group.update({ name });
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update group" });
  }
};

exports.deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    await group.destroy();
    res.status(204).send(); // No content
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete group" });
  }
};
