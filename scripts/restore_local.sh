#!/usr/bin/env bash
# restore_local.sh — applies a pg_dump file to the local PostgreSQL database
#
# Usage:
#   ./scripts/restore_local.sh [path/to/dump.dump]
#
# If no path given, uses the latest dump in scripts/dumps/.
# Reads local DATABASE_URL from .env (root) or falls back to default docker-compose values.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DUMPS_DIR="$SCRIPT_DIR/dumps"

# ── Resolve dump file ────────────────────────────────────────────────────────

if [[ -n "${1:-}" ]]; then
  DUMP_FILE="$1"
else
  # Use latest dump by modification time
  DUMP_FILE=$(ls -t "$DUMPS_DIR"/*.dump 2>/dev/null | head -1 || true)
  if [[ -z "$DUMP_FILE" ]]; then
    echo "ERROR: No dump file found in $DUMPS_DIR"
    echo "Run ./scripts/dump_railway.sh first, or pass a path explicitly:"
    echo "  ./scripts/restore_local.sh path/to/file.dump"
    exit 1
  fi
  echo "No dump file specified — using latest: $DUMP_FILE"
fi

if [[ ! -f "$DUMP_FILE" ]]; then
  echo "ERROR: File not found: $DUMP_FILE"
  exit 1
fi

# ── Resolve local DATABASE_URL ───────────────────────────────────────────────

# Load .env from repo root (if it exists)
ENV_FILE="$SCRIPT_DIR/../.env"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

# DATABASE_URL in .env uses "postgres" as host (Docker Compose service name).
# When running from the host machine, replace it with "localhost".
LOCAL_DB_URL="${DATABASE_URL:-postgresql://foodblog:changeme@localhost:5432/foodblog}"
LOCAL_DB_URL="${LOCAL_DB_URL//@postgres:/@localhost:}"

echo "Target DB: ${LOCAL_DB_URL%%@*}@*** (credentials hidden)"
echo "Dump file: $DUMP_FILE ($(du -sh "$DUMP_FILE" | cut -f1))"

# ── Resolve pg_restore binary ────────────────────────────────────────────────

PG_RESTORE_BIN=""
for version in 18 17 16 15 14; do
  candidate="/opt/homebrew/opt/postgresql@${version}/bin/pg_restore"
  if [[ -x "$candidate" ]]; then
    PG_RESTORE_BIN="$candidate"
    break
  fi
done

if [[ -z "$PG_RESTORE_BIN" ]]; then
  if command -v pg_restore &>/dev/null; then
    PG_RESTORE_BIN="pg_restore"
  else
    echo "ERROR: pg_restore not found. Install a matching PostgreSQL client:"
    echo "  brew install postgresql@18"
    exit 1
  fi
fi

echo "Using: $PG_RESTORE_BIN ($("$PG_RESTORE_BIN" --version))"

# ── Confirm ──────────────────────────────────────────────────────────────────

echo ""
echo "WARNING: This will DROP and RECREATE all tables in the target database."
read -r -p "Continue? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

# ── Restore ──────────────────────────────────────────────────────────────────

echo ""
echo "Restoring..."
"$PG_RESTORE_BIN" \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  --dbname="$LOCAL_DB_URL" \
  "$DUMP_FILE"

echo ""
echo "Done! Database restored successfully."
