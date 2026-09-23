"""Validate built routes, resource references, manifest, and audio coverage."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import re

ROOT = Path(__file__).resolve().parents[1] / 'site'
class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('src', 'href') and value:
                self.refs.append(value)

for route in ('index.html', 'pinyin/index.html', 'hanzi/index.html'):
    page = ROOT / route
    text = page.read_text(encoding='utf-8-sig')
    parser = References()
    parser.feed(text)
    for ref in parser.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc or not url.path:
            continue
        path = ROOT / unquote(url.path).lstrip('/') if url.path.startswith('/') else page.parent / unquote(url.path)
        if url.path.endswith('/'):
            path /= 'index.html'
        assert path.is_file(), (route, ref)
    assert '/manifest.webmanifest' in text
    assert '/platform.js' in text
assert 'id="timer"' not in (ROOT / 'pinyin/index.html').read_text(encoding='utf-8')
manifest = json.loads((ROOT / 'manifest.webmanifest').read_text(encoding='utf-8'))
assert manifest['scope'] == '/' and manifest['start_url'] == '/'
for item in manifest['icons']:
    assert (ROOT / item['src'].lstrip('/')).read_bytes().startswith(b'\x89PNG')
for vowel in 'aoeiuv':
    for tone in range(1,5):
        assert (ROOT / f'pinyin/audio/{vowel}{tone}.mp3').stat().st_size > 500
worker = (ROOT / 'sw.js').read_text(encoding='utf-8')
for variable in ('ASSETS', 'SHELL'):
    files = json.loads(re.search(r'const ' + variable + r' = (\[.*?\]);', worker).group(1))
    assert len(files) == len(set(files)), variable
    for item in files:
        assert (ROOT / item).is_file(), item
assert not (ROOT / 'hanzi/sw.js').exists()
assert not (ROOT / 'hanzi/manifest.webmanifest').exists()
print('PASS: routes, asset references, unified PWA, icons, 24 audio files, offline manifest.')
