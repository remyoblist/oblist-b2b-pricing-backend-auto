const express = require('express');
const { getAllProductTypes } = require('../controllers/product.shopify.controller');

const router = express.Router();

router.get('/types', getAllProductTypes);

module.exports = router;
