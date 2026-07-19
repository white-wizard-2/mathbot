#!/usr/bin/env bash
set -euo pipefail

PORT="${RADAGAST_PORT:-8787}"
DATA_DIR="${RADAGAST_DATA_DIR:-/Users/vinod/.radagast}"
HARNESS="cursor"

if [ -x "$HOME/.radagast/bin/radagast" ]; then
  RADAGAST_BIN="$HOME/.radagast/bin/radagast"
elif command -v radagast >/dev/null 2>&1; then
  RADAGAST_BIN="$(command -v radagast)"
else
  echo "Radagast binary not found. Open the Radagast app." >&2
  exit 1
fi

exec "$RADAGAST_BIN" hook run --harness "$HARNESS" --port "$PORT" --data-dir "$DATA_DIR"
