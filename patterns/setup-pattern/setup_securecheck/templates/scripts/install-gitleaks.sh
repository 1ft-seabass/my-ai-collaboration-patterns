#!/bin/bash
set -e

GITLEAKS_VERSION="8.30.0"
GITLEAKS_BIN="./bin/gitleaks"

echo "🔍 Checking gitleaks installation..."

if [ -x "$GITLEAKS_BIN" ]; then
  echo "✅ gitleaks is already installed"
  exit 0
fi

echo "📥 Downloading gitleaks v${GITLEAKS_VERSION}..."
mkdir -p bin
wget -q --show-progress \
  "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz" \
  -O /tmp/gitleaks.tar.gz

echo "📦 Extracting..."
tar -xzf /tmp/gitleaks.tar.gz -C /tmp gitleaks
mv /tmp/gitleaks "$GITLEAKS_BIN"
chmod +x "$GITLEAKS_BIN"
rm /tmp/gitleaks.tar.gz

echo "✅ gitleaks installed: $($GITLEAKS_BIN version)"
