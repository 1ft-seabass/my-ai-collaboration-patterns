#!/bin/bash
# setup-securecheck v2.x → v3.0.0 移行スクリプト
# 使い方: bash tmp/securecheck-migration/migrate-to-v3.sh
#
# 機械的に自動化できる部分（ファイルの移設・削除）のみを行う。
# package.json / .gitignore の編集は MIGRATION_GUIDE_v2.1.0_to_v3.0.0.md の
# Step 3・Step 5 で手動対応する（既存のカスタマイズを壊さないため）。

set -e

echo "setup-securecheck v2.x → v3.0.0 移行を開始します..."
echo ""

if [ ! -d "tmp/securecheck-v3/.security-check" ]; then
  echo "❌ tmp/securecheck-v3/.security-check が見つかりません。先に degit で取得してください（Step 2 参照）"
  exit 1
fi

# 1. .security-check/ を配置
if [ -d ".security-check" ]; then
  echo "⏭️  .security-check/ は既に存在します（スキップ）"
else
  echo "▶ .security-check/ を配置..."
  cp -r tmp/securecheck-v3/.security-check ./.security-check
  echo "✅ 配置しました"
fi
echo ""

# 2. 既存の gitleaks バイナリを移設（クローン直後で無ければスキップ）
mkdir -p .security-check/bin
if [ -f "bin/gitleaks" ]; then
  echo "▶ bin/gitleaks を .security-check/bin/ に移設..."
  mv bin/gitleaks .security-check/bin/gitleaks
  chmod +x .security-check/bin/gitleaks
  echo "✅ 移設しました"
elif [ -f "bin/gitleaks.exe" ]; then
  echo "▶ bin/gitleaks.exe を .security-check/bin/ に移設..."
  mv bin/gitleaks.exe .security-check/bin/gitleaks.exe
  echo "✅ 移設しました"
else
  echo "⏭️  bin/gitleaks(.exe) が見つかりません（node .security-check/cli.js install-gitleaks で導入してください）"
fi
echo ""

# 3. 既存の実行ログを移設
mkdir -p .security-check/logs
if [ -f ".logs/pre-commit.log" ]; then
  echo "▶ .logs/pre-commit.log を .security-check/logs/ に移設..."
  mv .logs/pre-commit.log .security-check/logs/pre-commit.log
  echo "✅ 移設しました"
else
  echo "⏭️  .logs/pre-commit.log が見つかりません（スキップ）"
fi
echo ""

# 4. 旧レイアウトの削除（このパターンが生成した既知のファイルのみ。カスタムスクリプトには触れない）
echo "▶ 旧レイアウトのファイルを削除..."
rm -f scripts/pre-commit.js scripts/security-verify.js scripts/install-gitleaks.js scripts/install-gitleaks.sh
rmdir scripts 2>/dev/null || echo "  ℹ️  scripts/ に他のファイルが残っているため削除しません"
rmdir bin 2>/dev/null || true
rmdir .logs 2>/dev/null || true
echo "✅ 削除しました"
echo ""

echo "================================"
echo "✅ 自動変更が完了しました"
echo ""
echo "⚠️  以下は手動で対応してください（MIGRATION_GUIDE を参照）:"
echo "   Step 3: package.json を更新（scripts.security 追加、旧 security:*/secret-scan:* 系を削除、simple-git-hooks.pre-commit のパス変更）"
echo "   Step 4: npx simple-git-hooks を再実行"
echo "   Step 5: .gitignore を更新"
echo "   Step 6: 動作確認"
echo "================================"
