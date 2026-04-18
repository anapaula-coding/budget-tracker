const { supabase } = require('./_shared');

exports.handler = async function () {
  try {
    const [exp, bud, sav, don, banks] = await Promise.all([
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('budget').select('*').limit(1),
      supabase.from('savings').select('*').order('month'),
      supabase.from('donations').select('*').order('date', { ascending: false }),
      supabase.from('plaid_tokens').select('institution_name, item_id'),
    ]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expenses: exp.data || [],
        budget: bud.data?.[0]?.data || {},
        savings: sav.data || [],
        donations: don.data || [],
        connected_banks: banks.data || [],
      }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
