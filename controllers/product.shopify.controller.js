const {
  shopify,
  SHOPIFY_SHOP_NAME,
  SHOPIFY_ACCESS_TOKEN,
} = require("../config/shopify"); // Ensure shopify is properly initialized
const fetch = require("node-fetch");

const apiVersion = "2024-10";
const fetchCollection = async (collectionName) => {
  const baseUrl = `https://${SHOPIFY_SHOP_NAME}/admin/api/${apiVersion}`;
  let collectionId = null;

  const fetchCollections = async (url) => {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.custom_collections || data.smart_collections || [];
    } catch (error) {
      console.error("Error fetching collections:", error);
      return [];
    }
  };

  // First attempt with smart_collections
  let tempUrl = `${baseUrl}/smart_collections.json?title=${encodeURIComponent(
    collectionName
  )}`;
  console.log("Fetching smart collections with URL:", tempUrl);

  let collections = await fetchCollections(tempUrl);

  // If no results, retry with custom_collections
  if (collections.length === 0) {
    console.log("No smart collections found. Trying custom collections...");
    tempUrl = `${baseUrl}/custom_collections.json?title=${encodeURIComponent(
      collectionName
    )}`;
    console.log("Fetching custom collections with URL:", tempUrl);

    collections = await fetchCollections(tempUrl);
  }

  // Process the result
  if (collections.length > 0) {
    console.log("Collection found:", collections[0]);
    collectionId = collections[0].id;
  } else {
    console.log("No collections found with the specified name.");
  }

  return collectionId;
};

const fetchAllProducts = async (basicUrl, accessToken, limit = 250) => {
  let url = `${basicUrl}&limit=${limit}`;
  let products = [];
  let hasNextPage = true;

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  };

  while (hasNextPage) {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    products = products.concat(data.products);

    // Check for pagination
    const linkHeader = response.headers.get("link");
    if (linkHeader && linkHeader.includes('rel="next"')) {
      const nextPageUrl = linkHeader.match(/<([^>]+)>;\s*rel="next"/)[1];
      url = nextPageUrl; // Update URL to the next page
    } else {
      hasNextPage = false; // No more pages
    }
  }

  return products;
};
const GetProducts = async ({
  category = "Product",
  productType,
  collectionName,
  Vendor,
}) => {
  console.log("called get products");
  try {
    let collectionId;
    let productUrl = "";
    if (category.toLowerCase() == "product") {
      productUrl = `https://${SHOPIFY_SHOP_NAME}/admin/api/${apiVersion}/products.json?product_type=${encodeURIComponent(
        productType
      )}`;
    } else if (category.toLowerCase() == "vendor") {
      productUrl = `https://${SHOPIFY_SHOP_NAME}/admin/api/${apiVersion}/products.json?vendor=${encodeURIComponent(
        Vendor
      )}`;
    } else if (category.toLowerCase() == "collection") {
      const collectionId = await fetchCollection(collectionName);

      if (collectionId) {
        console.log("Final Collection ID:", collectionId);
        productUrl = `https://${SHOPIFY_SHOP_NAME}/admin/api/${apiVersion}/products.json?collection_id=${encodeURIComponent(
          collectionId
        )}`;
      } else {
        console.log("Collection not found.");
      }
    } else {
      return;
    }
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
    };
    console.log(productUrl);
    const productIds = await fetchAllProducts(productUrl, SHOPIFY_ACCESS_TOKEN)
      .then((products) => {
        const ids = products.map((product) => product.admin_graphql_api_id);
        return ids;
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });

    return productIds;
  } catch (error) {
    console.error("Error creating priceList:", error.message);
    if (error.response) {
      console.error("GraphQL Error Response:", error.response.body);
    }
    throw error;
  }
};

// GetProducts({ productType: "Vase" });
// GetProducts({ category: "collection", collectionName: "Modern Lighting" });
// GetProducts({ category: "Vendor", Vendor: "Less" });

module.exports = { GetProducts };
