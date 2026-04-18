// netlify/functions/_shared.js
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const { createClient } = require('@supabase/supabase-js');

const plaidEnv = process.env.PLAID_ENV === 'sandbox'
  ? PlaidEnvironments.sandbox
  : PlaidEnvironments.development;

const plaid = new PlaidApi(new Configuration({
  basePath: plaidEnv,
  baseOptions: { headers: {
    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
    'PLAID-SECRET': process.env.PLAID_SECRET,
  }},
}));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function mapCategory(cats) {
  if (!cats?.length) return 'Other';
  const p = cats[0]?.toLowerCase() || '';
  const d = cats[1]?.toLowerCase() || '';
  if (p.includes('food') || d.includes('restaurant') || d.includes('dining')) return 'Food & dining';
  if (p.includes('shops') && d.includes('groceries')) return 'Groceries';
  if (d.includes('taxi') || d.includes('uber') || d.includes('lyft')) return 'Transport & Uber';
  if (p.includes('travel')) return 'Travel';
  if (p.includes('transportation')) return 'Transport & Uber';
  if (p.includes('recreation') || p.includes('entertainment')) return 'Entertainment';
  if (d.includes('subscription')) return 'Subscriptions';
  if (p.includes('health') || p.includes('medical')) return 'Health & fitness';
  if (d.includes('rent') || p.includes('utilities')) return 'Rent & utilities';
  if (p.includes('nightlife')) return 'Going out';
  if (p.includes('shops') || p.includes('shopping')) return 'Shopping';
  return 'Other';
}

module.exports = { plaid, supabase, mapCategory };
