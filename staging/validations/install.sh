#!/usr/bin/env bash
# One-command setup for validation harness

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "No_Gas_Labs™ Validation Harness - Installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found"
  echo ""
  echo "Install Node.js from: https://nodejs.org/"
  echo "Or via package manager:"
  echo "  Ubuntu/Debian: sudo apt install nodejs npm"
  echo "  macOS: brew install node"
  exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm not found"
  exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm $NPM_VERSION"
echo ""

# Install dependencies
echo "📦 Installing Puppeteer..."
echo ""

if [ "${PUPPETEER_SKIP_DOWNLOAD:-}" = "1" ]; then
  echo "⚠️  PUPPETEER_SKIP_DOWNLOAD=1 set (browser download skipped)"
fi

npm install --silent

if [ $? -eq 0 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ INSTALLATION COMPLETE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Run tests:"
  echo "  npm test"
  echo ""
  echo "Or directly:"
  echo "  node test-suite.js"
  echo ""
else
  echo ""
  echo "❌ Installation failed"
  exit 1
fi
