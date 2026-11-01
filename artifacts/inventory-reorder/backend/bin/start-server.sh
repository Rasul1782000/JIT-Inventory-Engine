#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
export DB_CONNECTION="pgsql"
export APP_KEY="${APP_KEY:-$(php artisan key:generate --show --no-ansi)}"

php artisan schedule:work --no-interaction &
SCHEDULER_PID=$!
trap 'kill "$SCHEDULER_PID" 2>/dev/null || true' EXIT

cd public
exec php -S "0.0.0.0:${PORT:?PORT is required}" ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
