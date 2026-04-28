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

echo "==> Installing backend dependencies"
cd "$ROOT_DIR/backend"
npm install

echo "==> Creating backend env file if missing"
if [ ! -f ".env" ]; then
  cp ".env.example" ".env"
  echo "Created backend/.env from backend/.env.example"
else
  echo "backend/.env already exists"
fi

echo "==> Generating backend Prisma Client"
npm run prisma:generate

cat <<'NEXT_STEPS'

Setup complete.

Clerk webhook is optional for localhost. For local auth, fill only:
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY

Gemini is optional for canvas interaction. Without GEMINI_API_KEY, the backend streams fallback code.

Starting Sketch2Code now...
NEXT_STEPS

cd "$ROOT_DIR"
exec ./scripts/start.sh
