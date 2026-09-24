"""Fetch the 20 worksheet syllable recordings from the existing audio source."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1] / 'web/pinyin/audio'
NAMES = 'ba1 pa2 bo1 po2 pi3 bu4 pu1 ma3 fa4 fo2 pi2 po1 mo1 ma1 mi3 fu2 ba4 mu4 bi3 pa4'.split()
def fetch(name):
    path = ROOT / (name + '.mp3')
    if path.exists() and path.stat().st_size > 500:
        return name
    with urlopen('https://raw.githubusercontent.com/cmguo/PinYinSound/master/' + name + '.mp3', timeout=30) as response:
        data = response.read()
    if len(data) < 500 or not (data.startswith(b'ID3') or data[0] == 255):
        raise ValueError('Invalid MP3: ' + name)
    path.write_bytes(data)
    return name
if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=5) as pool:
        print('Ready:', ', '.join(pool.map(fetch, NAMES)))
