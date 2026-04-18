const { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } = require('plaid');

// Add PLAID_ENV=sandbox in Netlify env vars if using sandbox, otherwise leave unset for development
const env = process.env.PLAID_ENV === 'sandbox'
  ? PlaidEnvironments.sandbox
  : PlaidEnvironments.development;

const plaid = new PlaidApi(new Configuration({
  basePath: env,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
}));

exports.handler = async function () {
  try {
    const response = await plaid.linkTokenCreate({
      user: { client_user_id: 'budget-tracker-user' },
      client_name: 'My Budget Tracker',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ link_token: response.data.link_token }),
    };
  } catch (err) {
    // Surface the actual Plaid error so it's visible in Netlify function logs
    console.error('Link token error:', err.response?.data || err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.response?.data?.error_message || err.message }),
    };
  }
};
