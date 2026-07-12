#!/usr/bin/env node

// setup-securecheck の単一エントリポイント。
// package.json 側は `"security": "node .security-check/cli.js"` の1行のみを持ち、
// git hook も `node .security-check/cli.js pre-commit` を直接呼ぶ。
// サブコマンドの実装は lib/ 配下に集約し、ここでは振り分けと exit code の一元管理のみ行う。

const SUBCOMMANDS = {
  'pre-commit': () => require('./lib/pre-commit').run(),
  'verify': (args) => require('./lib/verify').run(args),
  'install-gitleaks': () => require('./lib/install-gitleaks').run(),
  'uninstall': (args) => require('./lib/uninstall').run(args),
};

function printHelp() {
  console.log('setup-securecheck CLI');
  console.log('');
  console.log('使い方: node .security-check/cli.js <subcommand> [options]');
  console.log('');
  console.log('subcommands:');
  console.log('  verify [--simple|--test-run]   ヘルスチェック（--simpleはstagedのみ、--test-runは全ファイル+全履歴のスキャンも実行）');
  console.log('  pre-commit                     git pre-commit フックの実体（通常は直接叩かず simple-git-hooks 経由で呼ばれる）');
  console.log('  install-gitleaks               gitleaksバイナリを .security-check/bin/ に導入');
  console.log('  uninstall [--yes]              このパターンの導入物を除去（--yes無しはドライラン）');
}

const [sub, ...rest] = process.argv.slice(2);

if (!sub || sub === '--help' || sub === '-h') {
  printHelp();
  process.exit(sub ? 0 : 1);
}

if (!SUBCOMMANDS[sub]) {
  console.error(`❌ 不明なサブコマンドです: ${sub}\n`);
  printHelp();
  process.exit(1);
}

Promise.resolve(SUBCOMMANDS[sub](rest))
  .then((code) => process.exit(typeof code === 'number' ? code : 0))
  .catch((e) => {
    console.error(e && e.stack ? e.stack : e);
    process.exit(1);
  });
