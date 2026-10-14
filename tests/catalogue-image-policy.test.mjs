import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const policy=JSON.parse(readFileSync('data/catalogue-image-policy.json'));
const ctx={window:{},location:{origin:'https://pharmaservice.ae'},URL,Set,Object,crypto:globalThis.crypto};
vm.runInNewContext(readFileSync('current/behaviour/catalogue-image-policy.js','utf8'),ctx);
for(const path of policy.blocked_paths){
 assert(!existsSync('dist'+path),'Rejected image was packaged: '+path);
 assert(ctx.window.PSC_IMAGE_POLICY.isBlocked('https://pharmaservice.ae'+path+'?v=old'));
 assert.equal(ctx.window.PSC_IMAGE_POLICY.resolve(path),policy.replacements[path]||'');
}
for(const target of Object.values(policy.replacements)){
 assert(existsSync('dist'+target),'Clean replacement missing');
 assert(!policy.blocked_sha256.includes(createHash('sha256').update(readFileSync('dist'+target)).digest('hex')));
}
const blockedBytes=readFileSync('.'+policy.blocked_paths[0]);
await assert.rejects(()=>ctx.window.PSC_IMAGE_POLICY.checkFile({arrayBuffer:async()=>blockedBytes.buffer.slice(blockedBytes.byteOffset,blockedBytes.byteOffset+blockedBytes.length)}),/supplier-branded photograph is blocked/);
console.log(`PASS: ${policy.blocked_paths.length} rejected files excluded, ${Object.keys(policy.replacements).length} clean replacements, renamed-file hash rejection`);
