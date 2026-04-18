const { plaid, supabase, mapCategory } = require('./_shared');

exports.handler = async function () {
  const { data: tokens } = await supabase.from('plaid_tokens').select('*');
  if (!tokens?.length) return { statusCode: 200, body: 'No accounts' };

  const start = new Date();
  start.setDate(start.getDate() - 30); // only last 30 days per sync (saves Plaid calls)
  const startDate = start.toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  let all = [];
  for (const token of tokens) {
    try {
      const res = await plaid.transactionsGet({
        access_token: token.access_token,
        start_date: startDate,
        end_date: endDate,
      });
      const mapped = res.data.transactions
        .filter(t => !t.pending && t.amount > 0)
        .map(t => ({
          plaid_transaction_id: t.transaction_id,
          date: t.date,
          amt: t.amount,
          desc: t.merchant_name || t.name || 'Unknown',
          cat: mapCategory(t.category),
          account_name: token.institution_name,
          source: 'plaid',
        }));
      all = all.concat(mapped);
    } catch (e) {
      console.error('Sync error for', token.institution_name, e.message);
    }
  }

  if (all.length) {
    await supabase.from('expenses').upsert(all, {
      onConflict: 'plaid_transaction_id',
      ignoreDuplicates: true,
    });
  }

  return { statusCode: 200, body: `Synced ${all.length} transactions` };
};
