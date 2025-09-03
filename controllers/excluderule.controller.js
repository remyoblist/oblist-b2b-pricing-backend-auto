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

const create_or_not_b2b_exclude = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Bad Body" });
    }
    const { vendor, acceptB2b } = req.body;

    // Normalize acceptB2b to boolean
    const acceptB2bNormalized =
      acceptB2b === true ||
      (typeof acceptB2b === "string" &&
        ["true", "yes"].includes(acceptB2b.toLowerCase()));

    // Check if exclude rule exists for this vendor
    const existingRule = await ExcludeRule.findOne({ vendor, category: 'vendor' });

    if (acceptB2bNormalized) {
      // If rule exists and vendor now accepts B2B, remove the rule
      if (existingRule) {
        await ExcludeRule.deleteOne({ _id: existingRule._id });
        return res.status(200).json({ msg: 'Removed from excluding rules list since the vendor accepts b2b' });
      } else {
        // No rule to remove, just respond
        return res.status(200).json({ msg: 'Vendor accepts b2b, no exclusion rule present' });
      }
    } else {
      // If vendor does not accept B2B, create rule if not exists
      if (!existingRule) {
        try {
          const newExcludeRule = new ExcludeRule({
            title: `vendor-${vendor}`,
            vendor,
            category: 'vendor',
            product: '',
            collection: '',
            product_tag: '',
          });
          const savedExcludeRule = await newExcludeRule.save();
          await applyExcludedRule(newExcludeRule);
          return res.status(201).json(savedExcludeRule);
        } catch (error) {
          console.error("An error occurred:", error);
          return res.status(500).json({ message: 'Error creating exclusion rule' });
        }
      } else {
        // Rule already exists, just respond
        return res.status(200).json(existingRule);
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

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
  const { id } = req.params;
  const { vendor, category, product, collection, product_tag } = req.body;
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
    const excludeRules = await ExcludeRule.find();

    await Promise.all(excludeRules.map(rule => applyExcludedRule(rule)));

    // excludeRules.forEach(async (rule) => {
    //   await applyExcludedRule(rule);
    // });
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

module.exports = { create, getAll, getOne, updateOne, deleteOne, applyAllExcludedRules, create_or_not_b2b_exclude };
