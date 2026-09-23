#!/usr/bin/env node

// docs-structure 単体の、既存プロジェクトへの安全マージ用インストーラー。
// package.json や git には一切依存しない（docs-structure は Node.js の fs 操作だけで完結する）。
//
// 使い方:
//   npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure ./tmp/docs-structure-install --force
//   node ./tmp/docs-structure-install/install.js
//   rm -rf ./tmp/docs-structure-install

const fs = require('fs');
const path = require('path');

// コピー元は degit で自分（install.js）と一緒に取得された templates/ を使う。
// process.cwd() 基準ではなく __dirname 基準にすることで、
// このスクリプトがどこから呼ばれても「隣にある templates/」を正しく指せる。
const SRC_DIR = path.join(__dirname, 'templates');
const DEST_DIR = path.join(process.cwd(), 'docs');

console.log('docs-structure install');
console.log('=======================\n');

if (!fs.existsSync(SRC_DIR)) {
  console.error(`❌ テンプレートが見つかりません: ${SRC_DIR}`);
  console.error('   install.js は templates/ と同じディレクトリに置かれている必要があります。');
  console.error('   degit で patterns/docs-structure ごと取得できているか確認してください。');
  process.exit(1);
}

// cwd 事故対策: 何かを書く前に、配置先の絶対パスを必ず出力する。
// install.js は一時取得されて1回実行されたら消える性質のスクリプトなので、
// setup-securecheck の cli.js のような「本来あるべき相対位置との比較」による
// cwd ガードは使えない（そもそも比較対象の「あるべき位置」が無い）。
// 代わりに、解決後の絶対パスを目立つ形で見せて、想定通りの場所か判断できるようにする。
console.log(`コピー元: ${SRC_DIR}`);
console.log(`配置先:   ${DEST_DIR}\n`);

const destExistedBefore = fs.existsSync(DEST_DIR);

// ファイル単位で差分コピーする（既存ファイルは絶対に上書きしない）。
// ディレクトリの存在だけで判定すると、mkdir 直後・コピー前にプロセスが中断された場合に
// 空ディレクトリが「導入済み」と誤判定され、二度と補完されなくなる穴ができるため、
// 常にこの関数で1ファイルずつ確認する（新規・中断からの再開を同じロジックで自然にカバーする）。
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
      console.log(`  SKIP   ${path.relative(process.cwd(), d)}（既に存在）`);
    } else {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
      created++;
      console.log(`  CREATE ${path.relative(process.cwd(), d)}`);
    }
  }
  return created;
}

fs.mkdirSync(DEST_DIR, { recursive: true });
const createdCount = copyRecursiveSkipExisting(SRC_DIR, DEST_DIR);

console.log('');
if (createdCount === 0 && destExistedBefore) {
  // 既存ファイルが機能的に足りていて何も作られなかった場合、
  // それは「最新版と同一」なのか「古いバージョンのまま」なのかをこのスクリプトは判定できない。
  // 判断が要るケースなので、確定的な処理はここで止め、判断層ウィザードへ誘導する。
  console.log('既存のファイルが見つかりました（今回新しく作成したファイルはありません）。');
  console.log('バージョンが古いままの可能性があります。最新版に更新したい場合は、');
  console.log('patterns/docs-structure/README.md の「既存の docs-structure を最新版に更新する場合」の指示を使ってください。');
} else if (!destExistedBefore) {
  console.log(`✅ 新規に ${createdCount} ファイルを作成しました。`);
} else {
  console.log(`✅ 中断された導入の再開として、不足していた ${createdCount} ファイルを補完しました。`);
}
