const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{
 constructor(){this.children=[];this.style={};this.classList={add(){},remove(){},toggle(){}};this.value='';this.textContent='';this.hidden=false;this.checked=false;}
 append(...items){this.children.push(...items);}setAttribute(){}showModal(){this.open=true;}close(){this.open=false;}
 querySelectorAll(selector){return this.children.flatMap(x=>[...(x.type==='checkbox'&&(!selector.includes(':checked')||x.checked)?[x]:[]),...x.querySelectorAll(selector)]);}
}
const elements={},audios=[],utterances=[],saved={};let now=1000;
class Audio{constructor(url){this.url=url;this.plays=0;audios.push(this);}play(){this.plays++;return Promise.resolve();}pause(){this.paused=true;}}
const synth={getVoices:()=>[{lang:'zh-CN'}],cancel(){},speak(u){utterances.push(u);}};
const context={document:{getElementById:id=>elements[id]??=(new Element()),createElement:()=>new Element(),addEventListener(){}},window:{speechSynthesis:synth,addEventListener(){}},speechSynthesis:synth,SpeechSynthesisUtterance:function(text){this.text=text;},localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v},navigator:{},Audio,Date:{now:()=>now},setTimeout,clearTimeout,setInterval(){},URL,Blob,console};
vm.createContext(context);const run=code=>vm.runInContext(code,context);
for(const file of ['items.js','app.js'])run(fs.readFileSync(path.join(__dirname,'../web/pinyin',file),'utf8'));
assert.equal(run('practiceItems.length'),38);assert.equal(run('makePool(practiceItems.map(i=>i.id)).length'),56);
assert.equal(elements.choices.querySelectorAll('input').length,38);
assert(elements.listen.hidden);now+=9999;run('tick()');assert(elements.listen.hidden);now++;run('tick()');assert(!elements.listen.hidden);
function apply(ids,delay){elements['settings-open'].onclick();elements.choices.querySelectorAll('input').forEach(input=>input.checked=ids.includes(input.value));elements.delay.value=String(delay);elements['settings-form'].onsubmit({preventDefault(){}});}
apply(['ba1'],0);assert.equal(elements.letter.textContent,'bā');assert(!elements.listen.hidden);run('next()');assert.equal(elements.letter.textContent,'bā');
run('say()');let audio=audios.at(-1);audio.onended();audio.onended();audio.onended();assert.equal(audio.plays,3);assert.equal(audio.onended,null);
run('say()');audio=audios.at(-1);const callback=audio.onended;run('next()');callback();assert.equal(audio.plays,1);assert(audio.paused);
apply(['word-0'],2);assert.equal(elements.word.textContent,'爸爸');assert(elements.listen.hidden);now+=2000;run('tick();say()');for(let i=0;i<3;i++)utterances[i].onend();assert.equal(utterances.length,3);assert.equal(utterances[0].text,'爸爸');
apply([],10);assert.equal(run('preferences.selected[0]'),'word-0');assert(elements['settings-error'].textContent);
apply(['pa2'],-1);assert.equal(run('preferences.delay'),2);
apply(['ba1','pa2'],5);for(let i=0;i<30;i++){const previous=elements.letter.textContent;run('next()');assert.notEqual(elements.letter.textContent,previous);assert(['bā','pá'].includes(elements.letter.textContent));}assert.equal(JSON.parse(saved['pinyin-practice-v2']).delay,5);
for(const item of run('makePool(practiceItems.map(i=>i.id))'))if(item.audio)assert(fs.statSync(path.join(__dirname,'../web/pinyin/audio',item.audio+'.mp3')).size>500);
console.log('PASS: 38 selectable items / 56 questions, selection validation, delays, singleton, no repeats, audio/TTS three plays, cancellation, saved settings, all audio assets.');
