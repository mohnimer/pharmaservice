/* Public products; account access begins at the request step. */
(() => {
 'use strict';
 function resume(){
  if(window.PSC_CURRENT_ROUTE()!=='portal/dashboard')return;
  let pending='',query='';try{pending=sessionStorage.getItem('pscPendingRoute')||'';query=sessionStorage.getItem('pscPendingSearch')||'';}catch{}
  if(!(pending.startsWith('portal/')||pending==='start'))return;
  try{sessionStorage.removeItem('pscPendingRoute');sessionStorage.removeItem('pscPendingSearch');}catch{}
  window.PSC_NAVIGATE(pending,query?{searchQuery:query}:undefined);
 }
 window.addEventListener('hashchange',()=>setTimeout(resume,0));window.addEventListener('popstate',()=>setTimeout(resume,0));
})();
