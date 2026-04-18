const { plaid, supabase } = require('./_shared');

exports.handler = async function (event) {
  try {
    const { public_token, institution_name } = JSON.parse(event.body);
    const res = await plaid.itemPublicTokenExchange({ public_token });
    await supabase.from('plaid_tokens').upsert(
      { item_id: res.data.item_id, access_token: res.data.access_token, institution_name },
      { onConflict: 'item_id' }
    );
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (e) {
    console.error('exchange-token:', e.response?.data || e.message);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
