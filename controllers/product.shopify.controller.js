const {
  apiVersion,
  SHOPIFY_SHOP_NAME,
  SHOPIFY_ACCESS_TOKEN,
  SHOPIFY_STOREFRONT_TOKEN,
  shopify,
} = require("../config/shopify"); // Ensure shopify is properly initialized
const fetch = require("node-fetch");

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
const fetchAllProductsByTag = async (tag) => {
  const query = `
    query ($cursor: String) {
      products(query: "tag:Vintage", first: 250, after: $cursor) {
        edges {
          cursor
          node {
            id
            title
            vendor
            productType
            tags
            variants(first: 20) {
              edges {
                node {
                  id
                  price
                  title
                }
              }
            }
            images(first: 20) {
              edges {
                node {
                  id
                }
              }
            }
            options {
              id
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }`;

  let hasNextPage = true;
  let cursor = null;
  const products = [];

  try {
    while (hasNextPage) {
      const variables = cursor ? { cursor } : {};
      const res = await shopify.graphql(query, variables);
      const extractNumericId = (gid) => {
        // Split the GID by '/' and return the last segment
        return gid.split("/").pop();
      };

      if (res.products.edges.length > 0) {
        res.products.edges.forEach((edge) => {
          // Ensure the product has the exact tag
          if (edge.node.tags.includes(tag)) {
            const variants = edge.node.variants.edges.map((edge) => {
              return {
                id: extractNumericId(edge.node.id),
                price: edge.node.price,
                title: edge.node.title,
              };
            });
            const images = edge.node.images.edges.map((edge) => {
              return {
                id: extractNumericId(edge.node.id),
              };
            });
            products.push({
              id: extractNumericId(edge.node.id),
              title: edge.node.title,
              vendor: edge.node.vendor,
              productType: edge.node.productType,
              tags: edge.node.tags,
              variants: variants,
              images: images,
              options: edge.node.options,
            });
          }
        });

        // Update cursor and hasNextPage for the next iteration
        cursor = res.products.edges[res.products.edges.length - 1].cursor;
        hasNextPage = res.products.pageInfo.hasNextPage;
      } else {
        hasNextPage = false;
      }
    }

    return products;
  } catch (error) {
    console.error("Error fetching products by tag:", error);
    return [];
  }
};

const GetProducts = async ({
  category = "Product",
  productType,
  collectionName,
  Vendor,
  tag,
}) => {
  try {
    let collectionId;
    let productUrl = "";
    if (category.toLowerCase() == "tag") {
      const productIds = fetchAllProductsByTag(tag);
      return productIds;
    } else if (category.toLowerCase() == "product") {
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
        return products;
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

const GetVariants = async ({
  category = "Product",
  productType,
  collectionName,
  Vendor,
  tag,
  tag_list,
}) => {
  const products = await GetProducts({
    category,
    productType,
    collectionName,
    Vendor,
    tag,
  });
  let no_tag_products;
  let variants = [];
  
  if (category.toLowerCase() === "tag") {
    no_tag_products = products; // or handle appropriately if 'tag' category should result in an empty list
  } else {
    no_tag_products = products.filter((product) => {
      return !tag_list.some((pre_tag) => product.tags.includes(pre_tag));
    });
  }
  no_tag_products.forEach((product) => {
    const product_variants = product?.variants;
    for (let i = 0; i < product_variants.length; i++) {
      variants.push(product_variants[i]);
    }
  });

  return variants;
};

const GetCalculatePrices4PriceList = (variants, priceType, percentage) => {
  const multier =
    priceType.toLowerCase() == "decrease"
      ? (100 - percentage) / 100.0
      : (100 + percentage) / 100.0;
  const calculatePrices = variants.map((variant) => {
    return {
      compareAtPrice: variant.price,
      amount: variant.price * multier,
      variantId: `gid://shopify/ProductVariant/${variant.id}`,
    };
  });

  return calculatePrices;
};

const getAllProductTypes = async (req, res) => {
  const endpoint = `https://${SHOPIFY_SHOP_NAME}/api/${apiVersion}/graphql.json`;
  console.log(endpoint);
  const query = `
    {
      productTypes(first: 100) {
        edges {
          node
        }
      }
    }
  `;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract product types
    const productTypes = data.data.productTypes.edges.map((edge) => edge.node);
    return res.status(200).json(productTypes);
  } catch (error) {
    console.error("Error fetching product types:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getAllProductTags = async (req, res) => {
  const endpoint = `https://${SHOPIFY_SHOP_NAME}/api/${apiVersion}/graphql.json`;
  console.log(endpoint);
  const query = `
    {
      productTags(first: 100) {
        edges {
          node
        }
      }
    }
  `;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract product types
    const productTypes = data.data.productTags.edges.map((edge) => edge?.node);
    return res.status(200).json(productTypes);
  } catch (error) {
    console.error("Error fetching product types:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GetProducts({ productType: "Table Lamps" });
// GetProducts({ category: "collection", collectionName: "Modern Lighting" });
// GetProducts({ category: "Vendor", Vendor: "Less" });
// getAllProductTypes();
// GetProducts({ category: "tag", tag: "Vintage" });

module.exports = {
  GetProducts,
  getAllProductTypes,
  GetVariants,
  GetCalculatePrices4PriceList,
  getAllProductTags,
};
