#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
  jobs -p | xargs -r kill
}

trap cleanup EXIT INT TERM

echo "==> Starting backend on http://localhost:3001"
(cd "$ROOT_DIR/backend" && npm run dev) &

echo "==> Starting frontend on http://localhost:3000"
(cd "$ROOT_DIR" && npm run build && npm run dev) &

wait -n
