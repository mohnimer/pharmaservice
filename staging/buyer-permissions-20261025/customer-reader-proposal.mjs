// Customer transport activation proposal. NOT loaded by current/manifest.json.
// Pair with private-quotation-proposal.sql after separately authorized review.
export async function readIssuedCustomerQuotes(sb,schoolId){
 const {data,error}=await sb.rpc('psc_buyer_issued_quotes',{p_school:schoolId});
 if(error)throw error; // Never fall back to direct table reads or cached commercial data.
 if(!Array.isArray(data))throw new Error('Invalid issued quotation response');
 return {quotes:data.map(({issued_lines,...quote})=>quote),lines:data.flatMap(q=>Array.isArray(q.issued_lines)?q.issued_lines:[])};
}
