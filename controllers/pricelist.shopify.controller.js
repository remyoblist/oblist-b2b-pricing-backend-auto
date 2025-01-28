const { shopify } = require("../config/shopify"); // Ensure shopify is properly initialized

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
            type: `PERCENTAGE_${type.toUpperCase() || 'DECREASE'}`,
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

module.exports = { createPriceList, updatePriceList, removePriceList };
