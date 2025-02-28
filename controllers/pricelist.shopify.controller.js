const { shopify, TESTER_PRICE_LIST_ID, SHOPIFY_SHOP_NAME, apiVersion, SHOPIFY_STOREFRONT_TOKEN } = require("../config/shopify"); // Ensure shopify is properly initialized

const createPriceList = async (name, currency, value, type) => {
  try {
    const mutation = `
        mutation PriceListCreate($input: PriceListCreateInput!) {
          priceListCreate(input: $input) {
            userErrors {
              field
              message
            }
            priceList {
              id
              name
              currency
              parent {
                adjustment {
                  type
                  value
                }
              }
            }
          }
        }`;
    // Input for the mutation

    const queryVariables = {
      input: {
        name: name,
        currency: currency,
        parent: {
          adjustment: {
            type: `PERCENTAGE_${type.toUpperCase() || "DECREASE"}`,
            value: value,
          },
        },
      },
    };
    // Execute the GraphQL mutation'
    const response = await shopify.graphql(mutation, queryVariables);

    // Handle response
    if (
      response.priceListCreate.userErrors &&
      response.priceListCreate.userErrors.length > 0
    ) {
      console.error(
        "PriceList creation errors:",
        response.priceListCreate.userErrors
      );
      throw new Error("PriceList creation failed due to user errors.");
    }

    console.log(
      "PriceList created successfully:",
      response.priceListCreate.priceList
    );

    return response.priceListCreate.priceList;
  } catch (error) {
    console.error("Error creating priceList:", error.message);
    if (error.response) {
      console.error("GraphQL Error Response:", error.response.body);
    }
    throw error;
  }
};

const CHUNK_SIZE = 250; // Shopify's limit for publishablesToAdd

/**
 * Split an array into chunks of a given size.
 * @param {Array} array - The array to split.
 * @param {number} size - The size of each chunk.
 * @returns {Array[]} - An array of chunks.
 */
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
/**
 * Update a single chunk of products.
 * @param {string} publicationId - The ID of the publication to update.
 * @param {string[]} chunk - Array of product IDs for this chunk.
 * @param {Function} shopifyGraphQL - Shopify GraphQL execution function.
 * @returns {Promise<void>}
 */
const updatePriceListPricesChunk = async (
  priceListId,
  chunk,
  removeFlag = false
) => {
  try {
    const mutation = `
      mutation priceListFixedPricesUpdate($priceListId: ID!, $pricesToAdd: [PriceListPriceInput!]!, $variantIdsToDelete: [ID!]!) {
        priceListFixedPricesUpdate(priceListId: $priceListId, pricesToAdd: $pricesToAdd, variantIdsToDelete: $variantIdsToDelete) {
          deletedFixedPriceVariantIds
          priceList {
            id
          }
          userErrors {
            field
            message
          }
        }
      }`;
    const pricesToAdd = chunk.map((v_price) => {
      return {
        price: {
          amount: v_price.amount,
          currencyCode: "EUR",
        },
        compareAtPrice: {
          amount: v_price.compareAtPrice,
          currencyCode: "EUR",
        },
        variantId: v_price.variantId,
      };
    });
    const variantIdsToDelete = chunk.map((v_price) => {
      return v_price.variantId;
    });
    // Input for the mutation
    const queryVariables = removeFlag
      ? {
          priceListId,
          pricesToAdd: [],
          variantIdsToDelete,
        }
      : {
          priceListId,
          pricesToAdd,
          variantIdsToDelete: [],
        };
    console.log("************** Processing Chunk: ", queryVariables);
    // Execute the GraphQL mutation'
    const response = await shopify.graphql(mutation, queryVariables);

    // Handle response
    if (
      response.priceListFixedPricesUpdate.userErrors &&
      response.priceListFixedPricesUpdate.userErrors.length > 0
    ) {
      console.error(
        "PriceListprices  updating errors:",
        response.priceListFixedPricesUpdate.userErrors
      );
      throw new Error("PriceList prices updating failed due to user errors.");
    }

    console.log(
      "PriceList prices updated successfully:",
      response.priceListFixedPricesUpdate.priceList
    );

    return response.priceListFixedPricesUpdate.priceList;
  } catch (error) {
    console.error("Error updating priceList prices:", error.message);
    if (error.response) {
      console.error("GraphQL Error Response:", error.response.body);
    }
    throw error;
  }
};

const updatePriceListPrices = async (
  priceListId,
  prices,
  removeFlag = false
) => {
  try {
    const chunks = chunkArray(prices, CHUNK_SIZE);

    // Process all chunks concurrently using Promise.all
    await Promise.all(
      chunks.map((chunk) =>
        updatePriceListPricesChunk(priceListId, chunk, removeFlag)
      )
    );

    console.log("All chunks processed concurrently.");
  } catch (error) {
    console.error("Error updating priceList prices:", error.message);
    if (error.response) {
      console.error(
        "GraphQL Error Response:",
        JSON.stringify(error.response.body, null, 2)
      );
    }
    throw error;
  }
};
const updatePriceList = async (priceListId, value, type) => {
  try {
    const mutation = `
      mutation priceListUpdate($id: ID!, $input: PriceListUpdateInput!) {
      priceListUpdate(id: $id, input: $input) {
        priceList {
          id
          parent {
            adjustment {
              type
              value
            }
          }
        }
        userErrors {
          message
          field
          code
        }
      }
    }`;
    // Input for the mutation
    const queryVariables = {
      id: `${priceListId}`,
      input: {
        parent: {
          adjustment: {
            value: value,
            type: `PERCENTAGE_${type.toUpperCase()}`,
          },
        },
      },
    };
    // Execute the GraphQL mutation'
    const response = await shopify.graphql(mutation, queryVariables);

    // Handle response
    if (
      response.priceListUpdate.userErrors &&
      response.priceListUpdate.userErrors.length > 0
    ) {
      console.error(
        "PriceList updating errors:",
        response.priceListUpdate.userErrors
      );
      throw new Error("PriceList updating failed due to user errors.");
    }

    console.log(
      "PriceList updated successfully:",
      response.priceListUpdate.priceList
    );

    return response.priceListUpdate.priceList;
  } catch (error) {
    console.error("Error updating priceList:", error.message);
    if (error.response) {
      console.error("GraphQL Error Response:", error.response.body);
    }
    throw error;
  }
};

const removePriceList = async (priceListId) => {
  try {
    const mutation = `
      mutation priceListDelete($id: ID!) {
      priceListDelete(id: $id) {
        deletedId
        userErrors {
          field
          code
          message
        }
      }
    }`;
    // Input for the mutation
    const queryVariables = {
      id: `${priceListId}`,
    };
    // Execute the GraphQL mutation'
    const response = await shopify.graphql(mutation, queryVariables);

    // Handle response
    if (
      response.priceListDelete.userErrors &&
      response.priceListDelete.userErrors.length > 0
    ) {
      console.error(
        "PriceList deleting errors:",
        response.priceListDelete.userErrors
      );
      throw new Error("PriceList deleting failed due to user errors.");
    }

    console.log(
      `PriceList ${response.priceListDelete.deletedId} deleted successfully`
    );
  } catch (error) {
    console.error("Error deleting priceList:", error.message);
    if (error.response) {
      console.error("GraphQL Error Response:", error.response.body);
    }
    throw error;
  }
};

const getProductDiscount = async (req, res) => {

  const { id } = req.params;
  console.log(id);
  const endpoint = `https://${SHOPIFY_SHOP_NAME}/api/2025-01/graphql.json`;
  const query = `
    query {
      priceList(id: "${TESTER_PRICE_LIST_ID}") {
        catalog {
          id
          title
        }
        prices(first: 5, query: "product_id:${id}") {
          nodes {
            price {
              amount
              currencyCode
            }
            variant {
              id
              price
            }
          }
        }
        currency
        parent {
          adjustment {
            type
            value
          }
        }
      }
    }`;
  try {
    // const response = await fetch(endpoint, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    //   },
    //   body: JSON.stringify({ query }),
    // });

    // if (!response.ok) {
    //   throw new Error(`Failed to fetch data: ${response.statusText}`);
    // }

    const response = await shopify.graphql(query);

    const data = response;
    
    console.log(data);

    // Extract product types
    const prices = data.priceList.prices.nodes.map((node) => ({price: node?.price.amount, variantId: node?.variant?.id, compare_at_price: node?.variant?.price}));
    return res.status(200).json(prices);
  } catch (error) {
    console.error("Error fetching product types:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createPriceList,
  updatePriceList,
  removePriceList,
  updatePriceListPrices,
  getProductDiscount,
};
