(() => {
  'use strict';

  const sb = window.PSC_SUPABASE;
  if (!sb) {
    console.warn('V39.29 quote persistence: Supabase client unavailable.');
    return;
  }

  const UI_TO_DB_STATUS = {
    Drafting: 'under_review',
    Sent: 'quote_sent',
    Authorized: 'confirmed',
    Procurement: 'under_process',
    Delivery: 'out_for_delivery',
    Accepted: 'delivered',
    Cancelled: 'cancelled'
  };

  const UI_TO_QUOTE_STATUS = {
    Drafting: 'draft',
    Sent: 'sent',
    Authorized: 'confirmed',
    Procurement: 'confirmed',
    Delivery: 'confirmed',
    Accepted: 'confirmed',
    Cancelled: 'cancelled'
  };

  let adminPromise = null;
  let hydrating = false;

  function clean(v){
    const s = String(v ?? '').trim();
    return s === '' ? null : s;
  }

  function numeric(v){
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function familyLineKey(ol){
    const mode = ol.brand_preference_mode || 'no_preference';
    const choice =
      mode === 'specific_option'
        ? (ol.product_option_id || '')
        : mode === 'other_brand'
          ? String(ol.requested_brand || '').trim().toLowerCase()
          : 'no-preference';
    const safe = v => encodeURIComponent(String(v || ''));
    return `family:${safe(ol.family_id)}:${safe(ol.requested_presentation || '')}:${mode}:${safe(choice)}`;
  }

  function orderLineKey(ol){
    return ol.family_id ? familyLineKey(ol) : (ol.psc_sku_snapshot || '');
  }

  async function currentAdmin(){
    if(window.PSC_IS_DEMO_ACCOUNT?.()) return null;
    if (adminPromise) return adminPromise;
    adminPromise = (async () => {
      const { data: sessionData } = await sb.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return null;
      const { data: profile, error } = await sb
        .from('profiles')
        .select('user_id,is_psc_admin')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error || !profile?.is_psc_admin) return null;
      return user;
    })();
    return adminPromise;
  }

  async function findOrder(orderNumber){
    const { data, error } = await sb
      .from('orders')
      .select('id,order_number,status,quote_ref')
      .eq('order_number', orderNumber)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function ensureQuote(order){
    if (!order?.id) throw new Error('Order not found.');
    const { data, error } = await sb.rpc('psc_ensure_quote', {
      p_order_id: order.id,
      p_quote_number: order.quote_ref || null
    });
    if (error) throw error;
    return data;
  }

  async function sourceMaps(orderLines){
    const optionIds = [...new Set(orderLines.map(x => x.product_option_id).filter(Boolean))];
    const skus = [...new Set(orderLines.map(x => x.psc_sku_snapshot).filter(Boolean))];

    const optionPromise = optionIds.length
      ? sb.from('catalogue_product_options').select('*').in('id', optionIds)
      : Promise.resolve({ data: [], error: null });

    const productPromise = skus.length
      ? sb.from('products')
          .select('id,psc_sku,name,brand,pack,commercial_specification,supplier_name,supplier_sku,buy_cost,landed_cost,vat_status,stock_status,lead_time,evidence_status,internal_notes')
          .in('psc_sku', skus)
      : Promise.resolve({ data: [], error: null });

    const [{ data: options, error: optionError }, { data: products, error: productError }] =
      await Promise.all([optionPromise, productPromise]);

    if (optionError) throw optionError;
    if (productError) throw productError;

    return {
      optionMap: Object.fromEntries((options || []).map(x => [x.id, x])),
      productMap: Object.fromEntries((products || []).map(x => [x.psc_sku, x]))
    };
  }

  async function ensureQuoteLines(order, quoteId){
    const { data: orderLines, error: orderLineError } = await sb
      .from('order_lines')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });
    if (orderLineError) throw orderLineError;

    const { data: existing, error: existingError } = await sb
      .from('quote_lines')
      .select('id,order_line_id,line_no')
      .eq('quote_id', quoteId);
    if (existingError) throw existingError;

    const existingByOrderLine = new Map((existing || []).map(x => [x.order_line_id, x]));
    const { optionMap, productMap } = await sourceMaps(orderLines || []);

    for (let i = 0; i < (orderLines || []).length; i++) {
      const ol = orderLines[i];
      let ql = existingByOrderLine.get(ol.id);

      if (!ql) {
        const p = productMap[ol.psc_sku_snapshot] || null;
        const option = optionMap[ol.product_option_id] || null;

        const payload = {
          quote_id: quoteId,
          order_line_id: ol.id,
          line_no: i + 1,
          product_id: ol.product_id || p?.id || null,
          family_id: ol.family_id || null,
          product_option_id: ol.product_option_id || null,
          psc_sku_snapshot: ol.psc_sku_snapshot || null,
          line_description_snapshot: ol.line_description,
          brand_model_snapshot: ol.brand_model_snapshot || option?.exact_product_name || p?.brand || null,
          presentation_snapshot: ol.requested_presentation || option?.presentation || null,
          pack_snapshot: ol.pack_snapshot || option?.pack || p?.pack || null,
          specification_snapshot: p?.commercial_specification || null,
          quantity: Number(ol.quantity),
          unit_sell_price_ex_vat: ol.unit_price === null ? null : Number(ol.unit_price),
          vat_rate_pct: ol.vat_rate === null ? null : Number(ol.vat_rate),
          price_basis: ol.unit_price === null ? 'quote_led' : 'existing_order_line'
        };

        const { data: inserted, error: insertError } = await sb
          .from('quote_lines')
          .insert(payload)
          .select('id,order_line_id,line_no')
          .single();
        if (insertError) throw insertError;
        ql = inserted;
        existingByOrderLine.set(ol.id, ql);
      }

      const option = optionMap[ol.product_option_id] || null;
      const p = productMap[ol.psc_sku_snapshot] || null;

      if (option || p) {
        const sourceSnapshot = option ? {
          source_type: 'catalogue_product_option',
          product_option_id: option.id,
          family_id: option.family_id,
          exact_product_name: option.exact_product_name,
          brand: option.brand,
          presentation: option.presentation,
          pack: option.pack,
          supplier_name: option.supplier_name,
          supplier_reference: option.supplier_reference,
          b2b_cost: option.b2b_cost,
          vat: option.vat,
          stock: option.stock,
          expiry_batch: option.expiry_batch,
          verification_date: option.verification_date,
          psc_decision: option.psc_decision,
          price_evidence_status: option.price_evidence_status,
          price_source_reference: option.price_source_reference,
          price_quote_date: option.price_quote_date,
          price_valid_to: option.price_valid_to,
          availability_status: option.availability_status,
          availability_verified_at: option.availability_verified_at,
          availability_valid_until: option.availability_valid_until,
          availability_evidence_reference: option.availability_evidence_reference
        } : {
          source_type: 'product_master',
          product_id: p.id,
          psc_sku: p.psc_sku,
          name: p.name,
          brand: p.brand,
          pack: p.pack,
          supplier_name: p.supplier_name,
          supplier_sku: p.supplier_sku,
          buy_cost: p.buy_cost,
          landed_cost: p.landed_cost,
          vat_status: p.vat_status,
          stock_status: p.stock_status,
          lead_time: p.lead_time,
          evidence_status: p.evidence_status
        };

        const costPayload = option ? {
          quote_line_id: ql.id,
          supplier_name_snapshot: option.supplier_name || null,
          supplier_reference_snapshot: option.supplier_reference || null,
          unit_buy_cost: numeric(option.b2b_cost),
          freight_delivery_cost: numeric(option.freight_delivery_cost) || 0,
          install_labour_cost: numeric(option.install_labour_cost) || 0,
          foc_other_direct_cost: numeric(option.foc_other_direct_cost) || 0,
          target_gm: numeric(option.target_gm) ?? 0.20,
          price_evidence_status: option.price_evidence_status || null,
          price_source_reference: option.price_source_reference || null,
          price_quote_date: option.price_quote_date || null,
          price_valid_to: option.price_valid_to || null,
          stock_status: option.stock || null,
          availability_status: option.availability_status || null,
          availability_verified_at: option.availability_verified_at || null,
          vat_evidence_note: option.vat_evidence_note || null,
          margin_override_reason: option.margin_override_reason || null,
          pricing_note: option.pricing_note || null,
          source_snapshot: sourceSnapshot
        } : {
          quote_line_id: ql.id,
          supplier_name_snapshot: p.supplier_name || null,
          supplier_reference_snapshot: p.supplier_sku || null,
          unit_buy_cost: numeric(p.buy_cost),
          unit_landed_cost: numeric(p.landed_cost),
          price_evidence_status: p.evidence_status || null,
          stock_status: p.stock_status || null,
          lead_time_snapshot: p.lead_time || null,
          source_snapshot: sourceSnapshot
        };

        // Do not overwrite a manually entered landed cost with source data.
        const { data: currentCost } = await sb
          .from('quote_line_costs')
          .select('quote_line_id,unit_landed_cost')
          .eq('quote_line_id', ql.id)
          .maybeSingle();

        if (!currentCost) {
          const { error: costError } = await sb.from('quote_line_costs').insert(costPayload);
          if (costError) throw costError;
        } else {
          const safeUpdate = { ...costPayload };
          delete safeUpdate.quote_line_id;
          if (currentCost.unit_landed_cost !== null && currentCost.unit_landed_cost !== undefined) {
            delete safeUpdate.unit_landed_cost;
          }
          const { error: costUpdateError } = await sb
            .from('quote_line_costs')
            .update(safeUpdate)
            .eq('quote_line_id', ql.id);
          if (costUpdateError) throw costUpdateError;
        }
      }
    }

    return orderLines || [];
  }

  async function quoteContext(orderNumber){
    const user = await currentAdmin();
    if (!user) return null;

    const order = await findOrder(orderNumber);
    if (!order) throw new Error(`Order ${orderNumber} was not found.`);

    const quoteId = await ensureQuote(order);
    const orderLines = await ensureQuoteLines(order, quoteId);

    const { data: quote, error: quoteError } = await sb
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();
    if (quoteError) throw quoteError;

    const { data: quoteLines, error: qlError } = await sb
      .from('quote_lines')
      .select('*')
      .eq('quote_id', quoteId)
      .order('line_no');
    if (qlError) throw qlError;

    const ids = (quoteLines || []).map(x => x.id);
    const { data: costs, error: costError } = ids.length
      ? await sb.from('quote_line_costs').select('*').in('quote_line_id', ids)
      : { data: [], error: null };
    if (costError) throw costError;

    const orderLineMap = Object.fromEntries(orderLines.map(x => [x.id, x]));
    const costMap = Object.fromEntries((costs || []).map(x => [x.quote_line_id, x]));
    const byKey = {};

    for (const line of quoteLines || []) {
      const ol = orderLineMap[line.order_line_id];
      if (!ol) continue;
      byKey[orderLineKey(ol)] = { line, cost: costMap[line.id] || null, orderLine: ol };
    }

    return { user, order, quoteId, quote, quoteLines: quoteLines || [], costs: costs || [], byKey };
  }

  async function recalc(quoteId){
    const { error } = await sb.rpc('psc_recalculate_quote', { p_quote_id: quoteId });
    if (error) throw error;
  }

  async function recordEvent(quoteId, type, oldStatus, newStatus, note, metadata = null){
    const user = await currentAdmin();
    if (!user) return;
    const { error } = await sb.from('quote_events').insert({
      quote_id: quoteId,
      event_type: type,
      old_status: oldStatus || null,
      new_status: newStatus || null,
      note: note || null,
      actor_user_id: user.id,
      metadata
    });
    if (error) throw error;
  }

  async function snapshot(quoteId, kind, note){
    const { error } = await sb.rpc('psc_capture_quote_snapshot', {
      p_quote_id: quoteId,
      p_snapshot_kind: kind,
      p_note: note || null
    });
    if (error) throw error;
  }

  async function saveQuoteField(el){
    const raw = el.dataset.quoteField || '';
    const first = raw.indexOf('|');
    const last = raw.lastIndexOf('|');
    if (first <= 0 || last <= first) return;

    const orderNumber = raw.slice(0, first);
    const key = raw.slice(first + 1, last);
    const field = raw.slice(last + 1);
    const ctx = await quoteContext(orderNumber);
    if (!ctx) return;

    const target = ctx.byKey[key];
    if (!target) throw new Error(`Could not match quotation line ${key}.`);

    const value = numeric(el.value);

    if (field === 'sell') {
      const { error } = await sb
        .from('quote_lines')
        .update({ unit_sell_price_ex_vat: value })
        .eq('id', target.line.id);
      if (error) throw error;

      const { error: compatibilityError } = await sb
        .from('order_lines')
        .update({ unit_price: value })
        .eq('id', target.orderLine.id);
      if (compatibilityError) throw compatibilityError;
    }

    if (field === 'vat') {
      const { error } = await sb
        .from('quote_lines')
        .update({ vat_rate_pct: value })
        .eq('id', target.line.id);
      if (error) throw error;

      const { error: compatibilityError } = await sb
        .from('order_lines')
        .update({ vat_rate: value })
        .eq('id', target.orderLine.id);
      if (compatibilityError) throw compatibilityError;
    }

    if (field === 'cost') {
      const sell = target.line.unit_sell_price_ex_vat === null
        ? null
        : Number(target.line.unit_sell_price_ex_vat);
      const gm = (sell !== null && sell > 0 && value !== null)
        ? (sell - value) / sell
        : null;

      const payload = {
        quote_line_id: target.line.id,
        unit_landed_cost: value,
        direct_cost_total: value === null ? null : value * Number(target.line.quantity),
        calculated_gm: gm,
        pricing_note: value === null ? null : 'Direct cost / unit entered in PSC Deal Desk'
      };

      const { error } = await sb
        .from('quote_line_costs')
        .upsert(payload, { onConflict: 'quote_line_id' });
      if (error) throw error;
    }

    await recalc(ctx.quoteId);
    await sb.from('quotes').update({ last_edited_by: ctx.user.id }).eq('id', ctx.quoteId);
  }

  async function saveQuoteMeta(el){
    const raw = el.dataset.quoteMeta || '';
    const split = raw.indexOf('|');
    if (split <= 0) return;

    const orderNumber = raw.slice(0, split);
    const field = raw.slice(split + 1);
    const ctx = await quoteContext(orderNumber);
    if (!ctx) return;

    const payload = { last_edited_by: ctx.user.id };
    if (field === 'delivery') payload.delivery_terms = clean(el.value);
    if (field === 'terms') payload.payment_terms = clean(el.value);

    const { error } = await sb.from('quotes').update(payload).eq('id', ctx.quoteId);
    if (error) throw error;
  }

  function realQuoteNumber(orderNumber){
    const year = new Date().getFullYear();
    const tail = String(orderNumber || '').replace(/\D/g, '').slice(-8) || String(Date.now()).slice(-8);
    return `PSC-Q-${year}-${tail}`;
  }

  async function saveQuoteReference(el){
    const orderNumber = el.dataset.quoteRef;
    if (!orderNumber) return;
    const ctx = await quoteContext(orderNumber);
    if (!ctx) return;

    const ref = clean(el.value);
    if (!ref) return;

    const { error: quoteError } = await sb
      .from('quotes')
      .update({ quote_number: ref, last_edited_by: ctx.user.id })
      .eq('id', ctx.quoteId);
    if (quoteError) throw quoteError;

    const { error: orderError } = await sb
      .from('orders')
      .update({ quote_ref: ref })
      .eq('id', ctx.order.id);
    if (orderError) throw orderError;
  }

  async function saveStatus(el){
    const orderNumber = el.dataset.requestStatus;
    const uiStatus = el.value;
    if (!orderNumber || !UI_TO_DB_STATUS[uiStatus]) return;

    const ctx = await quoteContext(orderNumber);
    if (!ctx) return;

    const oldOrderStatus = ctx.order.status;
    const dbStatus = UI_TO_DB_STATUS[uiStatus];
    const quoteStatus = UI_TO_QUOTE_STATUS[uiStatus] || ctx.quote.status;
    const now = new Date().toISOString();

    const orderPayload = { status: dbStatus };
    const quotePayload = {
      status: quoteStatus,
      last_edited_by: ctx.user.id
    };

    if (uiStatus === 'Sent') {
      let ref = ctx.quote.quote_number;
      if (!ref || ref.startsWith('PSC-DRAFT-')) ref = realQuoteNumber(orderNumber);

      quotePayload.quote_number = ref;
      quotePayload.sent_at = ctx.quote.sent_at || now;
      quotePayload.issued_by = ctx.user.id;

      orderPayload.quote_ref = ref;

      const validityDays = Number(ctx.quote.validity_days || 0);
      if (validityDays > 0 && !ctx.quote.expires_at) {
        quotePayload.expires_at = new Date(Date.now() + validityDays * 86400000).toISOString();
      }
    }

    if (uiStatus === 'Authorized') {
      quotePayload.confirmed_at = ctx.quote.confirmed_at || now;
    }

    if (uiStatus === 'Cancelled') {
      quotePayload.cancelled_at = ctx.quote.cancelled_at || now;
      orderPayload.cancelled_at = now;
    }

    if (uiStatus === 'Accepted') {
      orderPayload.delivered_at = now;
    }

    const { error: orderError } = await sb.from('orders').update(orderPayload).eq('id', ctx.order.id);
    if (orderError) throw orderError;

    const { error: quoteError } = await sb.from('quotes').update(quotePayload).eq('id', ctx.quoteId);
    if (quoteError) throw quoteError;

    if (oldOrderStatus !== dbStatus) {
      await sb.from('status_history').insert({
        order_id: ctx.order.id,
        status: dbStatus,
        note: `Deal Desk status changed to ${uiStatus}`,
        changed_by: ctx.user.id
      });
      await recordEvent(ctx.quoteId, 'status_changed', ctx.quote.status, quoteStatus, `Deal Desk status changed to ${uiStatus}`, {
        old_order_status: oldOrderStatus,
        new_order_status: dbStatus
      });
    }

    await recalc(ctx.quoteId);

    if (uiStatus === 'Sent') {
      await snapshot(ctx.quoteId, 'issued', 'Quotation issued from PSC Deal Desk');
    }
    if (uiStatus === 'Authorized' || uiStatus === 'Cancelled') {
      await snapshot(ctx.quoteId, 'customer_decision', `Quotation ${uiStatus.toLowerCase()}`);
    }
  }

  async function syncCustomerDecision(orderNumber, action){
    if(window.PSC_IS_DEMO_ACCOUNT?.()) return;
    if (!orderNumber) return;
    const order = await findOrder(orderNumber);
    if (!order) return;

    const { data: quote, error } = await sb
      .from('quotes')
      .select('*')
      .eq('order_id', order.id)
      .maybeSingle();
    if (error || !quote) return;

    const now = new Date().toISOString();
    const status = action === 'confirm' ? 'confirmed' : 'cancelled';
    const payload = { status };
    if (action === 'confirm') payload.confirmed_at = quote.confirmed_at || now;
    if (action === 'cancel') payload.cancelled_at = quote.cancelled_at || now;

    await sb.from('quotes').update(payload).eq('id', quote.id);
    await sb.from('quote_events').insert({
      quote_id: quote.id,
      event_type: action === 'confirm' ? 'customer_confirmed' : 'customer_cancelled',
      old_status: quote.status,
      new_status: status,
      note: action === 'confirm' ? 'Customer confirmed quotation' : 'Customer cancelled quotation',
      actor_user_id: (await sb.auth.getSession()).data?.session?.user?.id || null
    });

    // Customer cannot execute the admin-only snapshot RPC; PSC status/event remains authoritative.
  }

  async function hydrateInputs(){
    if (hydrating) return;
    const fields = [...document.querySelectorAll('[data-quote-field]')];
    if (!fields.length) return;
    const user = await currentAdmin();
    if (!user) return;

    hydrating = true;
    try {
      const groups = {};
      for (const el of fields) {
        const raw = el.dataset.quoteField || '';
        const first = raw.indexOf('|');
        const last = raw.lastIndexOf('|');
        if (first <= 0 || last <= first) continue;
        const orderNumber = raw.slice(0, first);
        const key = raw.slice(first + 1, last);
        const field = raw.slice(last + 1);
        (groups[orderNumber] ||= []).push({ el, key, field });
      }

      for (const [orderNumber, entries] of Object.entries(groups)) {
        const order = await findOrder(orderNumber);
        if (!order) continue;

        const { data: quote } = await sb
          .from('quotes')
          .select('id')
          .eq('order_id', order.id)
          .maybeSingle();
        if (!quote?.id) continue;

        const { data: orderLines } = await sb
          .from('order_lines')
          .select('*')
          .eq('order_id', order.id)
          .order('created_at')
          .order('id');

        const { data: quoteLines } = await sb
          .from('quote_lines')
          .select('*')
          .eq('quote_id', quote.id);

        const qIds = (quoteLines || []).map(x => x.id);
        const { data: costs } = qIds.length
          ? await sb.from('quote_line_costs').select('*').in('quote_line_id', qIds)
          : { data: [] };

        const orderMap = Object.fromEntries((orderLines || []).map(x => [x.id, x]));
        const costMap = Object.fromEntries((costs || []).map(x => [x.quote_line_id, x]));
        const keyMap = {};

        for (const ql of quoteLines || []) {
          const ol = orderMap[ql.order_line_id];
          if (!ol) continue;
          keyMap[orderLineKey(ol)] = { line: ql, cost: costMap[ql.id] || null };
        }

        for (const { el, key, field } of entries) {
          const row = keyMap[key];
          if (!row) continue;

          if (field === 'cost' && row.cost?.unit_landed_cost !== null && row.cost?.unit_landed_cost !== undefined) {
            const v = Number(row.cost.unit_landed_cost);
            if (Number.isFinite(v) && Number(el.value) !== v) el.value = String(v);
          }
          if (field === 'sell' && row.line.unit_sell_price_ex_vat !== null && row.line.unit_sell_price_ex_vat !== undefined) {
            const v = Number(row.line.unit_sell_price_ex_vat);
            if (Number.isFinite(v) && Number(el.value) !== v) el.value = String(v);
          }
          if (field === 'vat' && row.line.vat_rate_pct !== null && row.line.vat_rate_pct !== undefined) {
            el.value = String(Number(row.line.vat_rate_pct));
          }
        }
      }
    } catch (err) {
      console.warn('V39.29 quote hydration failed:', err);
    } finally {
      hydrating = false;
    }
  }

  function reportError(label, err){
    console.error(`V39.29 ${label}:`, err);
  }

  document.addEventListener('change', event => {
    const el = event.target;
    if (!(el instanceof HTMLElement)) return;

    if (el.matches('[data-quote-field]')) {
      saveQuoteField(el).catch(err => reportError('quote field persistence failed', err));
    }

    if (el.matches('[data-quote-meta]')) {
      saveQuoteMeta(el).catch(err => reportError('quote metadata persistence failed', err));
    }

    if (el.matches('[data-quote-ref]')) {
      saveQuoteReference(el).catch(err => reportError('quote reference persistence failed', err));
    }

    if (el.matches('[data-request-status]')) {
      saveStatus(el).catch(err => reportError('status persistence failed', err));
    }
  });

  document.addEventListener('click', event => {
    const el = event.target instanceof Element ? event.target.closest('[data-confirm-quote],[data-cancel-quote]') : null;
    if (!el) return;

    const orderNumber = el.getAttribute('data-confirm-quote') || el.getAttribute('data-cancel-quote');
    const action = el.hasAttribute('data-confirm-quote') ? 'confirm' : 'cancel';

    // Let the core app complete its existing customer order update first.
    setTimeout(() => {
      syncCustomerDecision(orderNumber, action).catch(err => reportError('customer quote decision sync failed', err));
    }, 400);
  });

  let queued = false;
  function scheduleHydrate(){
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      hydrateInputs();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleHydrate, { once: true });
  } else {
    scheduleHydrate();
  }

  const app = document.getElementById('app');
  if (app) window.PSC_ENHANCEMENTS.createObserver(scheduleHydrate).observe(app, { childList: true, subtree: true });
  window.addEventListener('hashchange', scheduleHydrate);
})();
