const dotenv = require("dotenv");
const Shopify = require("shopify-api-node");

// Load environment variables from .env file
dotenv.config();

// Fetch credentials from environment variables
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_SHOP_NAME = process.env.SHOPIFY_SHOP;

// Check for missing environment variables
if (!SHOPIFY_API_KEY || !SHOPIFY_ACCESS_TOKEN || !SHOPIFY_SHOP_NAME) {
  throw new Error(
    "Missing required environment variables: SHOPIFY_API_KEY, SHOPIFY_ACCESS_TOKEN, or SHOPIFY_SHOP_NAME."
  );
}

// Initialize the Shopify API library
const shopify = new Shopify({
  shopName: SHOPIFY_SHOP_NAME,
  apiKey: SHOPIFY_API_KEY,
  password: SHOPIFY_ACCESS_TOKEN,
});

// Export the initialized Shopify client
module.exports = { shopify, SHOPIFY_API_KEY, SHOPIFY_ACCESS_TOKEN, SHOPIFY_SHOP_NAME };
