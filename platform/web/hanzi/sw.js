'use strict';
const CACHE = 'yibiyizi-3db602bc265c54e5';
const ASSETS = ["app.js", "data/104.json", "data/105.json", "data/106.json", "data/110.json", "data/112.json", "data/113.json", "data/114.json", "data/115.json", "data/118.json", "data/121.json", "data/126.json", "data/127.json", "data/134.json", "data/138.json", "data/140.json", "data/142.json", "data/144.json", "data/147.json", "data/152.json", "data/154.json", "data/156.json", "data/157.json", "data/158.json", "data/159.json", "data/160.json", "data/161.json", "data/162.json", "data/163.json", "data/164.json", "data/165.json", "data/166.json", "data/167.json", "data/168.json", "data/169.json", "data/170.json", "data/171.json", "data/172.json", "data/173.json", "data/174.json", "data/175.json", "data/176.json", "data/177.json", "data/178.json", "data/179.json", "data/180.json", "data/181.json", "data/182.json", "data/183.json", "data/184.json", "data/185.json", "data/186.json", "data/187.json", "data/188.json", "data/189.json", "data/190.json", "data/191.json", "data/192.json", "data/193.json", "data/194.json", "data/195.json", "data/196.json", "data/197.json", "data/198.json", "data/199.json", "data/200.json", "data/201.json", "data/202.json", "data/203.json", "data/204.json", "data/205.json", "data/206.json", "data/207.json", "data/208.json", "data/209.json", "data/210.json", "data/211.json", "data/212.json", "data/213.json", "data/214.json", "data/215.json", "data/216.json", "data/217.json", "data/218.json", "data/219.json", "data/220.json", "data/221.json", "data/222.json", "data/223.json", "data/224.json", "data/225.json", "data/226.json", "data/227.json", "data/228.json", "data/229.json", "data/230.json", "data/231.json", "data/232.json", "data/233.json", "data/234.json", "data/235.json", "data/236.json", "data/237.json", "data/238.json", "data/239.json", "data/240.json", "data/241.json", "data/242.json", "data/243.json", "data/244.json", "data/245.json", "data/246.json", "data/247.json", "data/248.json", "data/249.json", "data/250.json", "data/251.json", "data/252.json", "data/253.json", "data/254.json", "data/255.json", "data/256.json", "data/257.json", "data/258.json", "data/259.json", "data/260.json", "data/261.json", "data/262.json", "data/263.json", "data/264.json", "data/265.json", "data/266.json", "data/267.json", "data/268.json", "data/269.json", "data/270.json", "data/271.json", "data/272.json", "data/273.json", "data/274.json", "data/275.json", "data/276.json", "data/277.json", "data/278.json", "data/279.json", "data/280.json", "data/281.json", "data/282.json", "data/283.json", "data/284.json", "data/285.json", "data/286.json", "data/287.json", "data/288.json", "data/289.json", "data/290.json", "data/291.json", "data/292.json", "data/293.json", "data/294.json", "data/295.json", "data/296.json", "data/297.json", "data/298.json", "data/299.json", "data/300.json", "data/301.json", "data/302.json", "data/303.json", "data/304.json", "data/305.json", "data/306.json", "data/307.json", "data/308.json", "data/309.json", "data/310.json", "data/311.json", "data/312.json", "data/313.json", "data/314.json", "data/315.json", "data/316.json", "data/317.json", "data/318.json", "data/319.json", "data/93.json", "data/LICENSE.txt", "fonts/OFL.txt", "fonts/files/lxgwwenkai-regular-subset-100.woff2", "fonts/files/lxgwwenkai-regular-subset-101.woff2", "fonts/files/lxgwwenkai-regular-subset-102.woff2", "fonts/files/lxgwwenkai-regular-subset-103.woff2", "fonts/files/lxgwwenkai-regular-subset-104.woff2", "fonts/files/lxgwwenkai-regular-subset-105.woff2", "fonts/files/lxgwwenkai-regular-subset-106.woff2", "fonts/files/lxgwwenkai-regular-subset-107.woff2", "fonts/files/lxgwwenkai-regular-subset-108.woff2", "fonts/files/lxgwwenkai-regular-subset-109.woff2", "fonts/files/lxgwwenkai-regular-subset-110.woff2", "fonts/files/lxgwwenkai-regular-subset-111.woff2", "fonts/files/lxgwwenkai-regular-subset-112.woff2", "fonts/files/lxgwwenkai-regular-subset-113.woff2", "fonts/files/lxgwwenkai-regular-subset-114.woff2", "fonts/files/lxgwwenkai-regular-subset-115.woff2", "fonts/files/lxgwwenkai-regular-subset-116.woff2", "fonts/files/lxgwwenkai-regular-subset-117.woff2", "fonts/files/lxgwwenkai-regular-subset-118.woff2", "fonts/files/lxgwwenkai-regular-subset-119.woff2", "fonts/files/lxgwwenkai-regular-subset-21.woff2", "fonts/files/lxgwwenkai-regular-subset-22.woff2", "fonts/files/lxgwwenkai-regular-subset-23.woff2", "fonts/files/lxgwwenkai-regular-subset-24.woff2", "fonts/files/lxgwwenkai-regular-subset-25.woff2", "fonts/files/lxgwwenkai-regular-subset-26.woff2", "fonts/files/lxgwwenkai-regular-subset-27.woff2", "fonts/files/lxgwwenkai-regular-subset-28.woff2", "fonts/files/lxgwwenkai-regular-subset-29.woff2", "fonts/files/lxgwwenkai-regular-subset-30.woff2", "fonts/files/lxgwwenkai-regular-subset-31.woff2", "fonts/files/lxgwwenkai-regular-subset-32.woff2", "fonts/files/lxgwwenkai-regular-subset-33.woff2", "fonts/files/lxgwwenkai-regular-subset-34.woff2", "fonts/files/lxgwwenkai-regular-subset-35.woff2", "fonts/files/lxgwwenkai-regular-subset-36.woff2", "fonts/files/lxgwwenkai-regular-subset-37.woff2", "fonts/files/lxgwwenkai-regular-subset-38.woff2", "fonts/files/lxgwwenkai-regular-subset-39.woff2", "fonts/files/lxgwwenkai-regular-subset-4.woff2", "fonts/files/lxgwwenkai-regular-subset-40.woff2", "fonts/files/lxgwwenkai-regular-subset-41.woff2", "fonts/files/lxgwwenkai-regular-subset-42.woff2", "fonts/files/lxgwwenkai-regular-subset-43.woff2", "fonts/files/lxgwwenkai-regular-subset-44.woff2", "fonts/files/lxgwwenkai-regular-subset-45.woff2", "fonts/files/lxgwwenkai-regular-subset-46.woff2", "fonts/files/lxgwwenkai-regular-subset-47.woff2", "fonts/files/lxgwwenkai-regular-subset-48.woff2", "fonts/files/lxgwwenkai-regular-subset-49.woff2", "fonts/files/lxgwwenkai-regular-subset-5.woff2", "fonts/files/lxgwwenkai-regular-subset-50.woff2", "fonts/files/lxgwwenkai-regular-subset-51.woff2", "fonts/files/lxgwwenkai-regular-subset-52.woff2", "fonts/files/lxgwwenkai-regular-subset-53.woff2", "fonts/files/lxgwwenkai-regular-subset-54.woff2", "fonts/files/lxgwwenkai-regular-subset-55.woff2", "fonts/files/lxgwwenkai-regular-subset-56.woff2", "fonts/files/lxgwwenkai-regular-subset-57.woff2", "fonts/files/lxgwwenkai-regular-subset-58.woff2", "fonts/files/lxgwwenkai-regular-subset-59.woff2", "fonts/files/lxgwwenkai-regular-subset-6.woff2", "fonts/files/lxgwwenkai-regular-subset-60.woff2", "fonts/files/lxgwwenkai-regular-subset-61.woff2", "fonts/files/lxgwwenkai-regular-subset-62.woff2", "fonts/files/lxgwwenkai-regular-subset-63.woff2", "fonts/files/lxgwwenkai-regular-subset-64.woff2", "fonts/files/lxgwwenkai-regular-subset-65.woff2", "fonts/files/lxgwwenkai-regular-subset-66.woff2", "fonts/files/lxgwwenkai-regular-subset-67.woff2", "fonts/files/lxgwwenkai-regular-subset-68.woff2", "fonts/files/lxgwwenkai-regular-subset-69.woff2", "fonts/files/lxgwwenkai-regular-subset-70.woff2", "fonts/files/lxgwwenkai-regular-subset-71.woff2", "fonts/files/lxgwwenkai-regular-subset-72.woff2", "fonts/files/lxgwwenkai-regular-subset-73.woff2", "fonts/files/lxgwwenkai-regular-subset-74.woff2", "fonts/files/lxgwwenkai-regular-subset-75.woff2", "fonts/files/lxgwwenkai-regular-subset-76.woff2", "fonts/files/lxgwwenkai-regular-subset-77.woff2", "fonts/files/lxgwwenkai-regular-subset-78.woff2", "fonts/files/lxgwwenkai-regular-subset-79.woff2", "fonts/files/lxgwwenkai-regular-subset-80.woff2", "fonts/files/lxgwwenkai-regular-subset-81.woff2", "fonts/files/lxgwwenkai-regular-subset-82.woff2", "fonts/files/lxgwwenkai-regular-subset-83.woff2", "fonts/files/lxgwwenkai-regular-subset-84.woff2", "fonts/files/lxgwwenkai-regular-subset-85.woff2", "fonts/files/lxgwwenkai-regular-subset-86.woff2", "fonts/files/lxgwwenkai-regular-subset-87.woff2", "fonts/files/lxgwwenkai-regular-subset-88.woff2", "fonts/files/lxgwwenkai-regular-subset-89.woff2", "fonts/files/lxgwwenkai-regular-subset-90.woff2", "fonts/files/lxgwwenkai-regular-subset-91.woff2", "fonts/files/lxgwwenkai-regular-subset-97.woff2", "fonts/files/lxgwwenkai-regular-subset-98.woff2", "fonts/files/lxgwwenkai-regular-subset-99.woff2", "fonts/lxgwwenkai-regular.css", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "index.html", "manifest.webmanifest", "paging.js", "pwa.js", "style.css", "tablet.css", "touch.js", "vendor/hanzi-writer-LICENSE.txt", "vendor/hanzi-writer.min.js", "vendor/pinyin-pro-LICENSE.txt", "vendor/pinyin-pro.js", "voice.js"];
const SHELL = ["index.html", "style.css", "tablet.css", "app.js", "touch.js", "paging.js", "voice.js", "pwa.js", "manifest.webmanifest", "vendor/pinyin-pro.js", "vendor/hanzi-writer.min.js", "fonts/lxgwwenkai-regular.css", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "data/190.json", "data/204.json", "data/205.json", "data/261.json"];
const absolute = path => new URL(path, self.registration.scope).href;
const allowed = new Set(ASSETS.map(absolute));
async function store(cache, path) {
  const url = absolute(path);
  const response = await fetch(new Request(url, {cache:'reload'}));
  if (!response.ok || response.redirected || response.type === 'opaque') throw Error('资源下载失败');
  await cache.put(url, response);
}
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  await Promise.all(SHELL.map(path => store(cache, path)));
})()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  await Promise.all((await caches.keys()).filter(key => key.startsWith('yibiyizi-') && key !== CACHE).map(key => caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const root = new URL(self.registration.scope).pathname;
  const isHome = request.mode === 'navigate' && (url.pathname === root || url.pathname === root+'index.html');
  if (!isHome && !allowed.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = isHome ? absolute('index.html') : url.href;
    const cached = await cache.match(key);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && !response.redirected && response.type !== 'opaque') await cache.put(key, response.clone());
      return response;
    } catch {
      return new Response('此内容尚未下载，请联网后重试。', {status:503, headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
let download = null;
const notify = async payload => { for (const client of await self.clients.matchAll()) client.postMessage(payload); };
async function status() {
  const cache = await caches.open(CACHE);
  const stored = new Set((await cache.keys()).map(r => r.url));
  return {type:'OFFLINE_STATUS', ready:ASSETS.every(path => stored.has(absolute(path)))};
}
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') { self.skipWaiting(); return; }
  if (event.data?.type === 'STATUS') { event.waitUntil(status().then(data => event.source?.postMessage(data))); return; }
  if (event.data?.type !== 'DOWNLOAD_ALL') return;
  if (!download) {
    download = (async () => {
      const cache = await caches.open(CACHE);
      let done = 0, cursor = 0;
      const batch = async () => {
        while (cursor < ASSETS.length) {
          const path = ASSETS[cursor++];
          if (!(await cache.match(absolute(path)))) await store(cache, path);
          done++;
          await notify({type:'DOWNLOAD_PROGRESS',done,total:ASSETS.length});
        }
      };
      // Drain all workers before allowing retry, including after one fails.
      const results = await Promise.allSettled(Array.from({length:4}, batch));
      if (results.some(r => r.status === 'rejected')) throw Error('download');
      await notify(await status());
    })().catch(() => notify({type:'DOWNLOAD_ERROR'})).finally(() => { download = null; });
  }
  event.waitUntil(download);
});
