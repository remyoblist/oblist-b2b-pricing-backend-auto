const express = require('express');
const excluderuleController = require('../controllers/excluderule.controller');
const router = express.Router();

/**
 * Create a new pricingRule
 */
router.post('/', excluderuleController.create);

/**
 * Get a specific pricingRule by ID
 */
router.get('/:id', excluderuleController.getOne);

/**
 * Get all pricingRule
 */
router.get('/', excluderuleController.getAll);

/**
 * Update an existing pricingRule by ID
 */
router.put('/:id', excluderuleController.updateOne);

/**
 * Delete a specific pricingRule by ID
 */
router.delete('/:id', excluderuleController.deleteOne);

module.exports = router;
