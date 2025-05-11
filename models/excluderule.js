const mongoose = require('../db/config')
// Define a schema
const ExcludeRuleSchema = new mongoose.Schema({
    title: String,
    category: String, // product or collection or vendor
    vendor: String,
    product: String, // (type or category text)
    collection: String, // collection name
    product_tag: String, // collection name
});
const ExcludeRule = mongoose.model('ExcludeRule', ExcludeRuleSchema);

module.exports = ExcludeRule;