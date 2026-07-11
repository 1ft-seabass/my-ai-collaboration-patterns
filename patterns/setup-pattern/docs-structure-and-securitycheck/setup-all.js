#!/usr/bin/env node

// docs-structure + setup-securecheck 統合インストーラー
//
// 使い方:
//   npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/docs-structure-and-securitycheck ./tmp/setup-all
//   node ./tmp/setup-all/setup-all.js
//
// フラグ:
//   --strict    package.json が無い場合、npm init -y せず中断する
//   --no-hooks  pre-commit 自動化（Phase 3 相当）をスキップする

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cwd = process.cwd();
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const noHooks = args.includes('--no-hooks');

const REPO = '1ft-seabass/my-ai-collaboration-patterns';
const DOCS_STRUCTURE_SRC = `${REPO}/patterns/docs-structure/templates`;
const SECURECHECK_SRC = `${REPO}/patterns/setup-pattern/setup-securecheck/templates`;
const MIGRATION_SRC = `${REPO}/patterns/setup-pattern/setup-securecheck/migration`;
const FETCH_DIR = path.join(cwd, 'tmp', 'setup-all-fetch');
const LOG_FILE = path.join(cwd, '.logs', 'setup-all.log');

console.log('🚀 docs-structure-and-securitycheck 統合インストーラー');
console.log('=====================================\n');

// ===========================
// ログ記録
// ===========================
const logEntries = [];
let currentSection = '';

function section(name) {
  currentSection = name;
  console.log(`\n[${name}]`);
}

function record(category, message) {
  logEntries.push({ section: currentSection, category, message });
  console.log(`  ${category.padEnd(6)} ${message}`);
}

function writeLog() {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const sections = [...new Set(logEntries.map((e) => e.section))];
  const lines = [];
  for (const s of sections) {
    lines.push(`[${s}]`);
    for (const e of logEntries.filter((x) => x.section === s)) {
      lines.push(`  ${e.category.padEnd(6)}  ${e.message}`);
    }
    lines.push('');
  }
  fs.writeFileSync(LOG_FILE, lines.join('\n').trimEnd() + '\n');
}

function abort(message) {
  console.error(`\n❌ ${message}`);
  writeLog();
  cleanupFetchDir();
  process.exit(1);
}

// ===========================
// ファイル操作ヘルパー
// ===========================
function fileExists(relPath) {
  return fs.existsSync(path.join(cwd, relPath));
}

function readFile(relPath) {
  try {
    return fs.readFileSync(path.join(cwd, relPath), 'utf8');
  } catch (e) {
    return null;
  }
}

function readJson(relPath) {
  const content = readFile(relPath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

function writeJson(relPath, data) {
  fs.writeFileSync(path.join(cwd, relPath), JSON.stringify(data, null, 2) + '\n');
}

// git worktree では .git がディレクトリではなく gitdir ポインタファイルになり、
// hooks は全 worktree で共有される実体を指すため、決め打ちパスでは常に「存在しない」
// と誤判定する。git 自身に解決させる（フォールバックは非 git 環境向け）。
function resolveGitHookPath(hookName) {
  let resolved;
  try {
    resolved = execSync(`git rev-parse --git-path hooks/${hookName}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    resolved = null;
  }
  if (resolved) {
    return path.isAbsolute(resolved) ? resolved : path.join(cwd, resolved);
  }
  return path.join(cwd, '.git', 'hooks', hookName);
}

// simple-git-hooks.pre-commit が「実質的に正しいか」の判定。security-verify.js の
// check#8 と基準を揃える: pre-commit.js を呼んでおり、exit code を || true 等で
// 握りつぶしていなければ良しとする。文字列の完全一致を要求すると、複数 worktree で
// hooks を共有し一部の worktree にしか scripts/pre-commit.js が無い構成で使われる
// 存在ガード（`if [ -f scripts/pre-commit.js ]; then node scripts/pre-commit.js; fi`）
// を「不正な値」として上書きしてしまい、導入済みの worktree でコミットが失敗する。
function isEffectivelyCorrectPreCommitValue(value) {
  return !!value && value.includes('pre-commit.js') && !/\|\|\s*true/.test(value);
}

function hasDependency(pkg, name) {
  return !!(
    pkg &&
    ((pkg.devDependencies && pkg.devDependencies[name]) ||
      (pkg.dependencies && pkg.dependencies[name]))
  );
}

function copyIfMissing(srcPath, destRelPath) {
  const destPath = path.join(cwd, destRelPath);
  if (fs.existsSync(destPath)) {
    record('SKIP', `${destRelPath}（既に存在）`);
    return false;
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(srcPath, destPath);
  record('CREATE', destRelPath);
  return true;
}

// ファイル単位で差分コピーする（既存ファイルはスキップ）。戻り値は実際にコピーしたファイル数。
// ディレクトリの存在だけで判定すると、mkdir 直後・コピー前にプロセスが中断された場合に
// 空ディレクトリが「導入済み」と誤判定され、二度と補完されなくなる穴ができるため、
// 常にこの関数で1ファイルずつ確認する（コンテナ単位の粗い判定はしない）。
function copyRecursiveSkipExisting(srcDir, destDir) {
  let created = 0;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(srcDir, entry.name);
    const d = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      created += copyRecursiveSkipExisting(s, d);
    } else if (!fs.existsSync(d)) {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
      created++;
    }
  }
  return created;
}

// コマンド失敗時、原因を決め打ちせず実際の stderr/stdout を abort メッセージに含める
// （例: 実際は package.json の JSON パースエラーなのに「ネットワーク接続を確認してください」
//   と誤誘導してしまうことを防ぐ）
function runOrAbort(command, friendlyMessage) {
  try {
    return execSync(command, { stdio: 'pipe', encoding: 'utf8' });
  } catch (e) {
    const detail = (e.stderr || e.stdout || e.message || '').toString().trim();
    const detailLines = detail ? detail.split('\n').map((l) => `     ${l}`).join('\n') : '     (詳細出力なし)';
    abort(`${friendlyMessage}\n   コマンド: ${command}\n   実際のエラー:\n${detailLines}`);
  }
}

function degitFetch(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  runOrAbort(
    `npx degit ${src} "${dest}" --force`,
    `degit 取得に失敗しました: ${src}\n   ネットワーク接続を確認するか、手動で以下を取得してください: npx degit ${src} ${dest}`
  );
}

function cleanupFetchDir() {
  if (fs.existsSync(FETCH_DIR)) {
    fs.rmSync(FETCH_DIR, { recursive: true, force: true });
  }
}

// ===========================
// Step 0: 前提条件の自動整備
// ===========================
section('前提条件');

if (!fileExists('.git')) {
  execSync('git init', { stdio: 'pipe' });
  record('CREATE', '.git（git init 実行）');
} else {
  record('SKIP', '.git（既に存在）');
}

if (!fileExists('package.json')) {
  if (strict) {
    abort('package.json が見つかりません（--strict 指定のため中断。npm init 等で作成してから再実行してください）');
  }
  execSync('npm init -y', { stdio: 'pipe' });
  record('CREATE', 'package.json（npm init -y 実行）');
} else {
  record('SKIP', 'package.json（既に存在）');
}

// version-detect/scripts/detect-version.js のロジックを再利用（二重実装を避ける）
function detectHookVersion() {
  const pkg = readJson('package.json');
  const preCommitJs = readFile('scripts/pre-commit.js');

  const hasHusky = !!(
    pkg &&
    ((pkg.devDependencies && pkg.devDependencies['husky']) ||
      (pkg.dependencies && pkg.dependencies['husky']))
  );
  const hasLintStaged = !!(
    pkg &&
    ((pkg.devDependencies && pkg.devDependencies['lint-staged']) ||
      (pkg.dependencies && pkg.dependencies['lint-staged']) ||
      pkg['lint-staged'])
  );
  const huskyDirExists = fileExists('.husky');
  const hasSimpleGitHooks = !!(
    pkg &&
    ((pkg.devDependencies && pkg.devDependencies['simple-git-hooks']) ||
      (pkg.dependencies && pkg.dependencies['simple-git-hooks']) ||
      pkg['simple-git-hooks'])
  );
  const preCommitHasFullScan = !!(preCommitJs && preCommitJs.includes('secretlint "**/*"'));
  const preCommitHasStagedOnly = !!(preCommitJs && preCommitJs.includes('git diff --cached'));

  if (hasHusky || hasLintStaged || huskyDirExists) return 'v1';
  if (hasSimpleGitHooks && preCommitHasStagedOnly) return 'v2.0.1';
  if (hasSimpleGitHooks && preCommitHasFullScan) return 'v2.0.0';
  if (hasSimpleGitHooks) return 'v2.x-unknown';
  return 'none';
}

const hookVersion = detectHookVersion();
console.log(`  検出された既存フック: ${hookVersion}`);

if (hookVersion === 'v1') {
  abort(
    'husky/lint-staged（v1）が検出されました。setup-all.js は v1 からの自動移行に対応していません。\n' +
      '   以下で移行ガイドを取得してから移行を進めてください:\n' +
      `   npx degit ${MIGRATION_SRC} ./tmp/securecheck-migration`
  );
}
if (hookVersion === 'v2.x-unknown') {
  console.log('  ⚠️  scripts/pre-commit.js の内容が想定外です（カスタム変更の可能性）。');
  console.log('     scripts/pre-commit.js 自体は上書きしません。setup-securecheck.md を参照して手動確認してください。');
}

// ===========================
// テンプレート取得（docs-structure / setup-securecheck）
// ===========================
section('テンプレート取得');
const docsStructureFetchDir = path.join(FETCH_DIR, 'docs-structure');
const securecheckFetchDir = path.join(FETCH_DIR, 'setup-securecheck');
degitFetch(DOCS_STRUCTURE_SRC, docsStructureFetchDir);
degitFetch(SECURECHECK_SRC, securecheckFetchDir);
record('CREATE', `${DOCS_STRUCTURE_SRC}, ${SECURECHECK_SRC} を一時取得`);

// ===========================
// docs-structure
// ===========================
section('docs-structure');
const docsExistedBefore = fileExists('docs');
const docsCreatedCount = copyRecursiveSkipExisting(docsStructureFetchDir, path.join(cwd, 'docs'));
if (docsCreatedCount === 0) {
  record('SKIP', 'docs/notes, docs/letters, docs/tasks, docs/actions（既に存在・不足ファイルなし）');
} else if (!docsExistedBefore) {
  record('CREATE', `docs/notes, docs/letters, docs/tasks, docs/actions（${docsCreatedCount} ファイル作成）`);
} else {
  record('MERGE', `docs/ の不足ファイルを ${docsCreatedCount} 件補完しました（中断されたセットアップの再実行など）`);
}

// ===========================
// secretlint / gitleaks 設定
// ===========================
section('secretlint / gitleaks 設定');
copyIfMissing(path.join(securecheckFetchDir, '.secretlintrc.json'), '.secretlintrc.json');
copyIfMissing(path.join(securecheckFetchDir, 'gitleaks.toml'), 'gitleaks.toml');

let pkg = readJson('package.json');
if (!hasDependency(pkg, 'secretlint') || !hasDependency(pkg, '@secretlint/secretlint-rule-preset-recommend')) {
  runOrAbort(
    'npm install -D secretlint @secretlint/secretlint-rule-preset-recommend',
    'secretlint のインストールに失敗しました。'
  );
  record('CREATE', 'secretlint / @secretlint/secretlint-rule-preset-recommend を devDependencies に追加');
} else {
  record('SKIP', 'secretlint（既に devDependencies に存在）');
}

// ===========================
// npm scripts
// ===========================
section('npm scripts');
pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
const REQUIRED_SCRIPTS = {
  'security:verify': 'node scripts/security-verify.js',
  'security:verify:simple': 'node scripts/security-verify.js --simple',
  'security:verify:testrun': 'node scripts/security-verify.js --test-run',
  'security:install-gitleaks': 'node scripts/install-gitleaks.js',
  'secret-scan': 'secretlint "**/*"',
  'secret-scan:full': 'secretlint "**/*" && ./bin/gitleaks detect --source . -v --config gitleaks.toml',
};
let scriptsChanged = false;
for (const [key, value] of Object.entries(REQUIRED_SCRIPTS)) {
  if (!pkg.scripts[key]) {
    pkg.scripts[key] = value;
    scriptsChanged = true;
  }
}
if (scriptsChanged) {
  writeJson('package.json', pkg);
  record('MERGE', 'package.json scripts に security:* / secret-scan:* を追加（既存キーは尊重）');
} else {
  record('SKIP', 'package.json scripts（必要なキーは既に存在）');
}

// ===========================
// scripts/*.js 配置
// ===========================
section('scripts配置');
copyIfMissing(path.join(securecheckFetchDir, 'scripts', 'security-verify.js'), 'scripts/security-verify.js');
copyIfMissing(path.join(securecheckFetchDir, 'scripts', 'install-gitleaks.js'), 'scripts/install-gitleaks.js');
if (!noHooks) {
  copyIfMissing(path.join(securecheckFetchDir, 'scripts', 'pre-commit.js'), 'scripts/pre-commit.js');
}

// ===========================
// gitleaks バイナリ
// ===========================
section('gitleaks バイナリ');
const isWindows = process.platform === 'win32';
const binaryName = isWindows ? 'gitleaks.exe' : 'gitleaks';
const binaryRelPath = path.join('bin', binaryName);
const binaryExistedBefore = fileExists(binaryRelPath);
let binaryWasValidBefore = false;
if (binaryExistedBefore) {
  try {
    execSync(`"${path.join(cwd, binaryRelPath)}" version`, { stdio: 'pipe' });
    binaryWasValidBefore = true;
  } catch (e) {
    binaryWasValidBefore = false;
  }
}

if (binaryExistedBefore && binaryWasValidBefore) {
  record('SKIP', `bin/${binaryName}（既にインストール済み・動作確認OK）`);
} else {
  // install-gitleaks.js は「存在するが実行できない」場合に自己修復（再インストール）する。
  // ここで存在チェックだけを見て呼び出しを省略すると、その自己修復ロジックを迂回してしまうため、
  // 壊れている可能性がある場合は必ず呼び出す。
  try {
    execSync('node scripts/install-gitleaks.js', { stdio: 'inherit' });
  } catch (e) {
    abort('gitleaks のインストールに失敗しました（原因は上記のログを参照）。手動インストールも可能です: https://github.com/gitleaks/gitleaks/releases');
  }
  if (!binaryExistedBefore) {
    record('CREATE', `bin/${binaryName}（gitleaks インストール）`);
  } else {
    record('FIXED', `bin/${binaryName} が壊れていて実行できなかったため再インストールしました`);
  }
}

// ===========================
// simple-git-hooks（pre-commit 自動化。--no-hooks で無効化可能）
// ===========================
section('simple-git-hooks');
if (noHooks) {
  record('SKIP', '--no-hooks 指定のため pre-commit 自動化をスキップ');
} else {
  pkg = readJson('package.json');

  if (!hasDependency(pkg, 'simple-git-hooks')) {
    runOrAbort('npm install -D simple-git-hooks', 'simple-git-hooks のインストールに失敗しました。');
    record('CREATE', 'simple-git-hooks を devDependencies に追加');
  } else {
    record('SKIP', 'simple-git-hooks（既に devDependencies に存在）');
  }

  // simple-git-hooks.pre-commit の値を検証する。完全一致ではなく実質判定
  // （isEffectivelyCorrectPreCommitValue）で見る理由は上記コメントを参照。
  pkg = readJson('package.json');
  const expectedPreCommit = 'node scripts/pre-commit.js';
  const currentPreCommit = pkg['simple-git-hooks'] && pkg['simple-git-hooks']['pre-commit'];
  if (!pkg['simple-git-hooks']) {
    pkg['simple-git-hooks'] = { 'pre-commit': expectedPreCommit };
    writeJson('package.json', pkg);
    record('CREATE', 'package.json simple-git-hooks.pre-commit を追加');
  } else if (!isEffectivelyCorrectPreCommitValue(currentPreCommit)) {
    pkg['simple-git-hooks']['pre-commit'] = expectedPreCommit;
    writeJson('package.json', pkg);
    record(
      'FIXED',
      `package.json simple-git-hooks.pre-commit が "${currentPreCommit}" だったため "${expectedPreCommit}" に修正しました`
    );
  } else {
    record('SKIP', `package.json simple-git-hooks.pre-commit（既に有効な値: "${currentPreCommit}"）`);
  }

  // postinstall は自由記述だが追加は安全。既存キーは尊重する
  pkg = readJson('package.json');
  pkg.scripts = pkg.scripts || {};
  if (!pkg.scripts.postinstall) {
    pkg.scripts.postinstall = 'npx simple-git-hooks';
    writeJson('package.json', pkg);
    record('MERGE', 'package.json scripts.postinstall を追加');
  } else if (!pkg.scripts.postinstall.includes('simple-git-hooks')) {
    record(
      'SKIP',
      `package.json scripts.postinstall は既存の値を尊重（"${pkg.scripts.postinstall}"） — npx simple-git-hooks の実行を手動で確認してください`
    );
  } else {
    record('SKIP', 'package.json scripts.postinstall（既に simple-git-hooks を含む）');
  }

  const hookFileExistedBefore = fs.existsSync(resolveGitHookPath('pre-commit'));
  execSync('npx simple-git-hooks', { stdio: 'inherit' });
  if (hookFileExistedBefore) {
    record('SKIP', '.git/hooks/pre-commit（既存フックを npx simple-git-hooks で再同期・変化なし）');
  } else {
    record('CREATE', '.git/hooks/pre-commit（npx simple-git-hooks 実行）');
  }
}

// ===========================
// .gitignore
// ===========================
section('.gitignore');
{
  const gitignorePath = path.join(cwd, '.gitignore');
  const content = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  const existingLines = content.split('\n').map((l) => l.trim());
  const requiredPatterns = ['bin/', '.logs/'];
  const missing = requiredPatterns.filter((p) => !existingLines.includes(p));

  if (missing.length === 0) {
    record('SKIP', '.gitignore（bin/, .logs/ は既に記載済み）');
  } else {
    const toAppend = [];
    if (missing.includes('bin/')) toAppend.push('', '# gitleaks binary (large binary file)', 'bin/');
    if (missing.includes('.logs/')) toAppend.push('', '# pre-commit 実行ログ（ローカル専用）', '.logs/');
    fs.writeFileSync(gitignorePath, content.replace(/\n?$/, '\n') + toAppend.join('\n') + '\n');
    record('MERGE', `.gitignore に ${missing.join(', ')} を追加`);
  }
}

// ===========================
// 完了
// ===========================
cleanupFetchDir();
writeLog();

console.log('\n=====================================');
console.log('✅ セットアップ完了');
console.log(`実行ログ: .logs/setup-all.log`);
console.log('\n次のステップ:');
console.log('  1. npm run secret-scan:full を実行してください');
console.log('     検出があれば setup-securecheck.md の「検出時の対応フロー」を参照して判断してください');
console.log('     （本物のシークレットかどうかの判断は人間が行う必要があります）');
if (!noHooks) {
  console.log('  2. シークレットを含むダミーコミットを試し、pre-commit フックが実際にブロックすることを確認してください（ネガティブテスト）');
}
