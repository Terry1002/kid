const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../site'),origin='https://learning.test/';
const handlers={},stores=new Map();
const key=x=>typeof x==='string'?x:x.url;
const caches={async open(name){if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);return {async put(k,r){data.set(key(k),r.clone());},async match(k){return data.get(key(k))?.clone();},async keys(){return [...data.keys()].map(x=>new Request(x));}};},async keys(){return [...stores.keys()];},async delete(k){return stores.delete(k);}};
const self={registration:{scope:origin},location:{origin:new URL(origin).origin},clients:{async claim(){},async matchAll(){return[];}},addEventListener:(name,handler)=>handlers[name]=handler,skipWaiting(){}};
const scope={self,caches,URL,Request,Response,Set,Promise,Number,Math,Error,fetch:async request=>{const url=new URL(key(request)),file=path.join(root,url.pathname);try{return new Response(fs.readFileSync(file));}catch{return new Response('missing',{status:404});}}};
vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),scope);
async function run(name){let promise;handlers[name]({waitUntil:p=>promise=p});await promise;}
async function get(route,headers={},mode){let promise;handlers.fetch({request:{method:'GET',url:new URL(route,origin).href,mode,headers:new Headers(headers)},respondWith:p=>promise=p});return promise;}
(async()=>{
 await run('install');
 for(const route of ['','pinyin/','hanzi/']){const response=await get(route,{},'navigate');assert.equal(response.status,200);assert.match(await response.text(),/<!doctype html>/i);}
 const whole=await get('pinyin/audio/a1.mp3');const bytes=await whole.arrayBuffer();const part=await get('pinyin/audio/a1.mp3',{range:'bytes=0-99'});assert.equal(part.status,206);assert.equal((await part.arrayBuffer()).byteLength,100);assert.equal(part.headers.get('content-range'),`bytes 0-99/${bytes.byteLength}`);
 assert.equal((await get('pinyin/audio/a1.mp3',{range:'bytes=999999-'})).status,416);
 stores.set('unrelated-cache',new Map());stores.set('learning-house-old',new Map());await run('activate');assert(stores.has('unrelated-cache'));assert(!stores.has('learning-house-old'));
 console.log('PASS: offline routes, cached audio byte ranges, invalid ranges, scoped cache cleanup.');
})().catch(e=>{console.error(e);process.exitCode=1;});
