// 「かぶせ」層（マシンごと・cloneごとに再構築が必要な、gitignore領域の状態を作る）を
// まとめて実行するサブコマンド。手順書のPhase3のうち3.1・3.3〜3.6に相当する。
// package.jsonのsimple-git-hooks設定自体のマージ（3.2）は判断層のまま残し、
// ここでは「設定が既に正しく書かれている前提」でフックを有効化するだけに留める。

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { readJson, BIN_DIR, GITLEAKS_BINARY_NAME } = require('./environment');

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');
const GITIGNORE_PATH = path.join(process.cwd(), '.gitignore');
const GITLEAKS_BIN_PATH = path.join(BIN_DIR, GITLEAKS_BINARY_NAME);
const GITLEAKS_BIN_BAK_PATH = `${GITLEAKS_BIN_PATH}.bak`;

// setup-securecheck.md 3.5.5-a/bのネガティブテストが使うファイル名（pre-commit.jsのCANARY_FILENAMEと同じ値）。
const CANARY_FILENAME = '.test-secret-canary';
// allowlistのregexes（xxxxxx等）に一致しない合成値。verify.js/pre-commit.jsの自動カナリアと同じ値を再利用する。
const CANARY_SECRET = 'ghp_A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8'; // gitleaks:allow secretlint-disable-line

// templates/gitignore.example と同じ内容。setup-local.js はプロジェクトへ配置された後は
// 元のパターンリポジトリ側 templates/ を参照できないため、内容をここに直接持つ。
const GITIGNORE_BLOCK =
  '# setup-securecheck: gitleaksバイナリ・実行ログ（ローカル専用、リポジトリに含めない）\n' +
  '.security-check/bin/\n' +
  '.security-check/logs/\n';

function hasDependency(pkg, name) {
  return !!(
    pkg &&
    ((pkg.devDependencies && pkg.devDependencies[name]) || (pkg.dependencies && pkg.dependencies[name]))
  );
}

// setup-all.js（docs-structure-and-securitycheck側）の同名関数・verify.js check#5と判定基準を揃える。
// requireでの共有はできない（別パターン／別実行文脈）ため実装をコピーしている。
function isEffectivelyCorrectPreCommitValue(value) {
  return !!value && /\.security-check\/cli\.js/.test(value) && !/\|\|\s*true/.test(value);
}

function step(title) {
  console.log(`\n--- ${title} ---`);
}

function installSimpleGitHooksIfMissing(pkg) {
  step('1. simple-git-hooks インストール');
  if (hasDependency(pkg, 'simple-git-hooks')) {
    console.log('  SKIP   simple-git-hooks（既にdevDependenciesに存在）');
    return true;
  }
  try {
    execSync('npm install -D simple-git-hooks', { stdio: 'pipe', encoding: 'utf8' });
    console.log('  CREATE simple-git-hooks（devDependencies）');
    return true;
  } catch (e) {
    console.error('  ❌ simple-git-hooks のインストールに失敗しました');
    const detail = (e.stderr || e.stdout || e.message || '').toString().trim();
    if (detail) detail.split('\n').forEach((l) => console.error(`    ${l}`));
    return false;
  }
}

function checkPreCommitPrerequisite() {
  step('2. 前提チェック（package.json の simple-git-hooks.pre-commit）');
  const pkg = readJson(PACKAGE_JSON_PATH);
  const value = pkg && pkg['simple-git-hooks'] && pkg['simple-git-hooks']['pre-commit'];
  if (isEffectivelyCorrectPreCommitValue(value)) {
    console.log(`  ✅ 設定済み: ${value}`);
    return true;
  }
  console.error('  ❌ package.json の simple-git-hooks.pre-commit が正しく設定されていません');
  console.error(`    現在の値: ${value ? JSON.stringify(value) : '(未設定)'}`);
  console.error('    以下を package.json に追加してから再実行してください:');
  console.error('      "simple-git-hooks": {');
  console.error('        "pre-commit": "node .security-check/cli.js pre-commit"');
  console.error('      }');
  return false;
}

function enableHooks() {
  step('3. フック有効化（npx simple-git-hooks）');
  try {
    execSync('npx simple-git-hooks', { stdio: 'pipe', encoding: 'utf8' });
    console.log('  ✅ 有効化しました');
    return true;
  } catch (e) {
    console.error('  ❌ npx simple-git-hooks の実行に失敗しました');
    const detail = (e.stderr || e.stdout || e.message || '').toString().trim();
    if (detail) detail.split('\n').forEach((l) => console.error(`    ${l}`));
    return false;
  }
}

function updateGitignore() {
  step('4. .gitignore 更新');
  const current = fs.existsSync(GITIGNORE_PATH) ? fs.readFileSync(GITIGNORE_PATH, 'utf8') : '';
  if (current.includes('.security-check/bin/') && current.includes('.security-check/logs/')) {
    console.log('  SKIP   .gitignore（既に追記済み）');
    return true;
  }
  const separator = current.length === 0 ? '' : current.endsWith('\n') ? '\n' : '\n\n';
  fs.writeFileSync(GITIGNORE_PATH, current + separator + GITIGNORE_BLOCK);
  console.log('  CREATE .gitignore に追記しました');
  return true;
}

// 3.5.5-c相当。gitleaksバイナリを退避して本当にブロックされるかを確認する。
// 元々バイナリが無い状態であれば退避自体をスキップし、その場でpre-commitを実行する。
function checkFailClose() {
  step('5. フェイルクローズ確認（gitleaks不在時に本当にブロックされるか）');
  const alreadyMissing = !fs.existsSync(GITLEAKS_BIN_PATH);
  if (!alreadyMissing) {
    fs.renameSync(GITLEAKS_BIN_PATH, GITLEAKS_BIN_BAK_PATH);
  }
  try {
    execSync('node .security-check/cli.js pre-commit', { stdio: 'pipe', encoding: 'utf8' });
    console.error('  ❌ gitleaks不在でもコミットがブロックされませんでした（フェイルクローズが機能していません）');
    return false;
  } catch (e) {
    const output = (e.stdout || '') + (e.stderr || '');
    if (/フェイルクローズ方針によりコミットをブロックします/.test(output)) {
      console.log('  ✅ gitleaks不在時にフェイルクローズでブロックされることを確認');
      return true;
    }
    console.error('  ❌ ブロックされましたが、想定と異なる理由でした（詳細は下記の出力を確認してください）');
    console.error(output.split('\n').map((l) => '    ' + l).join('\n'));
    return false;
  } finally {
    if (!alreadyMissing) {
      fs.renameSync(GITLEAKS_BIN_BAK_PATH, GITLEAKS_BIN_PATH);
    }
  }
}

// 3.5.5-a/b相当。この呼び出しが直近のpre-commit.logエントリになるよう、
// フェイルクローズ確認より後・verifyより前に実行する（検出器が生きている状態の
// 呼び出しを最後にすることで、次のverify check#15が健全な状態を見るようにするため）。
function runNegativeTests() {
  step('6. ネガティブテスト（フックが実際にブロックするか確認）');
  const canaryPath = path.join(process.cwd(), CANARY_FILENAME);
  try {
    fs.writeFileSync(canaryPath, `TEST_TOKEN=${CANARY_SECRET}\n`);
    execSync(`git add ${CANARY_FILENAME}`, { stdio: 'pipe', encoding: 'utf8' });

    try {
      execSync('git commit -m "test: setup-local negative test (should be blocked)"', { stdio: 'pipe', encoding: 'utf8' });
    } catch (e) {
      const output = (e.stdout || '') + (e.stderr || '');

      if (!/=== secretlint ===/.test(output) || !/=== gitleaks ===/.test(output)) {
        console.error('  ❌ ブロックされましたが、secretlint/gitleaks 両セクションの出力を確認できませんでした');
        console.error(output.split('\n').map((l) => '    ' + l).join('\n'));
        return false;
      }
      console.log('  ✅ pre-commit フック全体でブロックされることを確認（secretlint/gitleaks 両方実行）');

      try {
        execSync('.security-check/bin/gitleaks git --staged --config gitleaks.toml --redact .', { stdio: 'pipe', encoding: 'utf8' });
        console.error('  ❌ gitleaks 単独チェックが exit code 0 でした（検出できていません）');
        return false;
      } catch (e2) {
        if (e2.status !== 1) {
          console.error(`  ❌ gitleaks 単独チェックが想定外の exit code でした: ${e2.status}`);
          return false;
        }
        console.log('  ✅ gitleaks 単独でも検出できることを確認（exit code 1）');
        return true;
      }
    }

    // ここに到達 = git commit が例外を投げなかった = ブロックされずコミットが成立してしまった
    console.error('  ❌ pre-commit フックでカナリアがブロックされず、コミットが成立してしまいました');
    try {
      // 直前がリポジトリ最初のコミットだった場合 HEAD~1 が存在せず git reset HEAD~1 は失敗するため、
      // 親コミットの有無で分岐する（新規プロジェクト＝初回コミット前の状態で発生しうる）。
      execSync('git rev-parse --verify -q HEAD~1', { stdio: 'pipe' });
      execSync('git reset HEAD~1', { stdio: 'pipe' });
    } catch (e3) {
      try { execSync('git update-ref -d HEAD', { stdio: 'pipe' }); } catch (e4) { /* ignore */ }
    }
    return false;
  } finally {
    // git restore --staged はHEADの解決を必要とし、初回コミット前（新規プロジェクト）の
    // リポジトリでは "fatal: could not resolve HEAD" で失敗する。git rm --cached はHEAD不要。
    try { execSync(`git rm --cached --ignore-unmatch ${CANARY_FILENAME}`, { stdio: 'pipe' }); } catch (e) { /* ignore */ }
    try { fs.rmSync(canaryPath, { force: true }); } catch (e) { /* ignore */ }
  }
}

function runFinalVerify() {
  step('7. 最終確認（verify --test-run）');
  try {
    execSync('node .security-check/cli.js verify --test-run', { stdio: 'inherit' });
    return true;
  } catch (e) {
    console.error('  ❌ verify --test-run が失敗しました（詳細は上記出力を参照）');
    return false;
  }
}

function run() {
  console.log('🔧 setup-local — ローカル環境のセットアップ（フック配線・動作確認）');

  const pkg = readJson(PACKAGE_JSON_PATH);
  if (!pkg) {
    console.error('❌ package.json が見つからないか解析できません');
    return 1;
  }

  if (!installSimpleGitHooksIfMissing(pkg)) return 1;
  if (!checkPreCommitPrerequisite()) return 1;
  if (!enableHooks()) return 1;
  if (!updateGitignore()) return 1;
  if (!checkFailClose()) return 1;
  if (!runNegativeTests()) return 1;
  if (!runFinalVerify()) return 1;

  console.log('\n✅ setup-local 完了');
  return 0;
}

module.exports = { run };
