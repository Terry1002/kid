"""Build and serve the learning platform on a Linux LAN; no dependencies."""
import argparse
from http.server import SimpleHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]

class Server(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    # Windows SO_REUSEADDR can allow a second listener on an occupied port.
    allow_reuse_address = os.name != 'nt'

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      '.js': 'application/javascript',
                      '.webmanifest': 'application/manifest+json',
                      '.woff2': 'font/woff2', '.mp3': 'audio/mpeg'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def list_directory(self, path):
        self.send_error(404, 'Not found')
        return None

def main():
    parser = argparse.ArgumentParser(description='启动小小学习屋（默认允许局域网访问，Ctrl+C 停止）')
    parser.add_argument('--port', type=int, default=os.environ.get('PORT', '8088'), help='监听端口，默认 8088')
    parser.add_argument('--bind', default='0.0.0.0', help='监听地址，默认 0.0.0.0；仅本机可用 127.0.0.1')
    parser.add_argument('--no-build', action='store_true', help='复用已有构建；更新源码后不要使用此选项')
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error('端口必须为 1–65535')
    # Reserve the port before rebuilding, so a duplicate launch cannot disturb
    # an existing server's files before reporting the port conflict.
    try:
        server = Server((args.bind, args.port), Handler)
    except OSError as error:
        print(f'无法监听 {args.bind}:{args.port}：{error}\n请检查端口占用或使用 --port 8090。', file=sys.stderr)
        return 1
    with server:
        if not args.no_build:
            try:
                subprocess.run([sys.executable, str(ROOT / 'scripts/build.py')], check=True)
                subprocess.run([sys.executable, str(ROOT / 'scripts/check.py')], check=True)
            except subprocess.CalledProcessError:
                print('构建或检查失败，服务未启动。', file=sys.stderr)
                return 1
        if not (ROOT / 'site/index.html').is_file():
            print('找不到构建文件，请不带 --no-build 重新启动。', file=sys.stderr)
            return 1
        # Python 3.6 has no SimpleHTTPRequestHandler(directory=...). Only this
        # dedicated server process changes cwd, after a successful build.
        os.chdir(str(ROOT / 'site'))
        print(f'\n小小学习屋已启动，监听 {args.bind}:{args.port}', flush=True)
        print(f'本机：http://127.0.0.1:{args.port}/', flush=True)
        if args.bind == '0.0.0.0':
            print(f'iPad：http://服务器局域网IP:{args.port}/ （服务器运行 hostname -I 查看 IP）', flush=True)
        print('按 Ctrl+C 停止。PWA 离线与麦克风功能需通过可信 HTTPS 地址访问。', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print('\n服务已停止。')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
