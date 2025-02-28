const express = require('express');
const { getAllProductTypes } = require('../controllers/product.shopify.controller');
const { getProductDiscount } = require('../controllers/pricelist.shopify.controller');

const router = express.Router();

router.get('/types', getAllProductTypes);
router.get('/discount/:id', getProductDiscount);

module.exports = router;
