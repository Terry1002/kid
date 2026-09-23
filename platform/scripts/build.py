"""Build the self-contained platform using only Python's standard library."""
from pathlib import Path
import hashlib
import json
import re
import shutil
import struct
import zlib

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'web'
OUTPUT = ROOT / 'site'

def icon(size):
    rows = []
    for y in range(size):
        row = bytearray()
        for x in range(size):
            a, b = x / size, y / size
            color = (36, 87, 214)
            if .23 < a < .77 and .29 < b < .72 and abs(a - .5) > .014:
                color = (255, 255, 255)
            if (.29 < a < .43 or .57 < a < .71) and (.40 < b < .425 or .51 < b < .535):
                color = (36, 87, 214)
            row.extend(color)
        rows.append(b'\x00' + row)
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(b''.join(rows))) + chunk(b'IEND', b'')

def build():
    # OUTPUT is a fixed generated directory under this project, never a user path.
    if OUTPUT.exists():
        if OUTPUT.is_symlink() or OUTPUT.resolve() != ROOT / 'site':
            raise RuntimeError('Unsafe build output path')
        shutil.rmtree(OUTPUT)
    shutil.copytree(SOURCE, OUTPUT)
    for module in ('pinyin', 'hanzi'):
        path = OUTPUT / module / 'index.html'
        html = path.read_text(encoding='utf-8-sig')
        html = re.sub(r'<link rel="manifest"[^>]*>', '', html)
        html = html.replace('<script defer src="pwa.js"></script>', '')
        html = html.replace('</head>', '<link rel="manifest" href="/manifest.webmanifest"><link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"><script defer src="/platform.js"></script></head>')
        if module == 'pinyin':
            html = html.replace('<div class="brand"><span class="logo">ā</span><h1>拼音小练习</h1></div>', '<a class="brand" href="/" style="color:inherit;text-decoration:none" aria-label="返回学习屋"><span class="logo">‹</span><h1>拼音小练习</h1></a>')
            html = re.sub(r'<div class="timer".*?(?=<div class="actions")', '', html)
        else:
            html = html.replace('<a class="brand" href="./">', '<a class="brand" href="/" aria-label="返回学习屋">').replace('<span class="seal">字</span>', '<span class="seal">‹</span>')
            html = html.replace('安装到桌面', '安装学习屋').replace('完整离线字库需另行下载', '完整离线字库需另行下载，安装后首页可选择两个练习')
        path.write_text(html, encoding='utf-8')
    for name in ('sw.js', 'pwa.js', 'manifest.webmanifest'):
        (OUTPUT / 'hanzi' / name).unlink()
    icons = OUTPUT / 'icons'
    icons.mkdir(exist_ok=True)
    for name, size in [('icon-192.png', 192), ('icon-512.png', 512), ('apple-touch-icon.png', 180)]:
        (icons / name).write_bytes(icon(size))
    digest = hashlib.sha256()
    files = sorted(p for p in OUTPUT.rglob('*') if p.is_file())
    for path in files:
        digest.update(path.relative_to(OUTPUT).as_posix().encode())
        digest.update(path.read_bytes())
    # Include worker source so changes to offline behavior also create a version.
    template = (SOURCE / 'hanzi' / 'sw.js').read_text(encoding='utf-8-sig')
    digest.update(template.encode())
    digest.update(Path(__file__).read_bytes())
    version = digest.hexdigest()[:16]
    (OUTPUT / 'version.json').write_text(json.dumps({'version': version}) + '\n', encoding='utf-8')
    assets = [p.relative_to(OUTPUT).as_posix() for p in files] + ['version.json']
    shell = [p for p in assets if not p.startswith(('hanzi/data/', 'hanzi/fonts/files/'))]
    shell += ['hanzi/data/190.json', 'hanzi/data/204.json', 'hanzi/data/205.json', 'hanzi/data/261.json']
    worker = template[template.index('const absolute ='):]
    worker = worker.replace("key.startsWith('yibiyizi-')", "key.startsWith('learning-house-')")
    worker = worker.replace("const isHome = request.mode === 'navigate' && (url.pathname === root || url.pathname === root+'index.html');", "const route = url.pathname.slice(root.length);\n  const home = request.mode === 'navigate' && ['', 'index.html', 'pinyin/', 'pinyin/index.html', 'hanzi/', 'hanzi/index.html'].includes(route);\n  const homePath = route.endsWith('/') || route === '' ? route + 'index.html' : route;\n  const isHome = home;")
    worker = worker.replace("const key = isHome ? absolute('index.html') : url.href;", "const key = isHome ? absolute(homePath) : url.href;")
    worker = worker.replace("if (response.ok && !response.redirected", "if (response.status === 200 && !response.redirected")
    # Safari sends Range requests for audio; return valid slices from cached MP3s.
    worker = worker.replace('if (cached) return cached;', '''if (cached) {
      if (url.pathname.endsWith('.mp3') && request.headers.has('range')) {
        const bytes = await cached.arrayBuffer();
        const range = /^bytes=(\\d*)-(\\d*)$/.exec(request.headers.get('range'));
        if (!range || (!range[1] && !range[2])) return new Response(null, {status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
        const start = range[1] ? Number(range[1]) : Math.max(0, bytes.byteLength - Number(range[2]));
        const end = range[1] && range[2] ? Math.min(Number(range[2]), bytes.byteLength - 1) : bytes.byteLength - 1;
        if (start > end || start >= bytes.byteLength) return new Response(null, {status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
        return new Response(bytes.slice(start,end+1), {status:206,headers:{'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${bytes.byteLength}`,'Content-Length':String(end-start+1)}});
      }
      return cached;
    }''')
    (OUTPUT / 'sw.js').write_text("'use strict';\nconst CACHE = 'learning-house-" + version + "';\nconst ASSETS = " + json.dumps(assets) + ';\nconst SHELL = ' + json.dumps(shell) + ';\n' + worker, encoding='utf-8')
    print(f'Built version {version}: {len(assets)} files, {sum(p.stat().st_size for p in files)/1024/1024:.1f} MB')

if __name__ == '__main__':
    build()
