#!/usr/bin/env node

// 既存の gitleaks.toml がカスタマイズ済み（独自の allowlist/rules 追加あり）の場合、
// テンプレートで丸ごと上書きコピーすると既存のカスタマイズを握りつぶしてしまう。
// このスクリプトは以下2点だけを機械的に追記・修正し、他の内容には一切触れない:
//   1. [extend] または [[rules]] が無い場合、[extend]\nuseDefault = true を追記
//   2. allowlist の 'tmp/.*'（未アンカー）を '^tmp/.*' にアンカー
// 判断をAIの読み取りに委ねず、決定論的に処理することで
// どのセッション・誰が実行しても同じ結果になる（冪等）。

const fs = require('fs');
const path = require('path');

const TARGET = path.join(process.cwd(), 'gitleaks.toml');

if (!fs.existsSync(TARGET)) {
  console.log('❌ gitleaks.toml が見つかりません（プロジェクトルートで実行してください）');
  process.exit(1);
}

let content = fs.readFileSync(TARGET, 'utf8');
let changed = false;

// 1. 検出ルールの有無を確認し、無ければ追記
const hasRules = /\[extend\]/.test(content) || /\[\[rules\]\]/.test(content);
if (hasRules) {
  console.log('✅ gitleaks.toml には既に検出ルール（[extend] または [[rules]]）があります。変更なし。');
} else {
  const suffix = content.endsWith('\n') ? '' : '\n';
  content += `${suffix}\n[extend]\nuseDefault = true\n`;
  changed = true;
  console.log('✅ [extend]\\nuseDefault = true を追記しました。');
}

// 2. allowlist の tmp/.* を未アンカーのまま使っている場合はアンカーする
//    （'''tmp/.*''' のような完全一致のみを対象にし、意図しない置換を避ける）
const unanchoredTmpPattern = /'''tmp\/\.\*'''/g;
if (unanchoredTmpPattern.test(content)) {
  content = content.replace(unanchoredTmpPattern, `'''^tmp/.*'''`);
  changed = true;
  console.log('✅ allowlist の tmp/.* を ^tmp/.* にアンカーしました（src/mytmp/ 等への誤爆防止）。');
} else {
  console.log('ℹ️  tmp/.* の未アンカーパターンは見つかりませんでした（対応不要、または既にアンカー済み）。');
}

if (changed) {
  fs.writeFileSync(TARGET, content);
  console.log('\n📝 gitleaks.toml を更新しました。他のカスタム内容（独自 allowlist/rules 等）はそのまま残しています。');
} else {
  console.log('\n📝 変更はありませんでした。');
}
