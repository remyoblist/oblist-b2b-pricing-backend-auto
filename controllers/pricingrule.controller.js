const PricingRule = require("../models/pricingrule");
const {
  createPriceList,
  updatePriceList,
  updatePriceListPrices,
} = require("./pricelist.shopify.controller");
const {
  createPublication,
  updatePublication,
  removePublication,
} = require("./publication.shopify.controller");

const {
  GetProducts,
  GetVariants,
  GetCalculatePrices4PriceList,
} = require("./product.shopify.controller");
const {
  createCatalog,
  updateCatalog,
  removeCatalog,
} = require("./catalog.shopify.controller");
const { TESTER_PRICE_LIST_ID } = require("../config/shopify");

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

    try {
      const variants = await GetVariants({
        productType: product,
        category,
        collectionName: collection,
        Vendor: vendor,
      });
      const calculatePrices = GetCalculatePrices4PriceList(
        variants,
        pricing_rule.type,
        pricing_rule.percentage
      );
      await updatePriceListPrices(
        TESTER_PRICE_LIST_ID,
        calculatePrices
      );

      const newPricingRule = new PricingRule({
        title: `${category}-${product}${vendor}${collection}`,
        vendor,
        pricing_rule,
        category,
        product,
        collection,
      });
      const savedPricingRule = await newPricingRule.save();
      res.status(201).json(savedPricingRule);
    } catch (error) {
      console.error("An error occurred:", error);
    }
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
        vendor,
        pricing_rule,
        category,
        product,
        collection,
      },
      { new: true }
    );

    if (!updatedPricingRule) {
      return res.status(404).json({ message: "PricingRule not found" });
    }

    const origin_variants = await GetVariants({
      productType: originPricingRule.product,
      category: originPricingRule.category,
      collectionName: originPricingRule.collection,
      Vendor: originPricingRule.vendor,
    });
    const origin_calculatePrices = GetCalculatePrices4PriceList(
      origin_variants,
      pricing_rule.type,
      pricing_rule.percentage
    );
    await updatePriceListPrices(
      TESTER_PRICE_LIST_ID,
      origin_calculatePrices,
      true
    );

    const variants = await GetVariants({
      productType: product,
      category,
      collectionName: collection,
      Vendor: vendor,
    });
    const calculatePrices = GetCalculatePrices4PriceList(
      variants,
      pricing_rule.type,
      pricing_rule.percentage
    );
    await updatePriceListPrices(
      TESTER_PRICE_LIST_ID,
      calculatePrices
    );

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

    const origin_variants = await GetVariants({
      productType: deletedPricingRule.product,
      category: deletedPricingRule.category,
      collectionName: deletedPricingRule.collection,
      Vendor: deletedPricingRule.vendor,
    });
    const origin_calculatePrices = GetCalculatePrices4PriceList(
      origin_variants,
      deletedPricingRule.pricing_rule.type,
      deletedPricingRule.pricing_rule.percentage
    );
    await updatePriceListPrices(
      TESTER_PRICE_LIST_ID,
      origin_calculatePrices,
      true
    );

    if (!deletedPricingRule) {
      return res.status(404).json({ message: "PricingRule not found" });
    }

    res.status(200).json({ message: "PricingRule deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { create, getAll, getOne, updateOne, deleteOne };
