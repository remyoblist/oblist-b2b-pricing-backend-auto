const dotenv = require("dotenv");
const Shopify = require("shopify-api-node");

// Load environment variables from .env file
dotenv.config();
const apiVersion = "2024-10";
const TESTER_PRICE_LIST_ID = "gid://shopify/PriceList/31292424457"

// Fetch credentials from environment variables
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const SHOPIFY_SHOP_NAME = process.env.SHOPIFY_SHOP;

// Check for missing environment variables
if (!SHOPIFY_API_KEY || !SHOPIFY_ACCESS_TOKEN || !SHOPIFY_SHOP_NAME || !SHOPIFY_STOREFRONT_TOKEN) {
  throw new Error(
    "Missing required environment variables: SHOPIFY_API_KEY, SHOPIFY_ACCESS_TOKEN, or SHOPIFY_SHOP_NAME, or SHOPIFY_STOREFRONT_TOKEN."
  );
}

// Initialize the Shopify API library
const shopify = new Shopify({
  shopName: SHOPIFY_SHOP_NAME,
  apiKey: SHOPIFY_API_KEY,
  password: SHOPIFY_ACCESS_TOKEN,
});

// Export the initialized Shopify client
module.exports = { shopify, apiVersion, SHOPIFY_API_KEY, SHOPIFY_ACCESS_TOKEN, SHOPIFY_SHOP_NAME, SHOPIFY_STOREFRONT_TOKEN, TESTER_PRICE_LIST_ID };
