#!/bin/bash
# setup-securecheck v1 → v3.0.0 移行スクリプト（v2 を経由しない直行ルート）
# 使い方: bash tmp/securecheck-migration/migrate-to-v3-from-v1.sh
#
# 機械的に自動化できる部分（パッケージ入替・ファイル配置）のみを行う。
# package.json の編集は MIGRATION_GUIDE_v1_to_v3.0.0.md の Step 2・Step 4 で
# 手動対応する（既存のカスタマイズを壊さないため）。
#
# 重要: このスクリプトを実行する前に、package.json から "prepare": "husky" などの
# husky関連スクリプトを必ず削除しておくこと（Step 2）。削除しないまま npm install/
# uninstall を実行すると、prepare スクリプトが自動的に再実行され、直後に削除した
# .husky/ が再生成されてしまう。

set -e

echo "setup-securecheck v1 → v3.0.0 移行を開始します..."
echo ""

if [ ! -d "tmp/securecheck-v3/.security-check" ]; then
  echo "❌ tmp/securecheck-v3/.security-check が見つかりません。先に degit で取得してください（Step 3 参照）"
  exit 1
fi

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

# 4. .security-check/ を配置
if [ -d ".security-check" ]; then
  echo "⏭️  .security-check/ は既に存在します（スキップ）"
else
  echo "▶ .security-check/ を配置..."
  cp -r tmp/securecheck-v3/.security-check ./.security-check
  echo "✅ 配置しました"
fi
echo ""

echo "================================"
echo "✅ 自動変更が完了しました"
echo ""
echo "⚠️  以下は手動で対応してください（MIGRATION_GUIDE_v1_to_v3.0.0.md を参照）:"
echo "   Step 4: package.json を更新（simple-git-hooks 設定・scripts.security を追加）"
echo "   Step 5: npx simple-git-hooks を再実行"
echo "   Step 6: .gitignore を更新"
echo "   Step 7: 動作確認"
echo "================================"
