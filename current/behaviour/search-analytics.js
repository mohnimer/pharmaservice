(function(root){
  'use strict';
  // Bounded, anonymous session events. No storage, user IDs or clinical free text.
  // Only catalogue vocabulary survives; unrecognized language is redacted.
  const events=[];let pending=null;
  function safeQuery(query){const index=root.PS_PRODUCT_KNOWLEDGE_INDEX?.records||[];const vocabulary=new Set(index.flatMap(r=>root.PS_PRODUCT_KNOWLEDGE.tokens([r.displayName,r.brand,...r.descriptions].join(' '))));const words=root.PS_PRODUCT_KNOWLEDGE.tokens(query);return words.length&&words.every(t=>vocabulary.has(t))?String(query).slice(0,160):'[redacted]';}
  function record(event,data={}){if(!['search','clicked','added','clarification_selected','unlisted','abandoned'].includes(event))return;const originalQuery=data.query?safeQuery(data.query):null;const row={event,originalQuery,normalizedQuery:originalQuery&&originalQuery!=='[redacted]'?root.PS_PRODUCT_KNOWLEDGE.clean(originalQuery):null,intent:data.intent||null,productsReturned:Array.isArray(data.resultIds)?data.resultIds.length:null,productId:data.productId||null,clarification:!!data.clarification};events.push(row);if(events.length>200)events.shift();if(event==='search')pending=row;if(['clicked','added','unlisted'].includes(event))pending=null;root.dispatchEvent?.(new CustomEvent('ps:search-analytics',{detail:row}));}
  function report(){const counts=new Map();for(const e of events)if(e.event==='search'&&e.productsReturned===0&&e.normalizedQuery)counts.set(e.normalizedQuery,(counts.get(e.normalizedQuery)||0)+1);return {events:events.map(x=>({...x})),catalogueGaps:[...counts].sort((a,b)=>b[1]-a[1]).map(([query,count])=>({query,count})),retention:'Current browser session only; no cross-user aggregation configured'};}
  root.addEventListener?.('pagehide',()=>{if(pending)record('abandoned',{query:pending.originalQuery});});
  root.PS_SEARCH_ANALYTICS={record,report};
})(typeof window==='undefined'?globalThis:window);
