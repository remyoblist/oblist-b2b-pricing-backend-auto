const ExcludeRule = require("../models/excluderule");
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
      category,
      product,
      collection,
      currency,
      product_tag,
    } = req.body;

    // Create Pricelist first

    try {
        const newExcludeRule = new ExcludeRule({
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
        category,
        product,
        collection,
        product_tag,
      });
      const savedExcludeRule = await newExcludeRule.save();

      await applyExcludedRule(newExcludeRule);
      res.status(201).json(savedExcludeRule);
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
    const ExcludeRules = await ExcludeRule.find();
    res.status(200).json(ExcludeRules);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ a single pricing rule by ID
const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await ExcludeRule.findById(id);
    if (!ExcludeRule) {
      return res.status(404).json({ message: "rule not found" });
    }
    res.status(200).json(ExcludeRule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE a pricing rule by ID
const updateOne = async (req, res) => {
  try {
    const updatedExcludeRule = await ExcludeRule.findByIdAndUpdate(
      id,
      {
        vendor,
        category,
        product,
        collection,
        product_tag,
      },
      { new: true }
    );

    if (!updatedExcludeRule) {
      return res.status(404).json({ message: "ExcludeRule not found" });
    }

    applyExcludedRule(updatedExcludeRule);

    res.status(200).json(updatedExcludeRule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE a pricing rule by ID
const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    let deletedExcludeRule = await ExcludeRule.findByIdAndDelete(id);

    if (!deletedExcludeRule) {
      return res.status(404).json({ message: "ExcludeRule not found" });
    }

    res.status(200).json({ message: "ExcludeRule deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const applyAllExcludedRules = async (req, res) => {
  try {
    const ExcludeRules = await ExcludeRule.find();
    for(rule in ExcludeRules)
      await applyExcludedRule(rule);
    res.status(200).json({ message: "Successfully Excluded" });
  } catch (error) {
    res.status(400).json({ message: "Error Occred while applying exclusions" });
  }
}
const applyExcludedRule = async (ExcludeRule) => {
  const origin_variants = await GetVariants({
    productType: ExcludeRule.product,
    category: ExcludeRule.category,
    collectionName: ExcludeRule.collection,
    Vendor: ExcludeRule.vendor,
    tag: ExcludeRule.product_tag,
  });
  const origin_calculatePrices = GetCalculatePrices4PriceList(
    origin_variants,
    'decrease',
    0
  );
  await updatePriceListPrices(
    TESTER_PRICE_LIST_ID,
    origin_calculatePrices,
    true
  );
}

module.exports = { create, getAll, getOne, updateOne, deleteOne, applyAllExcludedRules };
