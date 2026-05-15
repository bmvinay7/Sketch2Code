#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Installing frontend dependencies"
npm install

echo "==> Creating frontend env file if missing"
if [ ! -f ".env.local" ]; then
  cp ".env.local.example" ".env.local"
  echo "Created .env.local from .env.local.example"
else
  echo ".env.local already exists"
fi

echo "==> Generating frontend Prisma Client"
npx prisma generate

cat <<'NEXT_STEPS'

Setup complete.

Recommended envs for local or Vercel:
  DATABASE_URL
  GEMINI_API_KEY

Optional auth envs:
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  CLERK_WEBHOOK_SECRET

Optional caching envs:
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN

Starting Sketch2Code now...
NEXT_STEPS

cd "$ROOT_DIR"
exec ./scripts/start.sh
