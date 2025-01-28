const mongoose = require('../db/config')
// Define a schema
const PricingRuleSchema = new mongoose.Schema({
    title: String,
    catalogId: String,
    price_listId: String,
    publicationId: String,
    category: String, // product or collection or vendor
    pricing_rule: Object, // { direction: ‘increase’/’decrease’, percentage : number, fixed: number, currency: string }
    vendor: String,
    product: String, // (type or category text)
    collection: String, // collection name
    currency: String, // collection name
});
const PricingRule = mongoose.model('PricingRule', PricingRuleSchema);

module.exports = PricingRule;