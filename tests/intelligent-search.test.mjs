import test from 'node:test';
import assert from 'node:assert/strict';
import search from '../current/behaviour/intelligent-search.js';
import handler from '../api/interpret-request.mjs';
import {generateText,Output,jsonSchema} from 'ai';
import {MockLanguageModelV4} from 'ai/test';
test('constrained commands retain context, quantity bounds and authoritative size',()=>{
assert.equal(search.interpret('this is for 3 clinics').intent,'sites');assert.equal(search.interpret('add 0 wheelchairs').invalidQuantity,true);assert.equal(search.interpret('add -2 wheelchairs').invalidQuantity,true);
assert.equal(search.interpret('add 5 boxes',{terms:'gauze',size:'10x10'}).size,'10x10');
assert.equal(search.interpret('add 3 boxes of medium gloves').size,'medium');
assert.equal(search.interpret('something for measuring blood pressure').terms,'blood pressure');
assert.equal(search.validate({intent:'execute_sql'}),null);
assert.equal(search.validate({intent:'add',quantity:10001}).quantity,null);
const rows=[{pscSku:'old',name:'Gauze 10 x 10',catalogueDisplayName:'Gauze 5 x 5'},{pscSku:'current',name:'Dressing',catalogueDisplayName:'Gauze 10 x 10'}];
assert.deepEqual(search.rank(rows,{terms:'gauze',size:'10x10'}).map(p=>p.pscSku),['current']);
});
test('API fails safely without auth or for invalid input',async()=>{
const call=async req=>{const res={setHeader(){},status(n){this.code=n;return this;},json(v){this.value=v;return this;}};await handler(req,res);return res;};
assert.equal((await call({method:'GET',headers:{}})).code,405);
assert.equal((await call({method:'POST',headers:{},body:{text:'wheelchair'}})).code,401);
assert.equal((await call({method:'POST',headers:{authorization:'Bearer test'},body:{text:'x'.repeat(401)}})).code,400);
});
test('installed AI SDK structured output validates before application',async()=>{
const value=search.interpret('add 2 wheelchairs');
const model=new MockLanguageModelV4({doGenerate:async()=>({content:[{type:'text',text:JSON.stringify(value)}],finishReason:{unified:'stop',raw:undefined},usage:{inputTokens:{total:10},outputTokens:{total:40}},warnings:[]})});
const {output}=await generateText({model,output:Output.object({schema:jsonSchema({type:'object',properties:{intent:{type:'string'},terms:{type:'string'},quantity:{type:'integer'}},required:['intent','terms','quantity']})}),prompt:'Interpret a request'});
assert.equal(search.validate(output).intent,'add');assert.equal(search.validate(output).quantity,2);
});
