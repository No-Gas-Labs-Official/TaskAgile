#!/usr/bin/env bash
# No_Gas_Labs™ Ralph Loop Manual Rollback Script
# Repository: No-Gas-Labs-Official/TaskAgile
# Branch: mirror

set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "No_Gas_Labs™ Ralph Loop Rollback"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# List available rollback points
echo "Available rollback points:"
git tag -l "rollback-iter-*" | sort -Vr | head -20 || echo "No rollback points found"

if [ -z "$(git tag -l 'rollback-iter-*')" ]; then
    echo ""
    echo "⚠️  No rollback points available"
    echo "Rollback points are created automatically by ralph-codex-loop.sh"
    exit 0
fi

echo ""
echo "Enter iteration number to rollback (or press Ctrl+C to cancel):"
read ITER

if [ -z "$ITER" ]; then
    echo "❌ No iteration specified"
    exit 1
fi

TAG="rollback-iter-$ITER"

if ! git tag -l | grep -q "^$TAG$"; then
    echo "❌ Tag not found: $TAG"
    exit 1
fi

echo ""
echo "⚠️  You are about to rollback to iteration $ITER"
echo "This will:"
echo "  - Reset all changes since iteration $ITER"
echo "  - Force push to origin/mirror"
echo "  - Create an emergency backup tag"
echo ""
echo "Type 'ROLLBACK' to confirm:"
read CONFIRM

if [ "$CONFIRM" != "ROLLBACK" ]; then
    echo "❌ Cancelled"
    exit 0
fi

# Create emergency backup
BACKUP_TAG="emergency-backup-$(date +%Y%m%d-%H%M%S)"
git tag "$BACKUP_TAG"
echo "✅ Emergency backup created: $BACKUP_TAG"

# Rollback
git reset --hard "$TAG"
git push origin mirror --force-with-lease
echo ""
echo "✅ Successfully rolled back to iteration $ITER"
echo "✅ Emergency backup tag: $BACKUP_TAG"
echo ""
echo "To resume Ralph Loop:"
echo "  ./ralph-codex-loop.sh"
