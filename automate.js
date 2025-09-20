const axios = require('axios');
const env = require('dotenv');
const { fetchCollection } = require('./controllers/product.shopify.controller');
const { shopify } = require('./config/shopify');

env.config();

let authToken = '';
const BASIC_URL = 'https://oblist-b2b-pricing-backend.onrender.com/api'

const authenticate = async () => {
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const response = await axios.post(`${BASIC_URL}/login`, { email, password });
    const { token } = response.data;

    // Store token
    authToken = token;
}
const update_pricing_rule = async (
    id,
    updatedData
  ) => {
    const url = `${BASIC_URL}/pricing_rule/${id}`;
  
    try {
      const response = await axios.put(url, updatedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
  
      console.log(`Pricing rule with ID ${id} updated successfully.`);
      return response.data; // Return updated pricing rule
    } catch (error) {
      console.error(`Error updating pricing rule with ID ${id}:`, error);
      throw new Error(error.response?.data?.message || "Failed to update pricing rule");
    }
  };
  
const get_all_pricing_rule = async () => {
  
    const url = (`${BASIC_URL}/pricing_rule`);
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
}


const apply_all_exclude_rule = async () => {
  const url = (`${BASIC_URL}/exclude_rules`);
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.data;
}

const apply_all_pricing_rule = async () => {
  const url = (`${BASIC_URL}/apply_p_rules`);
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.data;
}

const getCollectionProducts = async (collectionName, limit = 0) => {
  const collectionId = await fetchCollection(collectionName);
  let hasNextPage = true;
  let cursor = null;
  let allProducts = [];
  let descriptionHtml = null;

  while (hasNextPage) {
    const query = `query ($cursor: String) {
      collection(id: "gid://shopify/Collection/${collectionId}") {
        title
        descriptionHtml
        products(first: 250, after: $cursor) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              title
            }
          }
        }
      }
    }`;

    const variables = cursor ? { cursor } : {};
    const response = await shopify.graphql(query, variables);

    // Set collection title only once
    if (descriptionHtml === null && response.descriptionHtml) {
      descriptionHtml = response.collection.descriptionHtml;
    }

    const edges = response.collection?.products?.edges || [];
    edges.forEach(edge => {
      allProducts.push({
        id: edge.node.id,
        title: edge.node.title,
      });
    });

    if (limit > 0 && allProducts.length >= limit) {
      allProducts = allProducts.slice(0, limit);
      break;
    }
    hasNextPage = response.collection?.products?.pageInfo?.hasNextPage;
    if (hasNextPage && edges.length > 0) {
      cursor = edges[edges.length - 1].cursor;
    } else {
      hasNextPage = false;
    }
  }

  return {
    description: descriptionHtml,
    products: allProducts,
  };
};

const removeAllProductsfromCollection = async (collectionName) => {
  const collectionId = await fetchCollection(collectionName);
  console.log("Collection ID:", collectionId);
  const mutation = `
    mutation collectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
      collectionRemoveProducts(id: $id, productIds: $productIds) {
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Fetch all products in the collection
  const { products } = await getCollectionProducts("New Arrivals");
  const productIds = products.map(p => p.id);

  // Shopify allows a maximum of 250 product IDs per request
  const chunkSize = 250;

  try {
    for (let i = 0; i < productIds.length; i += chunkSize) {
      const chunk = productIds.slice(i, i + chunkSize);
      const variables = {
        id: `gid://shopify/Collection/${collectionId}`,
        productIds: chunk
      };

      const response = await shopify.graphql(mutation, variables);
      if (response.collectionRemoveProducts.userErrors && response.collectionRemoveProducts.userErrors.length > 0) {
        throw new Error(
          response.collectionRemoveProducts.userErrors.map(e => e.message).join("; ")
        );
      }
    }
  } catch (error) {
    console.error("Error removing products from collection:", error);
    throw error;
  }
};

const addProductsToCollection = async (collectionId, productIds) => {
  const mutation = `
    mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
      collectionAddProducts(id: $id, productIds: $productIds) {
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Shopify allows a maximum of 250 product IDs per request
  const chunkSize = 250;
  for (let i = 0; i < productIds.length; i += chunkSize) {
    const chunk = productIds.slice(i, i + chunkSize);
    const variables = {
      id: collectionId,
      productIds: chunk
    };

    try {
      const response = await shopify.graphql(mutation, variables);
      if (response.collectionAddProducts.userErrors && response.collectionAddProducts.userErrors.length > 0) {
        throw new Error(
          response.collectionAddProducts.userErrors.map(e => e.message).join("; ")
        );
      }
    } catch (error) {
      console.error("Error adding products to collection:", error);
      throw error;
    }
  }
};

(async () => {
  const {products} = await getCollectionProducts("New Arrivals Temp", 400);
  products.forEach(product => {
    console.log(product);
  });

  await removeAllProductsfromCollection("New Arrivals").then(() => {
    console.log("All products removed from collection successfully.");
  });

  const collection_id = await fetchCollection("New Arrivals");

  await new Promise(resolve => setTimeout(resolve, 20000));
  console.log("Collection ID fetched:", collection_id);

  if (collection_id) {
    await addProductsToCollection(`gid://shopify/Collection/${collection_id}`, products.map(p => p.id)).then(() => {
      console.log("Products added to collection successfully.");
    }).catch(error => {
      console.error("Error:", error);
    });
  }
})();

// (async () => {
//     await authenticate();
//     await apply_all_pricing_rule();
//     await apply_all_exclude_rule();
    
//     return;
// })();

// module.exports = {
//   apply_all_exclude_rule,
//   apply_all_pricing_rule,
//   authenticate,
//   update_pricing_rule,
//   get_all_pricing_rule,
// }