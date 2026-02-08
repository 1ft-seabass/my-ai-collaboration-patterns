#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const testRun = args.includes('--test-run');

console.log('🔍 Security Setup Health Check');
console.log('================================\n');

const results = {
  passed: 0,
  failed: 0,
  warning: 0,
  skipped: 0
};

const checks = {
  existence: [],
  content: [],
  operation: []
};

// Helper functions
function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
  } catch (e) {
    return null;
  }
}

function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    return null;
  }
}

function checkResult(passed, message, type = 'normal') {
  if (type === 'warning') {
    console.log(`  ⚠️  ${message}`);
    results.warning++;
  } else if (type === 'skip') {
    console.log(`  ⏭️  ${message}`);
    results.skipped++;
  } else if (passed) {
    console.log(`  ✅ ${message}`);
    results.passed++;
  } else {
    console.log(`  ❌ ${message}`);
    results.failed++;
  }
}

// ===========================
// 存在チェック
// ===========================
console.log('[存在チェック]');

// 1. .secretlintrc.json
const secretlintrcExists = fileExists('.secretlintrc.json');
checkResult(secretlintrcExists, '.secretlintrc.json' + (!secretlintrcExists ? ' — ファイルが見つかりません' : ''));
checks.existence.push({ name: '.secretlintrc.json', exists: secretlintrcExists });

// 2. gitleaks.toml
const gitleaksTomlExists = fileExists('gitleaks.toml');
checkResult(gitleaksTomlExists, 'gitleaks.toml' + (!gitleaksTomlExists ? ' — ファイルが見つかりません' : ''));
checks.existence.push({ name: 'gitleaks.toml', exists: gitleaksTomlExists });

// 3. .husky/pre-commit
const huskyPrecommitExists = fileExists('.husky/pre-commit');
checkResult(huskyPrecommitExists, '.husky/pre-commit' + (!huskyPrecommitExists ? ' — ファイルが見つかりません' : ''));
checks.existence.push({ name: '.husky/pre-commit', exists: huskyPrecommitExists });

// 4. package.json の lint-staged 設定
const packageJsonExists = fileExists('package.json');
let lintStagedExists = false;
if (packageJsonExists) {
  const packageJson = readFile('package.json');
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson);
      lintStagedExists = !!pkg['lint-staged'];
    } catch (e) {
      // parse error
    }
  }
}
checkResult(lintStagedExists, 'package.json lint-staged 設定' + (!lintStagedExists ? ' — 設定が見つかりません' : ''));
checks.existence.push({ name: 'lint-staged', exists: lintStagedExists });

console.log('');

// ===========================
// 中身チェック
// ===========================
console.log('[中身チェック]');

// 5. .secretlintrc.json の内容
if (secretlintrcExists) {
  const secretlintrc = readFile('.secretlintrc.json');
  const hasPresetRecommend = secretlintrc && secretlintrc.includes('preset-recommend');
  checkResult(hasPresetRecommend, '.secretlintrc.json に preset-recommend' + (hasPresetRecommend ? ' あり' : ' が含まれていません'));
} else {
  checkResult(false, '.secretlintrc.json — 存在チェックが ❌ のためスキップ', 'skip');
}

// 6. gitleaks.toml の内容
if (gitleaksTomlExists) {
  const gitleaksToml = readFile('gitleaks.toml');
  const isNotEmpty = gitleaksToml && gitleaksToml.trim().length > 0;
  checkResult(isNotEmpty, 'gitleaks.toml が' + (isNotEmpty ? '空でない' : '空ファイルです'));
} else {
  checkResult(false, 'gitleaks.toml — 存在チェックが ❌ のためスキップ', 'skip');
}

// 7. .husky/pre-commit の内容
if (huskyPrecommitExists) {
  const precommit = readFile('.husky/pre-commit');
  const hasSecretlint = precommit && (precommit.includes('secretlint') || precommit.includes('lint-staged'));
  checkResult(hasSecretlint, '.husky/pre-commit に secretlint/lint-staged' + (hasSecretlint ? ' あり' : ' が含まれていません'));
} else {
  checkResult(false, '.husky/pre-commit — 存在チェックが ❌ のためスキップ', 'skip');
}

console.log('');

// ===========================
// 動作チェック
// ===========================
console.log('[動作チェック]');

// 8. secretlint
const secretlintVersion = execCommand('npx secretlint --version');
if (secretlintVersion) {
  checkResult(true, `secretlint ${secretlintVersion}`);
} else {
  checkResult(false, 'secretlint — コマンドが見つかりません');
}

// 9. lint-staged
const lintStagedVersion = execCommand('npx lint-staged --version');
if (lintStagedVersion) {
  checkResult(true, `lint-staged ${lintStagedVersion}`);
} else {
  checkResult(false, 'lint-staged — コマンドが見つかりません');
}

// 10. gitleaks バイナリ
const isWindows = process.platform === 'win32';
const binaryName = isWindows ? 'gitleaks.exe' : 'gitleaks';
const localBinary = path.join(process.cwd(), 'bin', binaryName);

let gitleaksVersion = null;
if (fs.existsSync(localBinary)) {
  gitleaksVersion = execCommand(`"${localBinary}" version`);
} else {
  gitleaksVersion = execCommand('gitleaks version');
}

if (gitleaksVersion) {
  checkResult(true, `gitleaks ${gitleaksVersion}`);
} else {
  checkResult(false, 'gitleaks — 見つかりません（node scripts/install-gitleaks.js で導入可能）', 'warning');
}

console.log('');

// ===========================
// 結果サマリー
// ===========================
console.log('================================');
console.log(`結果: ${results.passed}/10 passed, ${results.failed} failed, ${results.warning} warning${results.skipped > 0 ? `, ${results.skipped} skipped` : ''}`);

if (results.failed > 0) {
  console.log('\n❌ ヘルスチェックに問題があります。まず設定を修正してください。');
  process.exit(1);
}

console.log('\n✅ ヘルスチェック完了');

// ===========================
// テストラン（--test-run フラグ時のみ）
// ===========================
if (testRun) {
  console.log('\n🧪 実際のスキャンをテスト実行します...\n');

  const testResults = {
    secretlint: { passed: false, output: '' },
    gitleaks: { passed: false, output: '' }
  };

  // secretlint テスト
  console.log('[secretlint テスト]');
  console.log('  npx secretlint "**/*"');
  try {
    const output = execSync('npx secretlint "**/*"', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    testResults.secretlint.passed = true;
    testResults.secretlint.output = output;
    console.log('  → ✅ 0 件検出');
  } catch (e) {
    const output = e.stdout || e.stderr || e.message;
    testResults.secretlint.output = output;

    // Parse secretlint output to count errors
    const lines = output.split('\n');
    const errorCount = lines.filter(line => line.includes('Error:')).length;

    if (errorCount > 0) {
      console.log(`  → ⚠️  ${errorCount} 件検出`);
      console.log('\n  検出内容:');
      console.log(output.split('\n').slice(0, 20).map(l => '    ' + l).join('\n'));
      if (lines.length > 20) {
        console.log('    ...(残り省略)');
      }
    } else {
      console.log('  → ✅ 0 件検出');
      testResults.secretlint.passed = true;
    }
  }

  console.log('');

  // gitleaks テスト（バイナリがある場合のみ）
  if (gitleaksVersion) {
    console.log('[gitleaks テスト]');

    const gitleaksCmd = fs.existsSync(localBinary)
      ? `"${localBinary}" detect --source . -v --config gitleaks.toml`
      : 'gitleaks detect --source . -v --config gitleaks.toml';

    console.log(`  ${gitleaksCmd}`);

    try {
      const output = execSync(gitleaksCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      testResults.gitleaks.passed = true;
      testResults.gitleaks.output = output;
      console.log('  → ✅ 0 件検出');
    } catch (e) {
      const output = e.stdout || e.stderr || e.message;
      testResults.gitleaks.output = output;

      // Check if it's actually a detection (exit code 1) vs error
      if (e.status === 1 && output.includes('Finding:')) {
        const findings = (output.match(/Finding:/g) || []).length;
        console.log(`  → ⚠️  ${findings} 件検出`);
        console.log('\n  検出内容:');
        console.log(output.split('\n').slice(0, 30).map(l => '    ' + l).join('\n'));
        if (output.split('\n').length > 30) {
          console.log('    ...(残り省略)');
        }
      } else {
        console.log('  → ✅ 0 件検出');
        testResults.gitleaks.passed = true;
      }
    }
  } else {
    console.log('[gitleaks テスト]');
    console.log('  ⏭️  gitleaks が未導入のためスキップ');
  }

  console.log('\n================================');

  // テストラン結果サマリー
  const secretlintOk = testResults.secretlint.passed;
  const gitleaksOk = !gitleaksVersion || testResults.gitleaks.passed;

  if (secretlintOk && gitleaksOk) {
    console.log('テスト結果: ✅ 問題なし');
    process.exit(0);
  } else {
    console.log('テスト結果: ⚠️  要確認（上記の検出内容を AI に報告してください）');
    process.exit(0);
  }
} else {
  // 通常モード（--test-run なし）
  if (results.warning > 0) {
    console.log('\n⚠️  gitleaks が未導入です。secretlint のみで最低限は守られています。');
  }
  process.exit(0);
}
