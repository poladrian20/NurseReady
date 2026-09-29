import { createRequire } from 'node:module';
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const req=createRequire(import.meta.url);
const {Miniflare}=await import(req.resolve('miniflare',{paths:[req.resolve('wrangler/package.json')]}));
const root=new URL('../dist/server/',import.meta.url).pathname; const paths=(await readdir(root,{recursive:true})).filter(p=>p.endsWith('.js')||p.endsWith('.mjs')); const modules=['index.js',...paths.filter(p=>p!=='index.js')].map(p=>({type:'ESModule',path:root+p}));
const mf=new Miniflare({modules,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET']});
try{
const db=await mf.getD1Database('DB');
for(const file of ['0000_chilly_saracen.sql','0001_real_nuke.sql']){const sql=await readFile(new URL('../drizzle/'+file,import.meta.url),'utf8');for(const s of sql.split('--> statement-breakpoint'))await db.prepare(s).run();}
const headers={'oai-authenticated-user-id':'nurseready-qa','Content-Type':'application/json'};
let r=await mf.dispatchFetch('https://test.local/api/study');assert.equal(r.status,401);
r=await mf.dispatchFetch('https://test.local/api/study',{headers});assert.equal(r.status,200);assert.equal(await r.json(),null);headers['If-Match']=r.headers.get('ETag');
const value={notes:[],attempts:[],bookmarks:['aki'],annotations:{aki:'QA annotation'},done:{aki:'2026-09-28'},cards:{},plans:[]};
r=await mf.dispatchFetch('https://test.local/api/study',{method:'PUT',headers,body:JSON.stringify(value)});assert.equal(r.status,200,await r.text());
r=await mf.dispatchFetch('https://test.local/api/study',{headers});assert.deepEqual(await r.json(),value);
r=await mf.dispatchFetch('https://test.local/api/study',{headers:{'oai-authenticated-user-id':'different-user'}});assert.equal(await r.json(),null);
const f=new FormData();f.append('file',new Blob(['Original note text'],{type:'text/plain'}),'test-notes.txt');
const uploadRequest=new Request('https://test.local/api/files',{method:'POST',body:f});r=await mf.dispatchFetch('https://test.local/api/files',{method:'POST',headers:{'oai-authenticated-user-id':'nurseready-qa','Content-Type':uploadRequest.headers.get('content-type')},body:await uploadRequest.arrayBuffer()});assert.equal(r.status,200,await r.clone().text());const file=await r.json();
r=await mf.dispatchFetch('https://test.local/api/files?id='+file.id,{headers});assert.equal(await r.text(),'Original note text');
r=await mf.dispatchFetch('https://test.local/api/files?id='+file.id,{headers:{'oai-authenticated-user-id':'different-user'}});assert.equal(r.status,404);
// Existing account data remains attached to the new recovery capability.
r=await mf.dispatchFetch('https://test.local/api/session',{method:'POST',headers,body:'{}'});assert.equal(r.status,200);const legacyCode=(await r.json()).code;
const sessionHeaders={'Content-Type':'application/json',cookie:'nr_space='+legacyCode};
r=await mf.dispatchFetch('https://test.local/api/study',{headers:sessionHeaders});assert.deepEqual(await r.json(),value);
// New visitor receives an isolated space; a fresh browser can restore it.
r=await mf.dispatchFetch('https://test.local/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(r.status,200);const guestCode=(await r.json()).code;assert.match(guestCode,/^[a-f0-9]{64}$/);
const guestHeaders={'Content-Type':'application/json',cookie:'nr_space='+guestCode};
r=await mf.dispatchFetch('https://test.local/api/study',{headers:guestHeaders});assert.equal(await r.json(),null);const firstTag=r.headers.get('ETag');
r=await mf.dispatchFetch('https://test.local/api/study',{method:'PUT',headers:{...guestHeaders,'If-Match':firstTag},body:JSON.stringify(value)});assert.equal(r.status,200);
r=await mf.dispatchFetch('https://test.local/api/study',{method:'PUT',headers:{...guestHeaders,'If-Match':firstTag},body:JSON.stringify({...value,bookmarks:[]})});assert.equal(r.status,409);
r=await mf.dispatchFetch('https://test.local/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:guestCode})});assert.equal(r.status,200);assert.ok(r.headers.get('set-cookie').includes(guestCode));
r=await mf.dispatchFetch('https://test.local/api/study',{headers:guestHeaders});assert.deepEqual(await r.json(),value);
r=await mf.dispatchFetch('https://test.local/api/files?id='+file.id,{headers:guestHeaders});assert.equal(r.status,404);
r=await mf.dispatchFetch('https://test.local/api/files?id='+file.id,{headers:sessionHeaders});assert.equal(await r.text(),'Original note text');
// Version travels in JSON; no ETag/If-Match header needs to survive a proxy.
r=await mf.dispatchFetch('https://test.local/api/study?format=2',{headers:guestHeaders});const bodyState=await r.json();assert.deepEqual(bodyState.data,value);assert.equal(typeof bodyState.version,'string');
const nextValue={...value,notes:[{id:'saved-note',text:'Patient assessment notes'}]};
r=await mf.dispatchFetch('https://test.local/api/study',{method:'PUT',headers:guestHeaders,body:JSON.stringify({version:bodyState.version,data:nextValue})});assert.equal(r.status,200,await r.clone().text());const savedBody=await r.json();assert.equal(typeof savedBody.version,'string');
r=await mf.dispatchFetch('https://test.local/api/study',{method:'PUT',headers:guestHeaders,body:JSON.stringify({version:savedBody.version,data:{...nextValue,goal:3}})});assert.equal(r.status,200,await r.clone().text());
r=await mf.dispatchFetch('https://test.local/api/study',{method:'PUT',headers:guestHeaders,body:JSON.stringify({version:bodyState.version,data:value})});assert.equal(r.status,409);
r=await mf.dispatchFetch('https://test.local/api/study?format=2',{headers:guestHeaders});const reloaded=await r.json();assert.equal(reloaded.data.goal,3);assert.equal(reloaded.data.notes[0].text,'Patient assessment notes');
r=await mf.dispatchFetch('https://test.local/api/files',{headers:sessionHeaders});assert.deepEqual((await r.json()).files,[{id:file.id,name:'test-notes.txt'}]);
r=await mf.dispatchFetch('https://test.local/api/files',{headers:guestHeaders});assert.deepEqual((await r.json()).files,[]);
r=await mf.dispatchFetch('https://test.local/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:'0'.repeat(64)})});assert.equal(r.status,400);
r=await mf.dispatchFetch('https://test.local/api/session',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://evil.example'},body:'{}'});assert.equal(r.status,403);
r=await mf.dispatchFetch('https://test.local/api/study',{method:'DELETE',headers});assert.equal(r.status,200);
r=await mf.dispatchFetch('https://test.local/api/files?id='+file.id,{headers});assert.equal(r.status,404);
r=await mf.dispatchFetch('https://test.local/api/study',{headers});assert.equal(await r.json(),null);
console.log('PASS: JSON version save/reload without conditional headers, sequential saves, isolated original recovery,  guest creation, recovery, cross-device persistence, legacy preservation, invalid-code rejection, cross-origin rejection, stale-save conflict,  unauthenticated rejection, state persistence, user isolation, original upload/download, and deletion.');
}finally{await mf.dispose();}
