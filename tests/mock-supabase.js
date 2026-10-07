// Test-only transport: every backend call stays inside this browser context.
(() => {
  const role = window.__testRole || 'anonymous';
  const schools = [
    { id: 's1', group_id: 'g1', name: 'Test Institution', campus_name: 'Site One', active: true },
    { id: 's2', group_id: 'g1', name: 'Test Institution', campus_name: 'Site Two', active: true }
  ];
  const tables = {
    profiles: [{ user_id: 'u1', full_name: 'Test User', is_psc_admin: role === 'admin' }],
    memberships: [{ user_id: 'u1', group_id: 'g1', school_id: null, role: 'group_admin' }],
    account_groups: [{ id: 'g1', name: 'Test Group', slug: role === 'demo' ? 'psc-demo-group' : 'test-live-group' }],
    schools,
    orders: ['s1', 's2'].map((school_id, i) => ({ id: `o${i}`, school_id, group_id: 'g1', order_number: `TEST-QUOTE-${i}`, status: 'quote_sent', created_at: new Date().toISOString() })),
    order_lines: ['o0', 'o1'].map(order_id => ({ order_id, psc_sku_snapshot: 'PSC-001', quantity: 1, unit_price: 20, vat_rate: 5 })),
    quotes: ['o0', 'o1'].map(order_id => ({ order_id, quote_number: `Q-${order_id}`, validity_days: 7 })),
    order_documents: [], storefronts: [], published_storefront_catalogue: []
  };
  window.__backendCalls = [];
  window.__tables = tables;
  class Query {
    constructor(table) { this.table = table; this.filters = []; this.action = 'select'; }
    select() { return this; } order() { return this; } range() { return this; } limit() { return this; }
    eq(key, value) { this.filters.push(row => row[key] === value); return this; }
    in(key, values) { this.filters.push(row => values.includes(row[key])); return this; }
    single() { this.one = true; return this; } maybeSingle() { this.one = true; return this; }
    insert(value) { this.action = 'insert'; this.value = value; return this; }
    upsert(value) { this.action = 'upsert'; this.value = value; return this; }
    update(value) { this.action = 'update'; this.value = value; return this; }
    delete() { this.action = 'delete'; return this; }
    then(resolve, reject) {
      return Promise.resolve().then(() => {
        window.__backendCalls.push({ table: this.table, action: this.action });
        if (role === 'demo' && this.action !== 'select') throw new Error('Demo attempted a backend write');
        const rows = (tables[this.table] || []).filter(row => this.filters.every(f => f(row)));
        if (this.action === 'update') rows.forEach(row => Object.assign(row, this.value));
        return { data: this.one ? rows[0] || null : structuredClone(rows), error: null };
      }).then(resolve, reject);
    }
  }
  let signedIn=role!=='anonymous';
  const getSession=()=>signedIn?{user:{id:'u1',email:'test@example.invalid'}}:null;
  const client = {
    from: table => new Query(table),
    auth: {
      getSession: async () => ({ data: { session:getSession() }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => {signedIn=true;return {data:{session:getSession()},error:null};},
      signOut: async () => {signedIn=false;return {error:null};}
    },
    rpc: async name => { window.__backendCalls.push({ rpc: name }); throw new Error('Unexpected RPC in shell regression test'); }
  };
  window.supabase = { createClient: () => client };
})();
