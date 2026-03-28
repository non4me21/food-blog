#!/usr/bin/env bash
# dump_railway.sh — creates a pg_dump from Railway PostgreSQL and saves it locally
#
# Usage:
#   ./scripts/dump_railway.sh
#
# Requires either:
#   a) RAILWAY_DATABASE_URL env var set (e.g. in .env.local)
#   b) Railway CLI installed + logged in (railway login) → URL fetched automatically

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DUMPS_DIR="$SCRIPT_DIR/dumps"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="$DUMPS_DIR/railway_${TIMESTAMP}.dump"

mkdir -p "$DUMPS_DIR"

# ── Resolve Railway DATABASE_URL ────────────────────────────────────────────

# 1. Prefer explicit env var
if [[ -z "${RAILWAY_DATABASE_URL:-}" ]]; then
  # 2. Try to load from .env in repo root
  ENV_LOCAL="$SCRIPT_DIR/../.env"
  if [[ -f "$ENV_LOCAL" ]]; then
    # shellcheck disable=SC1090
    set -a; source "$ENV_LOCAL"; set +a
  fi
fi

if [[ -z "${RAILWAY_DATABASE_URL:-}" ]]; then
  # 3. Try Railway CLI
  if ! command -v railway &>/dev/null; then
    echo "ERROR: RAILWAY_DATABASE_URL not set and 'railway' CLI not found."
    echo "Either:"
    echo "  export RAILWAY_DATABASE_URL='postgresql://...'"
    echo "  or install Railway CLI: https://docs.railway.com/guides/cli"
    exit 1
  fi

  echo "Fetching DATABASE_URL from Railway CLI..."
  RAILWAY_DATABASE_URL=$(railway variables get DATABASE_URL 2>/dev/null || true)

  if [[ -z "$RAILWAY_DATABASE_URL" ]]; then
    echo "ERROR: Could not fetch DATABASE_URL via Railway CLI."
    echo "Make sure you are logged in ('railway login') and are in a linked project."
    exit 1
  fi
fi

echo "Railway DB URL: ${RAILWAY_DATABASE_URL%%@*}@*** (credentials hidden)"

# ── Resolve pg_dump binary ───────────────────────────────────────────────────
# Prefer the highest available version to avoid server version mismatch.
# Homebrew installs versioned binaries under /opt/homebrew/opt/postgresql@XX/bin/

PG_DUMP_BIN=""
for version in 18 17 16 15 14; do
  candidate="/opt/homebrew/opt/postgresql@${version}/bin/pg_dump"
  if [[ -x "$candidate" ]]; then
    PG_DUMP_BIN="$candidate"
    break
  fi
done

if [[ -z "$PG_DUMP_BIN" ]]; then
  if command -v pg_dump &>/dev/null; then
    PG_DUMP_BIN="pg_dump"
  else
    echo "ERROR: pg_dump not found. Install a matching PostgreSQL client:"
    echo "  brew install postgresql@18"
    exit 1
  fi
fi

echo "Using: $PG_DUMP_BIN ($("$PG_DUMP_BIN" --version))"

# ── Run pg_dump ──────────────────────────────────────────────────────────────

echo "Creating dump → $DUMP_FILE"
"$PG_DUMP_BIN" \
  --format=custom \
  --no-owner \
  --no-acl \
  "$RAILWAY_DATABASE_URL" \
  --file="$DUMP_FILE"

echo ""
echo "Done! Dump saved to: $DUMP_FILE"
echo "Size: $(du -sh "$DUMP_FILE" | cut -f1)"
echo ""
echo "To restore locally run:"
echo "  ./scripts/restore_local.sh $DUMP_FILE"
