#!/bin/sh
# Run from a NAS scheduled task, or with --watch in a retained shell/service.
set -eu
cd "$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)"
update_once() (
  if ! mkdir .update-lock 2>/dev/null; then echo 'Another update is running; skipped.'; exit 0; fi
  trap 'rmdir .update-lock' EXIT
  image=$(docker compose config --images) || exit 1
  case "$image" in ''|kid-learning:local) echo 'Set IMAGE in .env to a published registry image first.' >&2; exit 1;; esac
  old=$(docker compose ps -q learning) || exit 1
  if [ -n "$old" ]; then
    old_image=$(docker inspect --format '{{.Image}}' "$old") || exit 1
    docker tag "$old_image" kid-learning:rollback || exit 1
  fi
  docker compose pull learning || exit 1
  if docker compose up -d --no-build --wait --wait-timeout 90 learning; then
    echo 'Learning platform is healthy.'
  else
    echo 'Update failed.' >&2
    if [ -n "$old" ]; then
      echo 'Restoring previous local image.' >&2
      IMAGE=kid-learning:rollback docker compose up -d --no-build --pull never --wait --wait-timeout 90 learning || exit 1
    fi
    exit 1
  fi
)
if [ "${1:-}" = '--watch' ]; then
  interval=${UPDATE_INTERVAL:-300}
  case "$interval" in ''|*[!0-9]*) echo 'UPDATE_INTERVAL must be seconds.' >&2; exit 1;; esac
  [ "$interval" -ge 60 ] || { echo 'Minimum interval is 60 seconds.' >&2; exit 1; }
  while :; do update_once || echo 'Will retry at the next interval.' >&2; sleep "$interval"; done
else
  update_once
fi
