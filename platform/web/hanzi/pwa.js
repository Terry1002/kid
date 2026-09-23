'use strict';
(() => {
  const install = document.getElementById('install-app');
  const offline = document.getElementById('download-offline');
  const update = document.getElementById('update-app');
  const status = document.getElementById('pwa-status');
  const help = document.getElementById('install-help');
  let prompt = null, registration = null, downloading = false;
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone()) install.hidden = true;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); prompt = event; install.hidden = false;
  });
  window.addEventListener('appinstalled', () => { prompt = null; install.hidden = true; help.hidden = true; });
  install.onclick = async () => {
    if (!prompt) { help.hidden = !help.hidden; install.setAttribute('aria-expanded', String(!help.hidden)); return; }
    const current = prompt; prompt = null;
    try { await current.prompt(); await current.userChoice; }
    catch { help.hidden = false; }
  };
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status.textContent = '离线安装需要 HTTPS 网站或本机地址。';
    offline.disabled = true;
    return;
  }
  let watchdog;
  const finish = () => { downloading = false; clearTimeout(watchdog); offline.disabled = false; offline.textContent = '下载完整离线字库'; };
  const guard = () => { clearTimeout(watchdog); watchdog = setTimeout(() => { finish(); status.textContent = '下载中断或等待超时，可点击重试；已下载内容会保留。'; }, 90000); };
  navigator.serviceWorker.addEventListener('message', event => {
    const data = event.data;
    if (data?.type === 'DOWNLOAD_PROGRESS') {
      downloading = true; offline.disabled = true; guard();
      status.textContent = `正在下载离线资源 ${data.done} / ${data.total}，请保留此页面…`;
    } else if (data?.type === 'OFFLINE_STATUS') {
      if (data.ready) { finish(); offline.textContent = '完整字库已就绪'; offline.disabled = true; status.textContent = '9574 个汉字及字体已缓存，可离线查看拼音与笔顺。语音可能仍需联网。'; }
      else if (!downloading) status.textContent = '基础页面已可离线使用；下载完整字库后，未查过的字也可离线学习。';
    } else if (data?.type === 'DOWNLOAD_ERROR') { finish(); status.textContent = '未能完成下载，请检查网络或设备空间后重试。已下载内容会保留。'; }
  });
  offline.onclick = () => {
    const worker = navigator.serviceWorker.controller || registration?.active;
    if (!worker) { status.textContent = '离线功能正在准备，请稍后再试。'; return; }
    downloading = true; offline.disabled = true; guard();
    status.textContent = '正在下载字库和字体，请保留此页面…';
    worker.postMessage({type:'DOWNLOAD_ALL'});
  };
  update.onclick = () => {
    if (!registration?.waiting) return;
    update.disabled = true;
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {once:true});
    registration.waiting.postMessage({type:'SKIP_WAITING'});
  };
  const checkUpdate = () => { if (registration?.waiting && navigator.serviceWorker.controller) { update.hidden = false; document.getElementById('open-settings').textContent='设置 · 有更新'; } };
  navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'}).then(async reg => {
    registration = reg; checkUpdate();
    reg.addEventListener('updatefound', () => reg.installing?.addEventListener('statechange', checkUpdate));
    await navigator.serviceWorker.ready;
    offline.disabled = false;
    (navigator.serviceWorker.controller || reg.active)?.postMessage({type:'STATUS'});
  }).catch(() => { offline.disabled = true; status.textContent = '离线功能准备失败，请联网刷新页面后重试。'; });
})();
