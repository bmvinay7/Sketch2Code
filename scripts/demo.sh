#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> 📦 Building the production app (this might take a minute)..."

echo "==> 1/2 Building backend..."
cd "$ROOT_DIR/backend"
if [ ! -d "node_modules" ]; then
  echo "    Installing backend dependencies..."
  npm install
fi
npm run build

echo "==> 2/2 Building frontend..."
cd "$ROOT_DIR"
if [ ! -d "node_modules" ]; then
  echo "    Installing frontend dependencies..."
  npm install
fi
npm run build

echo "==> ✅ Build complete! Starting the demo..."

cleanup() {
  echo "==> Stopping demo..."
  jobs -p | xargs -r kill
}

trap cleanup EXIT INT TERM

echo "==> Starting production backend on http://localhost:4001"
(cd "$ROOT_DIR/backend" && npm start) &

echo "==> Starting production frontend on http://localhost:4000"
(cd "$ROOT_DIR" && npm start) &

wait -n
