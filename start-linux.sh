#!/usr/bin/env bash
# Standalone Git bootstrap and non-Docker launcher.
set -Eeuo pipefail
usage() {
  cat <<'HELP'
用法：bash start-linux.sh [选项]
  --repo URL       Git 仓库，默认 https://github.com/Terry1002/kid.git
  --dir PATH       克隆目录，默认 $HOME/kid-learning
  --branch NAME    分支，默认 main
  --port NUMBER    端口，默认 8088，也可用 PORT 环境变量
  --bind ADDRESS   监听地址，默认 0.0.0.0（局域网可访问）
  --help          显示帮助
首次克隆，之后只快进更新；自动构建并前台启动，Ctrl+C 停止。
需要 Git 和 Python 3.6+，不需要 Docker、pip 或 npm。
HELP
}
repo=https://github.com/Terry1002/kid.git
destination=${HOME:?HOME is required}/kid-learning
branch=main
port=${PORT:-8088}
bind=0.0.0.0
die() { printf '错误：%s\n' "$*" >&2; exit 1; }
while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h) usage; exit 0;;
    --repo|--dir|--branch|--port|--bind)
      [[ $# -ge 2 && -n $2 ]] || die "$1 缺少参数。"
      case "$1" in
        --repo) repo=$2;; --dir) destination=$2;; --branch) branch=$2;;
        --port) port=$2;; --bind) bind=$2;;
      esac
      shift 2;;
    *) die "未知参数：$1；用 --help 查看用法。";;
  esac
done
[[ $repo != -* && $branch != -* ]] || die '仓库或分支参数无效。'
[[ $port =~ ^[1-9][0-9]{0,4}$ ]] && (( 10#$port <= 65535 )) || die '端口必须为 1–65535。'
command -v git >/dev/null 2>&1 || die '缺少 Git，请先安装 git。'
git check-ref-format --branch "$branch" >/dev/null || die '分支名无效。'
python_bin=''
for candidate in "${PYTHON_BIN:-}" python3 python; do
  [[ -n $candidate ]] || continue
  if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import sys; sys.exit(0 if sys.version_info >= (3,6) else 1)' 2>/dev/null; then
    python_bin=$candidate
    break
  fi
done
[[ -n $python_bin ]] || { echo '未找到 Python 3.6+。请运行 python3 --version 检查；也可用 PYTHON_BIN=/路径/python 指定解释器。' >&2; exit 1; }
export PYTHONIOENCODING=utf-8
mkdir -p -- "$(dirname -- "$destination")"
parent=$(cd -- "$(dirname -- "$destination")" && pwd -P)
destination="$parent/$(basename -- "$destination")"
[[ ! -L $destination ]] || die '克隆目录不能是符号链接。'
lock="${destination}.run-lock"
mkdir -- "$lock" 2>/dev/null || die "已有服务运行，或无法创建锁：$lock。请先停止原服务；异常退出后确认没有服务进程再移除空锁目录。"
child=''
cleanup() {
  if [[ -n $child ]]; then
    kill "$child" 2>/dev/null || true
    wait "$child" 2>/dev/null || true
  fi
  rmdir -- "$lock" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
if [[ -d $destination/.git ]]; then
  [[ $(git -C "$destination" remote get-url origin) == "$repo" ]] || die '现有目录的 origin 不匹配，请指定正确 --repo 或新 --dir。'
  [[ $(git -C "$destination" symbolic-ref --short HEAD) == "$branch" ]] || die '现有目录分支不匹配，请先处理分支。'
  [[ -z $(git -C "$destination" status --porcelain) ]] || die '现有目录有本地修改或未跟踪文件，未覆盖；请先提交或备份。'
  printf '正在从 Git 拉取更新…\n'
  git -C "$destination" fetch origin "$branch"
  git -C "$destination" merge-base --is-ancestor HEAD FETCH_HEAD || die '本地提交领先或分叉，请手动处理；未重置源码。'
  git -C "$destination" merge --ff-only FETCH_HEAD
else
  [[ ! -e $destination ]] || die '目标目录已存在且不是 Git 仓库，请选择新的 --dir。'
  printf '正在从 Git 克隆项目…\n'
  git clone --branch "$branch" --single-branch -- "$repo" "$destination"
fi
[[ -f $destination/platform/scripts/serve.py ]] || die '仓库缺少启动程序，请先将最新版项目推送到 Git。'
printf '正在构建并启动版本 %s…\n' "$(git -C "$destination" rev-parse --short HEAD)"
"$python_bin" -u "$destination/platform/scripts/serve.py" --bind "$bind" --port "$port" &
child=$!
result=0
wait "$child" || result=$?
child=''
exit "$result"
