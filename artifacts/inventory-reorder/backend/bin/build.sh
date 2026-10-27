#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
composer install --no-dev --optimize-autoloader --no-interaction
