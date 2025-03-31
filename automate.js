const axios = require('axios');
const env = require('dotenv');

env.config();

let authToken = '';
const BASIC_URL = 'https://oblist-b2b-pricing-backend.onrender.com/api'

const authenticate = async () => {
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const response = await axios.post(`${BASIC_URL}/login`, { email, password });
    const { token } = response.data;

    // Store token
    authToken = token;
}
const update_pricing_rule = async (
    id,
    updatedData
  ) => {
    const url = `${BASIC_URL}/pricing_rule/${id}`;
  
    try {
      const response = await axios.put(url, updatedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
  
      console.log(`Pricing rule with ID ${id} updated successfully.`);
      return response.data; // Return updated pricing rule
    } catch (error) {
      console.error(`Error updating pricing rule with ID ${id}:`, error);
      throw new Error(error.response?.data?.message || "Failed to update pricing rule");
    }
  };
  
const get_all_pricing_rule = async () => {
  
    const url = (`${BASIC_URL}/pricing_rule`);
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
}

(async () => {
    await authenticate();
    const arr_pricing_rule = await get_all_pricing_rule();
    for (const rule of arr_pricing_rule) {
        try {
            const resp = await update_pricing_rule(rule._id, rule);
            console.log(resp);
        } catch (error) {
            console.error(`Error updating rule ${rule._id}:`, error);
        }
    }
    return;
})();