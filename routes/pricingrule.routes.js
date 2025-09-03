const express = require('express');
const pricingruleController = require('../controllers/pricingrule.controller');
const router = express.Router();

/**
 * Create a new pricingRule
 */
router.post('/', pricingruleController.create);

/**
 * Get a specific pricingRule by ID
 */
router.get('/:id', pricingruleController.getOne);

/**
 * Get all pricingRule
 */
router.get('/', pricingruleController.getAll);

/**
 * Get all pricingRule
 */
router.get('/', pricingruleController.applyAllPricingRules);

/**
 * Update an existing pricingRule by ID
 */
router.put('/:id', pricingruleController.updateOne);

/**
 * Delete a specific pricingRule by ID
 */
router.delete('/:id', pricingruleController.deleteOne);

module.exports = router;
