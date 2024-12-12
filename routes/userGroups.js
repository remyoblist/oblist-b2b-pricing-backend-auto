const express = require('express');
const router = express.Router();
const userGroupController = require('../controllers/userGroupController');

// Routes for managing user-group relationships
router.post('/', userGroupController.createUserGroup);       // Create a new user-group relationship
router.get('/', userGroupController.getAllUserGroups);       // Get all user-group relationships
router.delete('/', userGroupController.deleteUserGroup);     // Delete a user-group relationship

module.exports = router;
