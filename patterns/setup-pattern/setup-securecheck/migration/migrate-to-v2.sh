#!/bin/bash
# setup-securecheck v1 → v2.0.0 移行スクリプト
# 使い方: bash tmp/securecheck-migration/migrate-to-v2.sh

set -e

echo "setup-securecheck v1 → v2.0.0 移行を開始します..."
echo ""

# 1. husky, lint-staged をアンインストール
echo "▶ husky と lint-staged をアンインストール..."
npm uninstall husky lint-staged
echo "✅ アンインストール完了"
echo ""

# 2. simple-git-hooks をインストール
echo "▶ simple-git-hooks をインストール..."
npm install -D simple-git-hooks
echo "✅ インストール完了"
echo ""

# 3. .husky/ を削除
if [ -d ".husky" ]; then
  echo "▶ .husky/ を削除..."
  rm -rf .husky/
  echo "✅ .husky/ を削除しました"
else
  echo "⏭️  .husky/ が見つかりません（スキップ）"
fi
echo ""

echo "================================"
echo "✅ 自動変更が完了しました"
echo ""
echo "⚠️  以下は手動で対応してください（MIGRATION_GUIDE を参照）:"
echo "   Step 3: package.json に simple-git-hooks 設定を追加"
echo "   Step 4: scripts/*.js を新バージョンに置き換え"
echo "   Step 5: .gitignore に .logs/ を追加"
echo "   Step 6: 動作確認"
echo "================================"
