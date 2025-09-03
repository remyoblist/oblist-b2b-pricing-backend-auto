const PricingRule = require("../models/pricingrule");
const { updatePriceListPrices } = require("./pricelist.shopify.controller");
const {} = require("./publication.shopify.controller");

const {
  GetVariants,
  GetCalculatePrices4PriceList,
} = require("./product.shopify.controller");
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
      product_tag,
    } = req.body;

    // Create Pricelist first

    try {
      const variants = await GetVariants({
        productType: product,
        category,
        collectionName: collection,
        Vendor: vendor,
        tag: product_tag,
      });
      const calculatePrices = GetCalculatePrices4PriceList(
        variants,
        pricing_rule.type,
        pricing_rule.percentage
      );
      await updatePriceListPrices(TESTER_PRICE_LIST_ID, calculatePrices);

      const newPricingRule = new PricingRule({
        title: `${category}-${
          category === "Product"
            ? product
            : category === "Vendor"
            ? vendor
            : category === "Collection"
            ? collection
            : category === "Tag"
            ? product_tag
            : ""
        }`,

        vendor,
        pricing_rule,
        category,
        product,
        collection,
        product_tag,
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

// READ all pricing rules and apply All
const applyAllPricingRules = async (req, res) => {
  try {
    const pricingRules = await PricingRule.find();
     
    // Separate the Vintage tag rule from others
    const regularRules = pricingRules.filter(rule => !(rule.category === 'Tag' && rule.product_tag === 'Vintage'));
    let rule_tagVintage = pricingRules.find(rule => rule.category === 'Tag' && rule.product_tag === 'Vintage');
    
    // Process all regular rules in parallel and wait for completion
    await Promise.all(regularRules.map(rule => updateOnePricingRule(rule._id, rule)));

    if(rule_tagVintage) // if there's tag-vintage rule, apply it last
      await updateOnePricingRule(rule_tagVintage._id, rule_tagVintage);

    return res.status(200).json({ message: "All pricing rules applied" });
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


const updateOnePricingRule = async (id, rule) => {
  const {
    title,
    vendor,
    pricing_rule,
    category,
    product,
    collection,
    currency,
    product_tag,
  } = rule;
  const originPricingRule = await PricingRule.findById(id);

  const updatedPricingRule = await PricingRule.findByIdAndUpdate(
    id,
    {
      vendor,
      pricing_rule,
      category,
      product,
      collection,
      product_tag,
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
    tag: product_tag,
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
    tag: product_tag,
  });
  const calculatePrices = GetCalculatePrices4PriceList(
    variants,
    pricing_rule.type,
    pricing_rule.percentage
  );
  await updatePriceListPrices(TESTER_PRICE_LIST_ID, calculatePrices);
};
// UPDATE a pricing rule by ID
const updateOne = async (req, res) => {
  try {
    const { id } = req.params;

    const updateRuleResult = await updateOnePricingRule(id, req.body);
    if (!updateRuleResult) {
      return res.status(404).json({ message: "PricingRule not found" });
    }
    res.status(200).json(updateRuleResult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE a pricing rule by ID
const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    let deletedPricingRule = await PricingRule.findById(id);

    const origin_variants = await GetVariants({
      productType: deletedPricingRule.product,
      category: deletedPricingRule.category,
      collectionName: deletedPricingRule.collection,
      Vendor: deletedPricingRule.vendor,
      tag: deletedPricingRule.product_tag,
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

    deletedPricingRule = await PricingRule.findByIdAndDelete(id);

    if (!deletedPricingRule) {
      return res.status(404).json({ message: "PricingRule not found" });
    }

    res.status(200).json({ message: "PricingRule deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { create, getAll, getOne, updateOne, deleteOne, applyAllPricingRules };
