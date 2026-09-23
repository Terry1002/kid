/* One service worker and installation identity for every activity. */
(() => {
  const open=document.getElementById('parent-open'),close=document.getElementById('parent-close'),dialog=document.getElementById('parent-dialog');
  if(open)open.onclick=()=>dialog.showModal();if(close)close.onclick=()=>dialog.close();
  const status=document.getElementById('offline-status')||document.getElementById('pwa-status'),download=document.getElementById('offline-download')||document.getElementById('download-offline');
  const install=document.getElementById('install-app'),help=document.getElementById('install-help');
  if(install&&help)install.onclick=()=>{help.hidden=!help.hidden;install.setAttribute('aria-expanded',String(!help.hidden));};
  if(!('serviceWorker'in navigator)||!window.isSecureContext){if(status)status.textContent='离线和安装功能需要 HTTPS 地址。基础练习仍可使用。';return;}
  let registration,downloading=false,watchdog;
  const finish=()=>{downloading=false;clearTimeout(watchdog);if(download)download.disabled=false;};
  navigator.serviceWorker.addEventListener('message',event=>{
    const data=event.data;if(!status)return;
    if(data?.type==='DOWNLOAD_PROGRESS'){downloading=true;download.disabled=true;status.textContent=`正在下载 ${data.done} / ${data.total}，请保持页面打开…`;clearTimeout(watchdog);watchdog=setTimeout(()=>{finish();status.textContent='下载超时，可以重试；已有资源会保留。';},90000);}
    if(data?.type==='OFFLINE_STATUS'){if(data.ready){finish();download.disabled=true;download.textContent='完整资源已就绪';status.textContent='两个练习及完整字库已可离线使用。';}else if(!downloading)status.textContent='基础页面和拼音音频已可离线使用。可继续下载完整字库。';}
    if(data?.type==='DOWNLOAD_ERROR'){finish();status.textContent='下载失败，请检查网络和剩余空间后重试。';}
  });
  if(download)download.onclick=()=>{const worker=navigator.serviceWorker.controller||registration?.active;if(!worker)return;downloading=true;download.disabled=true;status.textContent='正在准备下载…';worker.postMessage({type:'DOWNLOAD_ALL'});clearTimeout(watchdog);watchdog=setTimeout(()=>{finish();status.textContent='下载超时，请重试。';},90000);};
  function showUpdate(){
    if(!registration?.waiting||!navigator.serviceWorker.controller||document.getElementById('platform-update'))return;
    const bar=document.createElement('div');bar.id='platform-update';bar.setAttribute('role','status');bar.style.cssText='position:fixed;bottom:max(16px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:12px;background:#20375f;color:white;padding:12px 18px;border-radius:16px;box-shadow:0 4px 24px #0003;font:16px sans-serif;max-width:95vw;';
    const label=document.createElement('span');label.textContent='新版本准备好了';const button=document.createElement('button');button.textContent='更新';button.style.cssText='font:inherit;padding:10px 18px;border:0;border-radius:10px;min-height:44px;cursor:pointer;';
    button.onclick=()=>{button.disabled=true;navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});registration.waiting?.postMessage({type:'SKIP_WAITING'});};bar.append(label,button);document.body.append(bar);
  }
  navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).then(async reg=>{registration=reg;showUpdate();reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',showUpdate));await navigator.serviceWorker.ready;if(download)download.disabled=false;(navigator.serviceWorker.controller||reg.active)?.postMessage({type:'STATUS'});document.addEventListener('visibilitychange',()=>{if(!document.hidden)reg.update().catch(()=>{});});}).catch(()=>{if(status)status.textContent='离线功能准备失败，请联网刷新后重试。';});
  fetch('/version.json',{cache:'no-store'}).then(r=>r.json()).then(v=>{const el=document.getElementById('version');if(el)el.textContent=`当前资源版本：${v.version}`;}).catch(()=>{});
})();
