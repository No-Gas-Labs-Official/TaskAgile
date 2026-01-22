#!/usr/bin/env bash
set -euo pipefail
echo "No_Gas_Labs™ Rollback Utility"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
if [ "$BRANCH" != "mirror" ]; then
  echo "❌ Not on mirror branch: $BRANCH"
  exit 1
fi
echo "Rollback tags:"
git tag -l "rollback-iter-*" | sort -V | tail -20
echo "Enter iteration number:"
read -r ITER
TAG="rollback-iter-$ITER"
git reset --hard "$TAG"
git push origin mirror --force-with-lease
echo "✅ Rolled back to $TAG"
