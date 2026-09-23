import urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

directory = Path(__file__).parent / 'dist' / 'audio'
directory.mkdir(exist_ok=True)
def download(name):
    data = urllib.request.urlopen('https://raw.githubusercontent.com/cmguo/PinYinSound/master/' + name, timeout=30).read()
    assert len(data) > 500
    (directory / name).write_bytes(data)
    return name, len(data)
with ThreadPoolExecutor(max_workers=6) as pool:
    print(list(pool.map(download, [v + str(t) + '.mp3' for v in 'aoeiuv' for t in range(1, 5)])))
