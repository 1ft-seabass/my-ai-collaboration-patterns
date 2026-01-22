#!/bin/bash
set -e

echo "=== secretlint ==="
npx secretlint "**/*"

echo ""
echo "=== gitleaks ==="
if [ -x "./bin/gitleaks" ]; then
  ./bin/gitleaks detect --source . --config gitleaks.toml -v
elif command -v gitleaks &> /dev/null; then
  gitleaks detect --source . -v
else
  echo "⚠️  gitleaks not found. Install with: npm run gitleaks:install"
  exit 1
fi

echo ""
echo "✅ All checks passed"
