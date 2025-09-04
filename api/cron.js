// filepath: e:\Oblist_Workspace\developing_apps\oblist-internal-b2b-pricing\backend\api\cron.js
const { authenticate, apply_all_pricing_rule, apply_all_exclude_rule } = require('../automate');

module.exports = async (req, res) => {
  try {
    await authenticate();
    await apply_all_pricing_rule();
    await apply_all_exclude_rule();
    
    res.status(200).json({ message: 'Cron job executed successfully' });
  } catch (error) {
    console.error('Cron job failed:', error);
    res.status(500).json({ error: 'Cron job failed', details: error.message });
  }
};