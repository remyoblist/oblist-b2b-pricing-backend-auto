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


const apply_all_exclude_rule = async () => {
  const url = (`${BASIC_URL}/exclude_rules`);
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.data;
}

const apply_all_pricing_rule = async () => {
  const url = (`${BASIC_URL}/apply_p_rules`);
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.data;
}


(async () => {
    await authenticate();
    await apply_all_pricing_rule();
    await apply_all_exclude_rule();
    
    return;
})();

// module.exports = {
//   apply_all_exclude_rule,
//   apply_all_pricing_rule,
//   authenticate,
//   update_pricing_rule,
//   get_all_pricing_rule,
// }