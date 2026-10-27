#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
export DB_CONNECTION="${DB_CONNECTION:-pgsql}"
export APP_KEY="${APP_KEY:-$(php artisan key:generate --show --no-ansi)}"

php artisan schedule:work --no-interaction &
SCHEDULER_PID=$!
trap 'kill "$SCHEDULER_PID" 2>/dev/null || true' EXIT

exec php artisan serve --host=0.0.0.0 --port="${PORT:?PORT is required}"
