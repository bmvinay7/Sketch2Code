#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  jobs -p | xargs -r kill 2>/dev/null
}
trap cleanup EXIT INT TERM

# ─── Step 1: Load env ──────────────────────────────────────────────
echo -e "${CYAN}[1/5] Loading environment...${NC}"
if [ -f "$ROOT_DIR/.env.local" ]; then
  export $(grep -v '^#' "$ROOT_DIR/.env.local" | grep -v '^$' | xargs)
  echo -e "  ${GREEN}✓${NC} .env.local loaded"
else
  echo -e "  ${YELLOW}⚠${NC} No .env.local found, using defaults"
fi

# ─── Step 2: Prisma ────────────────────────────────────────────────
echo -e "${CYAN}[2/5] Syncing database...${NC}"
(cd "$ROOT_DIR" && npx prisma db push --skip-generate 2>/dev/null && npx prisma generate 2>/dev/null)
echo -e "  ${GREEN}✓${NC} SQLite database ready"

# ─── Step 3: Verify Gemini ─────────────────────────────────────────
echo -e "${CYAN}[3/4] Verifying Gemini configuration${NC}"
GEMINI_KEY="${GEMINI_API_KEY:-}"

if [ -z "$GEMINI_KEY" ]; then
  echo -e "  ${RED}✗${NC} GEMINI_API_KEY not set — code generation will fall back to placeholder output"
else
  echo -n "  Checking Gemini API..."
  HTTP_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" \
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash?key=${GEMINI_KEY}" 2>/dev/null || echo "000")
  if [ "$HTTP_STATUS" = "200" ]; then
    echo -e " ${GREEN}✓${NC} Gemini API key is valid"
  elif [ "$HTTP_STATUS" = "403" ] || [ "$HTTP_STATUS" = "401" ]; then
    echo -e " ${RED}✗${NC} Gemini API key is INVALID (HTTP $HTTP_STATUS)"
  elif [ "$HTTP_STATUS" = "000" ]; then
    echo -e " ${YELLOW}⚠${NC} Could not reach Gemini API (network issue?)"
  else
    echo -e " ${YELLOW}⚠${NC} Gemini API returned HTTP $HTTP_STATUS"
  fi
fi

# ─── Step 4: Start frontend ────────────────────────────────────────
echo -e "${CYAN}[4/4] Starting frontend on http://localhost:3000${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Sketch2Code is ready!${NC}"
echo -e "  Frontend → ${CYAN}http://localhost:3000${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
(cd "$ROOT_DIR" && rm -rf .next && npm run dev) &

wait -n
