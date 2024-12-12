const { Sale, User, Group, UserGroup } = require("../models");
const { Sequelize } = require("sequelize");
exports.getUserSalesAnalytics = async (req, res) => {
  const { month, userId } = req.query; // Removed granularity since we're grouping by month

  // Validate that 'month' parameter is provided in the correct format
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({
      error: 'The "month" query parameter is required in YYYY-MM format.',
    });
  }

  try {
    // Parse the start and end dates for the specified month
    const startDate = new Date(`${month}-01T00:00:00Z`);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 2,
      0
    );

    // Define the where clause with optional user filtering
    const whereClause = {
      date: {
        [Sequelize.Op.gte]: startDate,
        [Sequelize.Op.lt]: endDate,
      },
    };

    if (userId) {
      if (isNaN(parseInt(userId, 10))) {
        return res.status(400).json({
          error: 'The "userId" query parameter must be a valid integer.',
        });
      }
      whereClause.user_id = parseInt(userId, 10);
    }

    // Query the database for user sales analytics grouped by month
    const userSalesData = await Sale.findAll({
      attributes: [
        [Sequelize.col("User.id"), "user_id"], // Group by User id
        [Sequelize.col("User.name"), "user_name"], // Group by User name
        [Sequelize.fn("SUM", Sequelize.col("Sale.amount")), "total_revenue"], // Total revenue
        [Sequelize.fn("AVG", Sequelize.col("Sale.amount")), "average_revenue"], // Average revenue
        [Sequelize.fn("COUNT", Sequelize.col("Sale.id")), "transactions"], // Average revenue
        [
          Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("Sale.date")),
          "time_window", // Group by month
        ],
      ],
      where: whereClause,
      include: [
        {
          model: User,
          attributes: [], // Do not fetch additional User attributes
        },
      ],
      group: [
        Sequelize.col("User.id"),
        Sequelize.col("User.name"),
        Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("Sale.date")), // Group by month
      ],
      order: [[Sequelize.col("time_window"), "ASC"]], // Order by time window
    });

    // Return the analytics data
    res.json(userSalesData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createSale = async (req, res) => {
  const { user_id, amount, date } = req.body;
  try {
    const sale = await Sale.create({ user_id, amount, date });
    res.status(201).json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create sale" });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll();
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
};

exports.getSaleById = async (req, res) => {
  const { id } = req.params;
  try {
    const sale = await Sale.findByPk(id);
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sale" });
  }
};

exports.updateSale = async (req, res) => {
  const { id } = req.params;
  const { amount, date } = req.body;
  try {
    const sale = await Sale.findByPk(id);
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    await sale.update({ amount, date });
    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update sale" });
  }
};

exports.deleteSale = async (req, res) => {
  const { id } = req.params;
  try {
    const sale = await Sale.findByPk(id);
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    await sale.destroy();
    res.status(204).send(); // No content
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete sale" });
  }
};
