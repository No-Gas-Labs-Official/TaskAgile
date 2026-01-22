#!/usr/bin/env bash
# staging/validations/install-and-run.sh
# One-command installer and test runner for Ralph Loop validation

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "No_Gas_Labs™ Validation Harness - Setup & Execute"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Node.js installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found"
  echo "Install: https://nodejs.org/"
  exit 1
fi

echo "✅ Node.js $(node --version)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo ""
  echo "📦 Installing Puppeteer..."
  npm install --silent
  echo "✅ Dependencies installed"
else
  echo "✅ Dependencies already installed"
fi

echo ""
echo "🎮 Running validation suite..."
echo ""

# Run tests
npm test

exit $?
