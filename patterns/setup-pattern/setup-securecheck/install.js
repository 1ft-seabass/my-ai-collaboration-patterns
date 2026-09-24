#!/usr/bin/env node

// setup-securecheck 単体の、既存プロジェクトへの安全マージ用インストーラー。
// 手順書のPhase1.1(テンプレ配置)・1.2(secretlint導入)・1.4(gitleaks導入)をまとめて行う。
// package.jsonのマージ判断(2.1/3.2)・スキャン結果の解釈(1.3/1.5)・hook配線以降(setup-local)は
// このスクリプトの範囲外（判断層／別サブコマンドのまま）。
//
// 使い方:
//   npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck ./tmp/securecheck-install --force
//   node ./tmp/securecheck-install/install.js
//   rm -rf ./tmp/securecheck-install

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// コピー元は degit で自分(install.js)と一緒に取得された templates/ を使う。
// process.cwd() ではなく __dirname 基準にすることで、どこから呼ばれても
// 「隣にある templates/」を正しく指せる（docs-structureのinstall.jsと同じ設計）。
const SRC_DIR = path.join(__dirname, 'templates');
const DEST_DIR = process.cwd();

console.log('setup-securecheck install');
console.log('==========================\n');

if (!fs.existsSync(SRC_DIR)) {
  console.error(`❌ テンプレートが見つかりません: ${SRC_DIR}`);
  console.error('   install.js は templates/ と同じディレクトリに置かれている必要があります。');
  console.error('   degit で patterns/setup-pattern/setup-securecheck ごと取得できているか確認してください。');
  process.exit(1);
}

// cwd事故対策: 何かを書く前に配置先の絶対パスを出力する（docs-structureのinstall.jsと同じ理由）。
console.log(`コピー元: ${SRC_DIR}`);
console.log(`配置先:   ${DEST_DIR}\n`);

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

function hasDependency(pkg, name) {
  return !!(
    pkg &&
    ((pkg.devDependencies && pkg.devDependencies[name]) || (pkg.dependencies && pkg.dependencies[name]))
  );
}

function runOrAbort(command, friendlyMessage) {
  try {
    execSync(command, { stdio: 'pipe', encoding: 'utf8', cwd: DEST_DIR });
  } catch (e) {
    const detail = (e.stderr || e.stdout || e.message || '').toString().trim();
    console.error(`❌ ${friendlyMessage}`);
    console.error(`   コマンド: ${command}`);
    if (detail) {
      console.error('   実際のエラー:');
      detail.split('\n').forEach((l) => console.error(`     ${l}`));
    }
    process.exit(1);
  }
}

// ファイル単位で差分コピーする（既存ファイルは絶対に上書きしない）。
// 新規導入と中断からの再開を同一ロジックで自然にカバーする（docs-structureのinstall.jsと同じアルゴリズム）。
function copyRecursiveSkipExisting(srcDir, destDir) {
  let created = 0;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(srcDir, entry.name);
    const d = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      created += copyRecursiveSkipExisting(s, d);
    } else if (fs.existsSync(d)) {
      console.log(`  SKIP   ${path.relative(DEST_DIR, d)}（既に存在）`);
    } else {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
      created++;
      console.log(`  CREATE ${path.relative(DEST_DIR, d)}`);
    }
  }
  return created;
}

function copyFileSkipExisting(relFile) {
  const s = path.join(SRC_DIR, relFile);
  const d = path.join(DEST_DIR, relFile);
  if (fs.existsSync(d)) {
    console.log(`  SKIP   ${relFile}（既に存在）`);
    return 0;
  }
  fs.mkdirSync(path.dirname(d), { recursive: true });
  fs.copyFileSync(s, d);
  console.log(`  CREATE ${relFile}`);
  return 1;
}

async function main() {
  console.log('--- ファイル配置 ---');
  let createdCount = 0;
  createdCount += copyFileSkipExisting('.secretlintrc.json');
  createdCount += copyFileSkipExisting('gitleaks.toml');
  createdCount += copyRecursiveSkipExisting(path.join(SRC_DIR, '.security-check'), path.join(DEST_DIR, '.security-check'));

  console.log('\n--- package.json ---');
  const pkgPath = path.join(DEST_DIR, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    runOrAbort('npm init -y', 'package.json の作成に失敗しました。');
    console.log('  CREATE package.json（npm init -y）');
  } else {
    console.log('  SKIP   package.json（既に存在）');
  }

  console.log('\n--- secretlint ---');
  const pkg = readJson(pkgPath);
  if (!hasDependency(pkg, 'secretlint') || !hasDependency(pkg, '@secretlint/secretlint-rule-preset-recommend')) {
    runOrAbort(
      'npm install -D secretlint @secretlint/secretlint-rule-preset-recommend',
      'secretlint のインストールに失敗しました。'
    );
    console.log('  CREATE secretlint / @secretlint/secretlint-rule-preset-recommend（devDependencies）');
  } else {
    console.log('  SKIP   secretlint（既にdevDependenciesに存在）');
  }

  console.log('\n--- gitleaksバイナリ ---');
  // 配置したばかりの install-gitleaks.js をそのまま呼び出す（車輪の再発明をしない）。
  // 内部で process.cwd() を基準に .security-check/bin/ を解決するため、DEST_DIR で実行する限り
  // templates/ 側・DEST_DIR 側どちらの実体を require しても同じ結果になるが、
  // 「実際に配置された版」を使う意味で DEST_DIR 側を require する。
  const installGitleaksPath = path.join(DEST_DIR, '.security-check', 'lib', 'install-gitleaks.js');
  const installGitleaks = require(installGitleaksPath);
  const gitleaksExitCode = await Promise.resolve(installGitleaks.run());
  if (gitleaksExitCode !== 0) {
    console.error('\n❌ gitleaks のインストールに失敗しました（詳細は上記ログ参照）。');
    process.exit(1);
  }

  console.log(`\n✅ 完了（新規作成 ${createdCount} 件）。`);
  console.log('\n次のステップ:');
  console.log('  1. package.json の scripts / simple-git-hooks 設定をマージしてください（templates/package.json.example 参照）');
  console.log('  2. node .security-check/cli.js scan --all でスキャン結果を確認してください');
  console.log('  3. node .security-check/cli.js setup-local でフック配線・ネガティブテストまで進めてください');
}

main();
