const PricingRule = require("../models/pricingrule");
const {
  createPriceList,
  updatePriceList,
} = require("./pricelist.shopify.controller");
const {
  createPublication,
  updatePublication,
  removePublication,
} = require("./publication.shopify.controller");

const { GetProducts } = require("./product.shopify.controller");
const {
  createCatalog,
  updateCatalog,
  removeCatalog,
} = require("./catalog.shopify.controller");

// CREATE a new pricing rule
const create = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Bad Body" });
    }
    const {
      title,
      vendor,
      pricing_rule,
      category,
      product,
      collection,
      currency,
    } = req.body;

    // Create Pricelist first

    const new_pricielist = await createPriceList(
      `Pricing-${category}-${title}-${pricing_rule.type}-${pricing_rule.percentage}%-${currency}`,
      currency,
      pricing_rule.percentage,
      pricing_rule.type
    );
    console.log("************************** priceListId:", new_pricielist.id);

    // Create publication

    const new_publication = await createPublication();
    console.log(
      "************************** publicationId: ",
      new_publication.id
    );

    const productIds = await GetProducts({
      category: category,
      productType: product,
      collectionName: collection,
      Vendor: vendor,
    });
    await updatePublication(new_publication.id, productIds);

    // Create Catalog

    const new_catalog = await createCatalog(
      title,
      new_pricielist.id,
      new_publication.id
    );
    console.log("************************** catalogId:", new_catalog.id);

    if (typeof pricing_rule != "object") {
      return res.status(400).json({ message: "Pricing Rule should be Object" });
    }

    const newPricingRule = new PricingRule({
      title,
      catalogId: new_catalog.id,
      price_listId: new_pricielist.id,
      publicationId: new_publication.id,
      vendor,
      pricing_rule,
      category,
      product,
      collection,
      currency
    });

    const savedPricingRule = await newPricingRule.save();
    res.status(201).json(savedPricingRule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all pricing rules
const getAll = async (req, res) => {
  try {
    const pricingRules = await PricingRule.find();
    res.status(200).json(pricingRules);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ a single pricing rule by ID
const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const pricingRule = await PricingRule.findById(id);
    if (!pricingRule) {
      return res.status(404).json({ message: "PricingRule not found" });
    }
    res.status(200).json(pricingRule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE a pricing rule by ID
const updateOne = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      vendor,
      pricing_rule,
      category,
      product,
      collection,
      currency,
    } = req.body;

    const originPricingRule = await PricingRule.findById(id);

    const updatedPricingRule = await PricingRule.findByIdAndUpdate(
      id,
      {
        title,
        vendor,
        pricing_rule,
        category,
        product,
        collection,
        currency,
      },
      { new: true }
    );

    if (!updatedPricingRule) {
      return res.status(404).json({ message: "PricingRule not found" });
    }

    const catalogId = originPricingRule.catalogId;
    const price_listId = originPricingRule.price_listId;
    const publicationId = originPricingRule.publicationId;

    let new_publication_id = undefined;
    if (
      originPricingRule.category != updatedPricingRule.category ||
      originPricingRule.vendor != updatedPricingRule.vendor ||
      originPricingRule.product != updatedPricingRule.product ||
      originPricingRule.collection != updatedPricingRule.collection
    ) {
      // needs publication update
      try {
        await removePublication(publicationId);
      } catch (e) {
        console.log(`Skipping remove publication error`);
      }
      const new_publication = await createPublication();
      const productIds = await GetProducts({
        category: category,
        productType: product,
        collectionName: collection,
        Vendor: vendor,
      });
      await updatePublication(new_publication.id, productIds);
      new_publication_id = new_publication.id;
    }
    if (
      updatedPricingRule.pricing_rule.type !=
        originPricingRule.pricing_rule.type ||
      updatedPricingRule.pricing_rule.percentage !=
        originPricingRule.pricing_rule.percentage
    ) {
      // needs publication update
      await updatePriceList(
        price_listId,
        pricing_rule.percentage,
        pricing_rule.type
      );
    }
    updateCatalog(catalogId, {title, publicationId: new_publication_id ? new_publication_id: originPricingRule.publicationId });

    res.status(200).json(updatedPricingRule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE a pricing rule by ID
const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPricingRule = await PricingRule.findByIdAndDelete(id);

    const catalogId = deletedPricingRule.catalogId;

    removeCatalog(catalogId);
    if (!deletedPricingRule) {
      return res.status(404).json({ message: "PricingRule not found" });
    }

    res.status(200).json({ message: "PricingRule deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { create, getAll, getOne, updateOne, deleteOne };
