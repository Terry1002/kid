#!/usr/bin/env bash
# Git-based deployment. Requires Git, Docker Engine and Docker Compose v2.
set -Eeuo pipefail

usage() {
  cat <<'HELP'
用法：bash deploy-linux.sh [仓库地址] [部署目录]

默认仓库：https://github.com/Terry1002/kid.git
默认目录：$HOME/kid-learning
可选环境变量：BRANCH=main PORT=8088 BIND_ADDRESS=0.0.0.0

示例：
  bash deploy-linux.sh
  PORT=8090 bash deploy-linux.sh https://github.com/Terry1002/kid.git /opt/kid-learning

首次克隆并构建；再次运行只接受快进更新，不覆盖本地修改。
私有仓库请事先配置 Git SSH 密钥或凭据。不会自动安装系统软件。
HELP
}
die() { printf '错误：%s\n' "$*" >&2; exit 1; }
if [[ ${1:-} == --help || ${1:-} == -h ]]; then usage; exit 0; fi
[[ $# -le 2 ]] || { usage; exit 1; }
repo=${1:-https://github.com/Terry1002/kid.git}
destination=${2:-${HOME:?HOME is required}/kid-learning}
branch=${BRANCH:-main}
[[ $repo != -* && -n $repo ]] || die '无效仓库地址。'
[[ $branch != -* && -n $branch ]] || die '无效分支名。'
if [[ -v PORT ]]; then
  [[ $PORT =~ ^[1-9][0-9]{0,4}$ ]] && (( 10#$PORT <= 65535 )) || die 'PORT 必须为 1–65535。'
fi
for command in git docker mktemp cksum; do command -v "$command" >/dev/null || die "缺少 $command，请先安装。"; done
git check-ref-format --branch "$branch" >/dev/null || die '无效分支名。'
docker info >/dev/null 2>&1 || die 'Docker 未启动，或当前用户没有 Docker 权限。'
docker compose version >/dev/null 2>&1 || die '需要 Docker Compose v2。'
compose_help=$(docker compose up --help)
[[ $compose_help == *--wait-timeout* ]] || die '请升级 Docker Compose：需要支持 --wait-timeout。'

# Resolve the deployment path once. Never reset or delete a user's checkout.
mkdir -p -- "$(dirname -- "$destination")"
parent=$(cd -- "$(dirname -- "$destination")" && pwd -P)
destination="$parent/$(basename -- "$destination")"
[[ ! -L $destination ]] || die '部署目录不能是符号链接。'
lock="${destination}.deploy-lock"
mkdir -- "$lock" 2>/dev/null || die "已有部署任务，或无法创建锁目录：$lock。异常中断后请确认没有部署进程再移除空锁目录。"
snapshot=''
cleanup() {
  # No recursive removal: only our own temporary file and empty lock directory.
  if [[ -n $snapshot && -f $snapshot ]]; then unlink "$snapshot"; fi
  rmdir -- "$lock" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
project="kid-$(printf '%s' "$destination" | cksum | cut -d ' ' -f 1)"
export COMPOSE_PROJECT_NAME="$project"
unset COMPOSE_FILE COMPOSE_PROFILES
old_container=''
rollback_image="${project}:rollback"

if [[ -d $destination/.git ]]; then
  [[ $(git -C "$destination" remote get-url origin) == "$repo" ]] || die '现有目录的 origin 与指定仓库不同，请使用原仓库地址或选择新目录。'
  [[ $(git -C "$destination" symbolic-ref --short HEAD) == "$branch" ]] || die '现有目录分支不匹配，请先手动处理分支。'
  [[ -z $(git -C "$destination" status --porcelain) ]] || die '部署目录存在本地修改或未跟踪文件，请先提交或备份；未覆盖文件。'
  if [[ -f $destination/platform/compose.yaml ]]; then
    old_container=$(docker compose --project-directory "$destination/platform" -f "$destination/platform/compose.yaml" ps -q learning)
    if [[ -n $old_container ]]; then
      old_image=$(docker inspect --format '{{.Image}}' "$old_container")
      docker tag "$old_image" "$rollback_image"
      snapshot=$(mktemp "$lock/previous-compose.XXXXXX")
      IMAGE="$rollback_image" docker compose --project-directory "$destination/platform" -f "$destination/platform/compose.yaml" config > "$snapshot"
    fi
  fi
  printf '正在拉取 %s 分支…\n' "$branch"
  git -C "$destination" fetch origin "$branch"
  git -C "$destination" merge --ff-only FETCH_HEAD
else
  [[ ! -e $destination ]] || die '目标目录已存在且不是本脚本的 Git 仓库，请指定新目录。'
  printf '正在克隆项目…\n'
  git clone --branch "$branch" --single-branch -- "$repo" "$destination"
fi

cd -- "$destination/platform"
[[ -f compose.yaml && -f Dockerfile && -f .env.example ]] || die '仓库缺少 platform 部署文件。'
if [[ ! -f .env ]]; then cp .env.example .env; fi
commit=$(git rev-parse --short=12 HEAD)
# Git deployment always builds locally; an IMAGE setting for registry mode is ignored.
export IMAGE="${project}:${commit}"
compose=(docker compose --project-directory "$PWD" -f "$PWD/compose.yaml")
printf '正在构建版本 %s；原服务会继续运行直到构建完成…\n' "$commit"
"${compose[@]}" build --pull learning
if ! "${compose[@]}" up -d --no-build --pull never --wait --wait-timeout 120 learning; then
  printf '新版本未通过健康检查。\n' >&2
  if [[ -n $snapshot ]]; then
    printf '正在恢复上一个镜像与服务配置…\n' >&2
    if docker compose --project-directory "$PWD" -f "$snapshot" up -d --no-build --pull never --wait --wait-timeout 120 learning; then
      printf '原服务已恢复。源码保留新提交，修复问题后重新部署。\n' >&2
    else
      printf '恢复失败，请执行 docker compose logs 检查。\n' >&2
    fi
  fi
  exit 1
fi
printf '\n部署成功！版本：%s\n目录：%s\n' "$commit" "$destination"
"${compose[@]}" ps
printf '\n服务监听端口：\n'
"${compose[@]}" port learning 8080
printf '\niPad 请访问 http://服务器局域网IP:端口/（默认端口 8088）。\n再次运行相同命令即可从 Git 更新。完整 PWA 和麦克风功能请通过可信 HTTPS 访问。\n'
