const express = require('express');
const groupController = require('../controllers/GroupController');
const router = express.Router();

/**
 * Get a specific group by ID
 */
router.get('/:groupId', groupController.getGroupById);

/**
 * Create a new group
 */
router.post('/', groupController.createGroup);

/**
 * Update an existing group by ID
 */
router.put('/:groupId', groupController.updateGroup);

/**
 * Delete a specific group by ID
 */
router.delete('/:groupId', groupController.deleteGroup);

module.exports = router;
