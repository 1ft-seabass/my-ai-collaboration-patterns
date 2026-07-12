#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const cwd = process.cwd();

function fileExists(p) {
  return fs.existsSync(path.join(cwd, p));
}

function readFile(p) {
  try {
    return fs.readFileSync(path.join(cwd, p), 'utf8');
  } catch (e) {
    return null;
  }
}

function readJson(p) {
  const content = readFile(p);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

console.log('🔍 setup-securecheck バージョン検出');
console.log('=====================================\n');

const pkg = readJson('package.json');
const preCommitJs = readFile('scripts/pre-commit.js');

const hasHusky = !!(
  pkg && (
    (pkg.devDependencies && pkg.devDependencies['husky']) ||
    (pkg.dependencies && pkg.dependencies['husky'])
  )
);
const hasLintStaged = !!(
  pkg && (
    (pkg.devDependencies && pkg.devDependencies['lint-staged']) ||
    (pkg.dependencies && pkg.dependencies['lint-staged']) ||
    pkg['lint-staged']
  )
);
const huskyDirExists = fileExists('.husky');

const hasSimpleGitHooks = !!(
  pkg && (
    (pkg.devDependencies && pkg.devDependencies['simple-git-hooks']) ||
    (pkg.dependencies && pkg.dependencies['simple-git-hooks']) ||
    pkg['simple-git-hooks']
  )
);

const hookConfig = pkg && pkg['simple-git-hooks'] && pkg['simple-git-hooks']['pre-commit'];
const hookPointsToCli = !!(hookConfig && /\.security-check\/cli\.js/.test(hookConfig));
const securityCheckDirExists = fileExists('.security-check/cli.js');

const preCommitHasFullScan = !!(preCommitJs && preCommitJs.includes('secretlint "**/*"'));
const preCommitHasStagedOnly = !!(preCommitJs && preCommitJs.includes('git diff --cached'));

let version, reason, nextStep;

if (hasHusky || hasLintStaged || huskyDirExists) {
  version = 'v1';
  const reasons = [];
  if (hasHusky) reasons.push('husky が devDependencies に存在');
  if (hasLintStaged) reasons.push('lint-staged が devDependencies/設定に存在');
  if (huskyDirExists) reasons.push('.husky/ ディレクトリが存在');
  reason = reasons.join(' / ');
  nextStep = 'MIGRATION_GUIDE_v1_to_v2.0.1.md';
} else if (securityCheckDirExists && hookPointsToCli) {
  version = 'v3.0.0';
  reason = '.security-check/cli.js あり / simple-git-hooks が .security-check/cli.js pre-commit を指している';
  nextStep = 'none';
} else if (hasSimpleGitHooks && (fileExists('scripts/pre-commit.js') || preCommitHasStagedOnly || preCommitHasFullScan)) {
  version = 'v2.x（旧 scripts/ レイアウト）';
  reason = 'simple-git-hooks あり / scripts/pre-commit.js を直接呼ぶ旧レイアウトを検出（.security-check/ 未導入）';
  nextStep = 'MIGRATION_GUIDE_v2.1.0_to_v3.0.0.md';
} else if (hasSimpleGitHooks) {
  version = 'v2.x-unknown';
  reason = 'simple-git-hooks あり / pre-commit の実体が想定外（カスタム変更の可能性）';
  nextStep = 'manual';
} else {
  version = 'unknown';
  reason = pkg
    ? 'package.json はあるが husky / simple-git-hooks のどちらも検出できず'
    : 'package.json が見つかりません';
  nextStep = 'setup-securecheck.md';
}

console.log(`検出バージョン : ${version}`);
console.log(`判定根拠       : ${reason}`);
console.log(`次のステップ   : ${nextStep}`);
console.log('\n=====================================');
