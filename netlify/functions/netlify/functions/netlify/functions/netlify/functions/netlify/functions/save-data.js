const { supabase } = require('./_shared');

exports.handler = async function (event) {
  try {
    const { type, payload } = JSON.parse(event.body);
    let error;

    if (type === 'expense') {
      ({ error } = await supabase.from('expenses').insert({
        date: payload.date, amt: payload.amt, desc: payload.desc,
        cat: payload.cat, source: 'manual', plaid_transaction_id: null,
      }));
    } else if (type === 'delete_expense') {
      ({ error } = await supabase.from('expenses').delete().eq('id', payload.id));
    } else if (type === 'budget') {
      ({ error } = await supabase.from('budget').upsert({ id: 1, data: payload }, { onConflict: 'id' }));
    } else if (type === 'saving') {
      ({ error } = await supabase.from('savings').upsert({ month: payload.month, amt: payload.amt }, { onConflict: 'month' }));
    } else if (type === 'delete_saving') {
      ({ error } = await supabase.from('savings').delete().eq('month', payload.month));
    } else if (type === 'donation') {
      ({ error } = await supabase.from('donations').insert({ date: payload.date, amt: payload.amt }));
    } else if (type === 'delete_donation') {
      ({ error } = await supabase.from('donations').delete().eq('id', payload.id));
    }

    if (error) throw error;
    return { statusCode: 200, body: '{"success":true}' };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
