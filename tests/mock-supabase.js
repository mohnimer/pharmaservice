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
    order_lines: ['o0', 'o1'].map(order_id => ({ id:'ol-'+order_id, order_id, psc_sku_snapshot: 'PSC-001', quantity: 1, unit_price: 20, vat_rate: 5 })),
    quotes: ['o0', 'o1'].map(order_id => ({ id:'q-'+order_id, order_id, quote_number: `Q-${order_id}`, validity_days: 7 })),
    quote_lines:['o0','o1'].map(order_id=>({id:'ql-'+order_id,quote_id:'q-'+order_id,order_line_id:'ol-'+order_id,line_no:1,quantity:1,unit_sell_price_ex_vat:20,vat_rate_pct:5})), quote_line_costs:[], order_documents: [], storefronts: [], published_storefront_catalogue: [],
    institutional_enquiries: [{id:'e1',name:'Test buyer',organization:'Test School',contact_email:'buyer@example.invalid',contact_number:'00000',requirement:'Large sterile gauze for two clinics',status:'new',created_at:new Date().toISOString()}],
    custom_requests: [], commercial_actions: [], order_commercial_controls: []
  };
  window.__backendCalls = [];
  window.__tables = tables;
  class Query {
    constructor(table) { this.table = table; this.filters = []; this.action = 'select'; }
    select() { return this; } order() { return this; } range(start,end) { this.bounds=[start,end];return this; } limit() { return this; }
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
        let rows = (tables[this.table] || []).filter(row => this.filters.every(f => f(row)));
        if(this.action==='upsert'){
          const values=Array.isArray(this.value)?this.value:[this.value];tables[this.table]??=[];
          rows=values.map(value=>{const old=tables[this.table].find(r=>this.table==='order_commercial_controls'?r.order_id===value.order_id:r.entity_type===value.entity_type&&r.entity_id===value.entity_id);if(old){Object.assign(old,value);return old;}tables[this.table].push(structuredClone(value));return value;});
        }
        if(this.bounds)rows=rows.slice(this.bounds[0],this.bounds[1]+1);
        if (this.action === 'update') rows.forEach(row => Object.assign(row, this.value));
        return { data: this.one ? rows[0] || null : structuredClone(rows), error: null };
      }).then(resolve, reject);
    }
  }
  let signedIn=role!=='anonymous';
  const getSession=()=>signedIn?{access_token:window.__testAccessToken,user:{id:'u1',email:'test@example.invalid'}}:null;
  const client = {
    from: table => new Query(table),
    auth: {
      getSession: async () => ({ data: { session:getSession() }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => {signedIn=true;return {data:{session:getSession()},error:null};},
      signOut: async () => {signedIn=false;return {error:null};}
    },
    rpc: async (name,args) => {
      window.__backendCalls.push({ rpc:name,args });
      if(role==='demo')throw new Error('Demo attempted RPC');
      if(name==='psc_ensure_quote')return {data:tables.quotes.find(q=>q.order_id===args.p_order_id)?.id,error:null};
      if(name==='psc_set_commercial_status')return {data:null,error:{message:'Verify required funding against a receipt, or record approved credit terms'}};
      if(name!=='psc_submit_institutional_request')throw new Error('Unexpected RPC in shell regression test');
      if(window.__submissionFailOnce){window.__submissionFailOnce=false;return {data:null,error:{message:'Simulated network failure'}};}
      let row=tables.orders.find(o=>o.submission_key===args.p_submission_key);
      if(!row){row={id:'saved-'+args.p_submission_key,order_number:'PSC-REQ-TEST-'+args.p_submission_key,submission_key:args.p_submission_key,school_id:args.p_school_id,group_id:'g1',status:'under_review',note:args.p_note,created_at:new Date().toISOString()};tables.orders.push(row);tables.order_lines.push(...args.p_lines.map(l=>({...l,order_id:row.id})));}
      return {data:{id:row.id,order_number:row.order_number},error:null};
    }
  };
  window.supabase = { createClient: () => client };
})();
