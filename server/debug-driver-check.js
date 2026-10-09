const state = {
  drivers: [
    {
      id: 1,
      clerk_id: 'driver-1',
      email: 'driver@example.com',
      first_name: 'Lebo',
      last_name: 'Khumalo',
      stripe_connected_account_id: 'acct_123',
      stripe_account_status: 'connected',
      stripe_onboarding_url: null,
    },
  ],
  driver_withdrawals: [],
  stripe_webhook_events: [],
  driver_ledger_entries: [],
};

const client = {
  state,
  from(table) {
    const rows = state[table];
    console.log('from', table, rows);
    return {
      select() {
        console.log('select called');
        return {
          eq(field, value) {
            const matches = rows.filter((row) => row[field] === value);
            console.log('eq', field, value, matches);
            return {
              maybeSingle: async () => {
                console.log('maybeSingle returned', matches[0] ?? null);
                return matches[0] ?? null;
              },
              in(filterField, values) {
                const filteredMatches = matches.filter((row) => values.includes(row[filterField]));
                console.log('in', filterField, values, filteredMatches);
                return {
                  eq(nextField, nextValue) {
                    const finalMatch = filteredMatches.find((row) => row[nextField] === nextValue);
                    console.log('next eq', nextField, nextValue, finalMatch);
                    return { maybeSingle: async () => finalMatch ?? null };
                  },
                  maybeSingle: async () => filteredMatches[0] ?? null,
                };
              },
            };
          },
          maybeSingle: async () => rows[0] ?? null,
        };
      },
      insert(payload) {
        const records = Array.isArray(payload) ? payload : [payload];
        for (const record of records) rows.push({ ...record });
        return { select() { return { single: async () => records[0] }; } };
      },
      update(payload) {
        return {
          eq(field, value) {
            const row = rows.find((entry) => entry[field] === value);
            if (row) Object.assign(row, payload);
            return { select() { return { single: async () => row ?? payload }; } };
          },
        };
      },
    };
  },
};

(async () => {
  const row = await client.from('drivers').select('id, clerk_id').eq('clerk_id', 'driver-1').maybeSingle();
  console.log('final row', row);
})();
