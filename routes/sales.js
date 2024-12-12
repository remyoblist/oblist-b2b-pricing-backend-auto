const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");
const groupController = require("../controllers/groupController");

// Endpoint for fetching sales analytics
// Endpoint for fetching sales analytics for a user
/**
 * @route GET /user
 * @group Sales - Operations related to sales and analytics
 * @description Fetches sales analytics for a specific user, including total revenue, number of transactions, and average transaction value.
 * @param {string} month.query - The unique identifier for the user. If not provided, analytics for the logged-in user will be returned.
 * @param {string} userId.query - (optional) The unique identifier for the user. If not provided, analytics for the logged-in user will be returned.
 * @returns {Object} 200 - Success response with user sales data.
 * @returns {Error} 400 - Bad request if userId is invalid or missing parameters are required.
 */
router.get("/user", salesController.getUserSalesAnalytics);

/**
 * @route GET /group
 * @group Group - Operations related to group sales statistics and revenue
 * @description Fetches revenue statistics for a sales group, including total revenue and average revenue per user.
 * @param {string} month.query - The unique identifier for the group. If not provided, default group analytics will be fetched.
 * @param {string} groupId.query - (optional) The unique identifier for the group. If not provided, default group analytics will be fetched.
 * @returns {Object} 200 - Success response with group revenue data.
 * @returns {Error} 400 - Bad request if groupId is invalid or missing parameters are required.
 */
router.get("/group", groupController.getGroupRevenueStats);

// CRUD routes for sales
router.post("/", salesController.createSale); // Create a new sale
router.get("/", salesController.getAllSales); // Get all sales
router.get("/:id", salesController.getSaleById); // Get sale by ID
router.put("/:id", salesController.updateSale); // Update sale by ID
router.delete("/:id", salesController.deleteSale); // Delete sale by ID

module.exports = router;

module.exports = router;
