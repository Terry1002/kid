const fs=require('fs'),vm=require('vm'),assert=require('assert');
let time=100000; const els={};let tool;const context={console,Date:{now:()=>time},Math,Promise,Error,Object,setTimeout,clearTimeout,setInterval:()=>{},URL,Blob,navigator:{},Audio:function(src){this.src=src;this.play=()=>Promise.resolve();this.pause=()=>{};},document:{getElementById:id=>els[id]??=( {style:{},classList:{remove(){},add(){}},textContent:'',hidden:false,disabled:false}),addEventListener(){},modelContext:{registerTool(t){tool=t;}}},window:{addEventListener(){}}};
vm.createContext(context);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),context);
assert(els.listen.hidden);time+=9999;vm.runInContext('tick()',context);assert(els.listen.hidden);time++;vm.runInContext('tick()',context);assert(!els.listen.hidden);
const seen=new Set();let last=els.letter.textContent;for(let i=0;i<1500;i++){const result=tool.execute({});assert(result.tone>=1&&result.tone<=4);const now=els.letter.textContent;assert.notEqual(now,last);seen.add(now);last=now;assert(els.listen.hidden);}assert.equal(seen.size,24);assert.throws(()=>tool.execute({bad:true}));
for(const vowel of 'aoeiuv')for(let t=1;t<=4;t++)assert(fs.statSync(`dist/audio/${vowel}${t}.mp3`).size>500);
console.log('PASS: 10-second boundary, next/reset, 24 combinations, no immediate repeat, WebMCP valid/invalid calls, 24 audio assets.');
