const { shopify } = require("../config/shopify"); // Ensure shopify is properly initialized

const createPublication = async () => {
  try {
    const mutation = `
      mutation publicationCreate($input: PublicationCreateInput!) {
        publicationCreate(input: $input) {
          publication {
            id
            name
            autoPublish
            collections(first: 10) {
              edges {
                node {
                  id
                  title
                }
              }
            }
            products(first: 10) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Input for the mutation
    const queryVariables = {
      input: {
        autoPublish: false,
        defaultState: "EMPTY",
      },
    };

    // Execute the GraphQL mutation
    const response = await shopify.graphql(mutation, queryVariables);

    // Check for user errors
    if (
      response.publicationCreate.userErrors &&
      response.publicationCreate.userErrors.length > 0
    ) {
      console.error(
        "Publication creation errors:",
        response.publicationCreate.userErrors
      );
      throw new Error("Publication creation failed due to user errors.");
    }

    console.log(
      "Publication created successfully:",
      response.publicationCreate.publication
    );

    return response.publicationCreate.publication;
  } catch (error) {
    console.error("Error creating publication:", error.message);
    if (error.response) {
      console.error(
        "GraphQL Error Response:",
        JSON.stringify(error.response.body, null, 2)
      );
    }
    throw error;
  }
};
const CHUNK_SIZE = 50; // Shopify's limit for publishablesToAdd

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
const updateChunk = async (publicationId, chunk) => {
  const mutation = `
    mutation publicationUpdate($id: ID!, $input: PublicationUpdateInput!) {
        publicationUpdate(id: $id, input: $input) {
          publication {
            id
            name
            autoPublish
            collections(first: 10) {
              edges {
                node {
                  id
                  title
                }
              }
            }
            products(first: 10) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
    }`;

  const queryVariables = {
    id: publicationId,
    input: {
      publishablesToAdd: chunk,
    },
  };

  console.log("************** Processing Chunk: ", chunk);

  const response = await shopify.graphql(mutation, queryVariables);

  if (
    response.publicationUpdate.userErrors &&
    response.publicationUpdate.userErrors.length > 0
  ) {
    console.error(
      "Publication updating errors:",
      response.publicationUpdate.userErrors
    );
    throw new Error("Publication updating failed due to user errors.");
  }

  console.log(
    `Publication ${response.publicationUpdate.publication.id} updated successfully for chunk`
  );
};
const updatePublication = async (publicationId, productIds) => {
  try {
    const chunks = chunkArray(productIds, CHUNK_SIZE);

    // Process all chunks concurrently using Promise.all
    await Promise.all(
      chunks.map((chunk) => updateChunk(publicationId, chunk))
    );

    console.log("All chunks processed concurrently.");
    // const mutation = `
    // mutation publicationUpdate($id: ID!, $input: PublicationUpdateInput!) {
    //     publicationUpdate(id: $id, input: $input) {
    //       publication {
    //         id
    //         name
    //         autoPublish
    //         collections(first: 10) {
    //           edges {
    //             node {
    //               id
    //               title
    //             }
    //           }
    //         }
    //         products(first: 10) {
    //           edges {
    //             node {
    //               id
    //               title
    //             }
    //           }
    //         }
    //       }
    //       userErrors {
    //         field
    //         message
    //       }
    //     }
    // }`;

    // // Split productIds into chunks of 50
    // const chunks = chunkArray(productIds, CHUNK_SIZE);

    // for (const chunk of chunks) {
    //   const queryVariables = {
    //     id: `${publicationId}`,
    //     input: {
    //       publishablesToAdd: chunk,
    //     },
    //   };

    //   console.log("************** Publication update: ", queryVariables);

    //   // Execute the GraphQL mutation
    //   const response = await shopify.graphql(mutation, queryVariables);

    //   // Check for user errors
    //   if (
    //     response.publicationUpdate.userErrors &&
    //     response.publicationUpdate.userErrors.length > 0
    //   ) {
    //     console.error(
    //       "Publication updating errors:",
    //       response.publicationUpdate.userErrors
    //     );
    //     throw new Error("Publication updating failed due to user errors.");
    //   }

    //   console.log(
    //     `Publication ${response.publicationUpdate.publication.id} updated successfully for chunk`
    //   );
    // }

    // console.log("All chunks processed successfully.");
  } catch (error) {
    console.error("Error updating publication:", error.message);
    if (error.response) {
      console.error(
        "GraphQL Error Response:",
        JSON.stringify(error.response.body, null, 2)
      );
    }
    throw error;
  }
};

const removePublication = async (publicationId) => {
  try {
    const mutation = `
    mutation publicationDelete($id: ID!) {
        publicationDelete(id: $id) {
            deletedId
            userErrors {
                field
                message
            }
        }
    }`;

    // Input for the mutation
    const queryVariables = {
      id: publicationId,
    };

    // Execute the GraphQL mutation
    const response = await shopify.graphql(mutation, queryVariables);

    // Check for user errors
    if (
      response.publicationDelete.userErrors &&
      response.publicationDelete.userErrors.length > 0
    ) {
      console.error(
        "Publication deleting errors:",
        response.publicationDelete.userErrors
      );
      throw new Error("Publication deleting failed due to user errors.");
    }

    console.log(
      `Publication ${response.publicationDelete.deletedId} deleted successfully`
    );

    return response.publicationDelete.publication;
  } catch (error) {
    console.error("Error deleting publication:", error.message);
    if (error.response) {
      console.error(
        "GraphQL Error Response:",
        JSON.stringify(error.response.body, null, 2)
      );
    }
    throw error;
  }
};

module.exports = { createPublication, updatePublication, removePublication };
