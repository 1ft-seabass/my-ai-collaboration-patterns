// verify --test-run / --simple は15項目のヘルスチェックが1つでも失敗すると
// スキャン自体に到達しない（hook配線前のPhase1段階では使えない）。
// scanはヘルスチェックの合否に関係なく「今あるファイル・設定でスキャンだけする」入口。
// 手順書で唯一OS別に書き分けていた1.5（gitleaks初回スキャン）は、
// findGitleaksBinary()経由の呼び出しに統一することで解消する。
// 検出結果の解釈（本物の漏洩か・プレースホルダーか等）はコード化せず、
// 生出力をそのままAI/人間の判断に委ねる。

const { execSync } = require('child_process');
const { findGitleaksBinary } = require('./environment');

function runSecretlint(all) {
  console.log('[secretlint]');

  let targets = ['**/*'];
  if (!all) {
    const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
      .split('\n').map((s) => s.trim()).filter(Boolean);
    if (staged.length === 0) {
      console.log('  ステージされたファイルがないため secretlint をスキップします');
      return true;
    }
    targets = staged;
  }

  const cmd = `npx secretlint ${targets.map((f) => `"${f}"`).join(' ')}`;
  console.log(`  ${cmd}`);
  try {
    execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log('  → ✅ 0 件検出');
    return true;
  } catch (e) {
    const output = (e.stdout || e.stderr || e.message || '').toString();
    console.log('  → ⚠️  検出あり');
    console.log(output.split('\n').map((l) => '    ' + l).join('\n'));
    return false;
  }
}

function runGitleaks(all) {
  console.log('[gitleaks]');

  const gitleaks = findGitleaksBinary();
  if (!gitleaks) {
    console.log('  ⏭️  gitleaks が未導入のためスキップ（node .security-check/cli.js install-gitleaks で導入してください）');
    return true;
  }

  // gitleaks 8.28+ では detect/protect が非推奨のため git サブコマンドを使用
  // （--staged: ステージ済みのみ / 無指定: 全履歴）。findGitleaksBinary() が
  // OS別のバイナリパス・拡張子を既に解決しているため、ここではOS分岐が発生しない。
  const cmd = all
    ? `${gitleaks.command} git -v --config gitleaks.toml --redact .`
    : `${gitleaks.command} git --staged -v --config gitleaks.toml --redact .`;
  console.log(`  ${cmd}`);
  try {
    execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log('  → ✅ 0 件検出');
    return true;
  } catch (e) {
    const output = (e.stdout || e.stderr || e.message || '').toString();
    if (e.status === 1 && /Finding:/.test(output)) {
      const findings = (output.match(/Finding:/g) || []).length;
      console.log(`  → ⚠️  ${findings} 件検出`);
      console.log(output.split('\n').map((l) => '    ' + l).join('\n'));
      return false;
    }
    console.log('  → ✅ 0 件検出');
    return true;
  }
}

function run(args) {
  const all = args.includes('--all');
  console.log(all ? '🔍 スキャン実行（全ファイル + 全履歴）\n' : '🔍 スキャン実行（staged ファイルのみ）\n');

  const secretlintOk = runSecretlint(all);
  console.log('');
  const gitleaksOk = runGitleaks(all);

  console.log('\n================================');
  if (secretlintOk && gitleaksOk) {
    console.log('スキャン結果: ✅ 問題なし');
  } else {
    console.log('スキャン結果: ⚠️  要確認（上記の検出内容を確認し、本物の漏洩か・プレースホルダーかを判断してください）');
  }

  return 0;
}

module.exports = { run };
