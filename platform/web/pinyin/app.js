'use strict';
const vowels=['a','o','e','i','u','ü'];
const marked=['āáǎà','ōóǒò','ēéěè','īíǐì','ūúǔù','ǖǘǚǜ'];
const toneNames=['第一声 · 平平的','第二声 · 往上扬','第三声 · 拐个弯','第四声 · 往下降'];
const $=id=>document.getElementById(id);
let current=-1,question=0,deadline=0,recorder=null,stream=null,recordUrl=null,recordTimer=null,version=0,pending=false,playing=null;
function stopAudio(){if('speechSynthesis' in window)speechSynthesis.cancel();if(playing){playing.onended=null;playing.pause();playing=null;}}
function stopRecording(){clearTimeout(recordTimer);if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());stream=null;$('record').classList.remove('recording');$('record').textContent='● 录音';}
function next(){version++;stopAudio();stopRecording();if(recordUrl)URL.revokeObjectURL(recordUrl);recordUrl=null;$('replay').disabled=true;pending=false;$('record').disabled=false;const value=Math.floor(Math.random()*(current<0?24:23));current=current<0?value:(value>=current?value+1:value);question++;deadline=Date.now()+10000;$('letter').textContent=marked[Math.floor(current/4)][current%4];$('tone').textContent=toneNames[current%4];$('count').textContent=`第 ${question} 题`;$('status').textContent='录音只保留在本页，换题后清除。';tick();return {vowel:vowels[Math.floor(current/4)],tone:current%4+1,question};}
function tick(){const waiting=Date.now()<deadline;$('listen').hidden=waiting;$('waiting').hidden=!waiting;}
function say(){
  if(Date.now()<deadline)return;
  stopAudio();stopRecording();
  const token=version;
  const audio=new Audio(`audio/${'aoeiuv'[Math.floor(current/4)]}${current%4+1}.mp3`);
  playing=audio;
  let repetition=1;
  const active=()=>token===version&&playing===audio;
  function play(){audio.play().then(()=>{if(active())$('status').textContent=`正在播放示范 · 第 ${repetition} 遍，共 3 遍`;}).catch(()=>{if(active())$('status').textContent='播放失败，请检查网络和设备音量，再点一次。';});}
  audio.onended=()=>{if(!active())return;if(repetition<3){repetition++;audio.currentTime=0;play();}else{audio.onended=null;playing=null;$('status').textContent='三遍听完啦，再自己读一遍吧。';}};
  play();
}
async function record(){if(recorder?.state==='recording'){stopRecording();return;}if(pending)return;if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){$('status').textContent='录音需要支持录音的浏览器和 HTTPS 连接，请用 Safari 打开网页。';return;}const token=version;pending=true;$('record').disabled=true;stopAudio();$('status').textContent='请允许麦克风，然后读出上面的拼音。';let acquired;try{acquired=await navigator.mediaDevices.getUserMedia({audio:true});if(token!==version){acquired.getTracks().forEach(t=>t.stop());return;}stream=acquired;const local=new MediaRecorder(stream);recorder=local;const chunks=[];local.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};local.onstop=()=>{acquired.getTracks().forEach(t=>t.stop());if(token!==version)return;if(recordUrl)URL.revokeObjectURL(recordUrl);recordUrl=URL.createObjectURL(new Blob(chunks,{type:local.mimeType}));$('replay').disabled=!chunks.length;$('status').textContent=chunks.length?'录好了！点击“回听”，再和示范比较。':'没有录到声音，请重试。';};local.onerror=()=>{stopRecording();$('status').textContent='录音中断，请重试。';};local.start();$('replay').disabled=true;$('record').textContent='■ 结束录音';$('record').classList.add('recording');$('status').textContent='正在录音…读完点击结束，最长 5 秒。';recordTimer=setTimeout(stopRecording,5000);}catch(e){acquired?.getTracks().forEach(t=>t.stop());if(token===version)$('status').textContent=e.name==='NotAllowedError'?'未获得麦克风权限，请在 Safari 网站设置中允许麦克风。':'麦克风暂时不可用，请关闭其他录音应用后重试。';}finally{if(token===version){pending=false;$('record').disabled=false;}}}
$('next').onclick=next;$('listen').onclick=say;$('record').onclick=record;$('replay').onclick=()=>{stopAudio();if(recordUrl){playing=new Audio(recordUrl);playing.play().catch(()=>{$('status').textContent='回听失败，请重新录音。';});}};
document.addEventListener('visibilitychange',()=>{if(document.hidden){version++;stopRecording();stopAudio();pending=false;$('record').disabled=false;}else tick();});window.addEventListener('pagehide',()=>{version++;stopRecording();stopAudio();if(recordUrl)URL.revokeObjectURL(recordUrl);});
next();setInterval(tick,200);
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'next_pinyin',description:'显示下一个随机单韵母四声练习并重新开始十秒计时。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||Object.keys(input).length)throw new Error('不需要参数');return next();}})).catch(()=>{});}catch{}}
