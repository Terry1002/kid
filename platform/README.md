# 小小学习屋

面向 iPad 的统一 PWA：主页选择「拼音小练习」或「一笔一字」。Linux、群晖和 fnOS 共用一份 Docker Compose 工程。支持 amd64 / arm64；32 位 ARM 不在预设镜像范围内。

当前交付是本地工程，未创建 Git 仓库、未发布镜像、未连接 NAS。自动更新脚本与可选 GitHub Actions 已准备好，但未启用任何计划任务。本机没有 Docker，容器运行需要在部署端验证。

## 已整合功能

- 拼音：a、o、e、i、u、ü × 四声，另含练习图中的 20 个音节、12 个词语；可逐项勾选、分组全选/清空；示范按钮延迟可设为 0–60 秒（默认 10 秒），不显示倒计时；每次示范读三遍；换题停止播放；录音回听。设置保存在当前设备，暂不自动判音。
- 音节示范使用本地 MP3；词语使用设备普通话语音（含轻声词），需有普通话语音包，离线朗读取决于设备支持。图片中“抚摸”的标音已纠正为 fǔ mō。
- 汉字：输入文字看拼音；楷体字样；笔顺动画、暂停、重播、逐笔演示；横滑换字和笔画分页；浏览器语音输入；完整离线字库。
- 一个主页、一个安装图标、一个根 Service Worker。两个模块点左上角返回主页。不需要分别安装两个 PWA。
- 自动缓存页面与拼音音频；完整字库/字体约 36 MB，由家长主动下载。语音输入依赖浏览器支持和可能的网络服务。浏览器可以清理离线缓存。
- 新版本出现时提示更新，不在孩子练习时强制刷新。部分设备间没有学习成绩同步，因为此版本未建立账号或学习记录后端。

## 本地开发（A 电脑）

Python 3.6+ 即可，不需要 npm 安装。仓库根目录运行：

```sh
python platform/scripts/build.py
python platform/scripts/check.py
python -m http.server 8901 --bind 127.0.0.1 --directory platform/site
```

浏览器访问 `http://127.0.0.1:8901/`。改动 `platform/web/` 后重新 build。输出目录 `platform/site/` 可重新生成，不要直接修改。`pinyin/` 是原独立版本的留档，平台后续以 `platform/web/pinyin/` 为准。

如本地预览已经安装了 Service Worker，重新构建后刷新页面，点击新版本提示；必要时关闭该站点所有标签后重新打开。不要通过覆盖缓存的方式处理版本更新。

## Linux / NAS 首次运行

### 不使用 Docker：Python 一键启动

支持 Git 和 Python 3.6+，启动脚本自动从 Git 克隆或更新，再构建并启动。脚本自动查找 python3 / python，排除 Python 2。先把最新脚本及 `platform/scripts/serve.py` 推送到仓库，然后在 Linux 运行：

```bash
curl -fL https://raw.githubusercontent.com/Terry1002/kid/main/start-linux.sh -o start-linux.sh
bash start-linux.sh
```

也可用 `PYTHON_BIN=/实际路径/python3 bash start-linux.sh` 指定解释器，无需替换系统默认 Python。若系统完全没有 Python，请先提供 Linux 发行版及版本，再选择对应安装方式。

自动构建、检查并监听 `0.0.0.0:8088`，无需 pip/npm 安装。在同一局域网的 iPad 打开 `http://服务器IP:8088/`。运行 `hostname -I` 查看服务器 IP，防火墙需允许端口。不要把 `0.0.0.0` 或 `127.0.0.1` 当作 iPad 访问地址。

```bash
bash start-linux.sh --port 8090       # 改端口
bash start-linux.sh --bind 127.0.0.1 # 只允许本机访问，或放在同机反向代理后面
```

前台运行按 Ctrl+C 停止；关闭终端也可能停止进程。需要后台运行可使用：

```bash
nohup bash start-linux.sh > /tmp/kid-learning.log 2>&1 &
echo $!                            # 记下进程 PID；停止用 kill PID
tail -f /tmp/kid-learning.log       # 查看启动结果
```

默认克隆到 `~/kid-learning`，再次运行同一脚本会先从 Git 快进更新。可用 `--dir /实际部署目录 --branch main --repo 仓库地址` 自定义。私有仓库可将启动脚本复制到 Linux，配置 SSH 密钥后使用 `--repo git@github.com:Terry1002/kid.git`。现有目录如有本地修改、分叉或 origin 不匹配，脚本会停止，不强制覆盖。

此方式不自动开机启动、不在运行时定时更新。更新时先停止原脚本再运行；启动期间会一直持有 `部署目录.run-lock`，防止另一个启动脚本修改正在服务的目录。异常断电后确认无进程才可移除空锁目录。Python 服务适合家庭局域网，公网部署应放在正式 HTTPS 反向代理后面。HTTP 下基础练习可用，iPad PWA 离线及麦克风仍需可信 HTTPS。

### 从 Git 一键部署（不需要镜像仓库）

仓库根目录的 `deploy-linux.sh` 会检查 Git、Docker、Compose v2，克隆或快进更新代码，在服务器本地构建镜像并启动。再次运行相同命令即可更新。默认仓库为 `https://github.com/Terry1002/kid.git`，默认部署目录为 `$HOME/kid-learning`。

先将该脚本及本次修改推送到 Git，然后在 Linux 执行：

```bash
curl -fL https://raw.githubusercontent.com/Terry1002/kid/main/deploy-linux.sh -o deploy-linux.sh
bash deploy-linux.sh
```

自定义端口与目录：

```bash
PORT=8090 bash deploy-linux.sh https://github.com/Terry1002/kid.git /opt/kid-learning
```

使用私有仓库时，raw 下载可能不可用。可将本地 `deploy-linux.sh` 复制到 Linux，先配置 SSH 密钥，再运行 `bash deploy-linux.sh git@github.com:Terry1002/kid.git`。克隆后的 origin 地址需与后续传入地址一致。不要把访问令牌写到 URL。

当前用户需要部署目录写权限及 Docker 权限。脚本不会安装系统软件、强制覆盖 Git 修改或配置定时任务。构建失败保留旧服务；新容器健康检查失败时，尝试恢复上个镜像与 Compose 配置。更新可能短暂中断。首次失败没有旧服务可恢复。异常断电留下的 `部署目录.deploy-lock` 只能在确认没有部署任务运行后移除。

Git 部署会忽略 `.env` 的 IMAGE，使用本地镜像；不要在同一个部署上混用后文的镜像自动更新脚本。稳定的端口配置可在部署后的 `platform/.env` 修改。PORT 环境变量只影响当次运行，若使用它，则后续更新也应提供相同的值。

### 手动 Docker 部署

要求设备支持 Docker Engine 和 Docker Compose v2（包含 `--wait` 与 `--wait-timeout`）。不是所有群晖硬件都支持容器。将整个 `platform` 文件夹复制到部署端，进入目录：

```sh
cp .env.example .env
docker compose up -d --build --wait
docker compose ps
```

同一局域网的 iPad 访问 `http://服务器IP:8088/`。`.env` 中可修改 `PORT` 避免冲突。服务器防火墙应允许该端口，iPad 不要使用 `127.0.0.1`。群晖 Container Manager 或 fnOS Docker 的 Compose 项目也可以导入此文件；若界面不支持构建，先通过 SSH 执行上面的构建命令，或使用后面的预构建镜像方式。

HTTP 可以测试基础页面。要让 iPad 的 PWA 离线功能、麦克风权限正常工作，应配置设备信任的 HTTPS。

## HTTPS

推荐 NAS 使用已有的 HTTPS 反向代理：把一个有可信证书的域名转发到本机 `http://127.0.0.1:8088`。iPad 用该域名访问，Safari → 分享 → 添加到主屏幕。反向代理必须从域名根路径 `/` 转发；当前工程不支持挂到 `/kids/` 之类子路径。

普通 Linux 也可使用随附的 Caddy，前提是域名已解析、服务器的 80/443 端口可用于证书签发且未被其他服务占用：

```sh
# 在 .env 增加 SITE_DOMAIN=你的真实域名
docker compose -f compose.yaml -f compose.https.yaml up -d --build --wait
```

NAS 已占用 80/443 时使用 NAS 自带反向代理，不启动附加网关。纯内网且无公网入站时，需要 DNS 验证方式签发证书或给 iPad 正式安装并信任内部 CA；仅改用 https URL 或未受信任的自签证书不等于可用 HTTPS。

本项目无账号登录。若仅供家庭使用，保持在家庭网络/VPN 内；如希望公网访问，后续应增加访问控制。

## A 电脑推送后，B 端自动更新

推荐的数据流：

```text
A 开发电脑 → Git 仓库 → 自动构建 amd64/arm64 Docker 镜像
                                      ↓
                       B Linux / 群晖 / fnOS 定时拉取
                                      ↓
                           健康检查 → iPad 提示更新
```

服务端同步的是经过构建的程序版本，不是把 A 电脑的开发目录双向同步到正在运行的容器。这样不会把未完成的修改直接展示给孩子。若 B 也是开发电脑，代码用 Git pull --ff-only 更新；有本地改动时先提交，不能定时强制覆盖。

目前没有仓库，因此尚未发生任何推送。以后选择 GitHub 时，把**整个 kid 目录**作为仓库根目录，保留根目录 `.github/workflows/container.yml`，推送 main 后工作流会检查并发布 `ghcr.io/账户名/仓库名:main` 及完整 commit 标签。仓库名会转换为小写。工作流声明支持 amd64 与 arm64。

在 B 端 `.env` 设置发布后的真实地址：

```text
IMAGE=ghcr.io/你的账户/你的仓库:main
PORT=8088
BIND_ADDRESS=0.0.0.0
```

私有镜像先用 `docker login ghcr.io` 登录，凭据使用具有 read:packages 的令牌，并在交互提示中输入，不写入仓库。镜像为公开时不需要登录。选择 Gitee/自建 Git 时，可以在可信构建机上 `docker buildx build --platform linux/amd64,linux/arm64 --push` 发布到可访问的镜像仓库，NAS 更新脚本无需更改。

首次拉取运行：

```sh
docker compose pull learning
docker compose up -d --no-build --wait learning
```

自动更新脚本（默认只更新当前平台服务）：

```sh
sh scripts/update.sh          # 执行一次，可放入 NAS 的任务计划
sh scripts/update.sh --watch  # 每 5 分钟检查一次，终端需要保持运行
```

NAS 任务计划或 Linux cron 可每 5 分钟运行一次 `sh /实际路径/platform/scripts/update.sh`。路径含空格需引用。任务账号需拥有 Docker 权限和镜像登录凭据；NAS 的 docker 如不在计划任务 PATH 内，先配置 PATH。无人值守重启后继续运行，请用 NAS 任务计划或系统服务，而不是依赖终端的 --watch。这份交付**没有自动安装定时任务**。

脚本先拉取、再更新容器并等待健康检查；下载失败保留原容器，启动失败尝试恢复旧镜像 `kid-learning:rollback`。它并不提供无停机切换，更新时可能短暂中断；已缓存的 PWA 仍可使用。并发任务会跳过。异常断电可能留下 `platform/.update-lock` 空目录，确认没有更新进程后可移除该空目录再重试。健康检查验证网页服务，不替代所有功能测试。

带 Caddy 的安装也只需更新 learning，已有网关继续运行。不要让这个更新脚本管理其他 Compose 服务或其他项目。

## 数据与来源

当前服务是静态资源容器，没有服务器数据库，因此无需学习数据卷；录音不上传服务器，换题即清理。如果未来增加学习记录，需另建 API 和持久化数据库，独立于镜像升级。不要把学习数据写进容器可写层。

汉字模块来自本机既有「一笔一字」项目，保留字体和字库许可证。拼音音频来源 `https://github.com/cmguo/PinYinSound`，原资源的再分发许可需要在商业发行前确认；本工程未声称这些音频由我们拥有或采用某种开源授权。

## 验证

```sh
python platform/scripts/build.py
python platform/scripts/check.py
node platform/scripts/test-worker.cjs   # Node 18+；推荐 Node 24
```

参考文档：[Docker Compose](https://docs.docker.com/compose/how-tos/production/)、[多架构镜像](https://docs.docker.com/build/ci/github-actions/multi-platform/)、[PWA HTTPS 要求](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)。
