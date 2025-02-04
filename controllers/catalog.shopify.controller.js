const { shopify, SHOPIFY_SHOP_NAME, apiVersion, SHOPIFY_STOREFRONT_TOKEN, SHOPIFY_ACCESS_TOKEN } = require("../config/shopify"); // Ensure shopify is properly initialized

const createCatalog = async (
  catalogTitle,
  catalogPriceListId,
  catalogPublicationId
) => {
  try {
    const mutation = `
        mutation catalogCreate($input: CatalogCreateInput!) {
          catalogCreate(input: $input) {
            catalog {
              id
              title
              status
            }
            userErrors {
              field
              message
            }
          }
        }`;
    // Input for the mutation
    const context = {
      companyLocationIds: [], // Replace with valid IDs
    };

    const status = "ACTIVE"; // Catalog status
    const title = catalogTitle; // Replace with your desired title
    const priceListId = catalogPriceListId; // If null, will be excluded
    const publicationId = catalogPublicationId; // If null, will be excluded
    

    const queryVariables = {
      input: {
        context,
        status, // Catalog status
        title, // Replace with your desired title
        priceListId, // Add priceListId only if it's not null
        publicationId, // Add publicationId only if it's not null
      },
    };

    // Execute the GraphQL mutation'
    const response = await shopify.graphql(mutation, queryVariables);

    // Handle response
    if (
      response.catalogCreate.userErrors &&
      response.catalogCreate.userErrors.length > 0
    ) {
      console.error(
        "Catalog creation errors:",
        response.catalogCreate.userErrors
      );
      throw new Error("Catalog creation failed due to user errors.");
    }

    console.log(
      "Catalog created successfully:",
      response.catalogCreate.catalog
    );

    return response.catalogCreate.catalog;
  } catch (error) {
    console.error("Error creating catalog:", error.message);
    if (error.response) {
      console.error("GraphQL Error Response:", error.response.body);
    }
    throw error;
  }
};

const updateCatalog = async (catalogId, CatalogUpdateInput) => {
  try {
    const mutation = `
      mutation catalogUpdate($id: ID!, $input: CatalogUpdateInput!) {
      catalogUpdate(id: $id, input: $input) {
        catalog {
          id
          title
          status
        }
        userErrors {
          field
          message
        }
      }
    }`;
    // Input for the mutation
    const queryVariables = {
      id: catalogId,
      input: CatalogUpdateInput,
    };

    // Execute the GraphQL mutation'
    const response = await shopify.graphql(mutation, queryVariables);

    // Handle response
    if (
      response.catalogUpdate.userErrors &&
      response.catalogUpdate.userErrors.length > 0
    ) {
      console.error(
        "Catalog updating errors:",
        response.catalogUpdate.userErrors
      );
      throw new Error("Catalog updating failed due to user errors.");
    }

    console.log(
      "Catalog updated successfully:",
      response.catalogUpdate.catalog
    );

    return response.catalogUpdate.catalog;
  } catch (error) {
    console.error("Error updating catalog:", error.message);
    if (error.response) {
      console.error("GraphQL Error Response:", error.response.body);
    }
    throw error;
  }
};

const removeCatalog = async (catalogId) => {
  try {
    const mutation = `
    mutation catalogDelete($deleteDependentResources: Boolean, $id: ID!) {
      catalogDelete(deleteDependentResources: $deleteDependentResources, id: $id) {
        deletedId
        userErrors {
          field
          message
        }
      }
    }`;
    // Input for the mutation
    const queryVariables = {
      deleteDependentResources: true,
      id: catalogId,
    };

    // Execute the GraphQL mutation'
    const response = await shopify.graphql(mutation, queryVariables);

    // Handle response
    if (
      response.catalogDelete.userErrors &&
      response.catalogDelete.userErrors.length > 0
    ) {
      console.error(
        "Catalog deleting errors:",
        response.catalogDelete.userErrors
      );
      throw new Error("Catalog deleting failed due to user errors.");
    }

    console.log(
      `Catalog ${response.catalogDelete.deletedId} deleted successfully:`
    );
  } catch (error) {
    console.error("Error deleting catalog:", error.message);
    if (error.response) {
      console.error("GraphQL Error Response:", error.response.body);
    }
    throw error;
  }
};

module.exports = {
  createCatalog,
  updateCatalog,
  removeCatalog,
};
