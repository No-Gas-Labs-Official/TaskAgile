#!/usr/bin/env bash
# staging/validations/run-with-iteration.sh
# Run tests with iteration number from environment or argument

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Get iteration from argument or environment
ITERATION="${1:-${ITERATION:-8}}"

export ITERATION="$ITERATION"

echo "Running tests for iteration $ITERATION..."
echo ""

npm test

exit $?
