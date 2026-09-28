#!/usr/bin/env node

// docs-structure-for-branch: ブランチ専用ドキュメント構造の初期化。
// このパターンは「main/masterなら中断」「パスを機械的に書き換える」しか行わず、
// 人間の判断が必要な箇所が無いため、for_branch_init.md の手順を1スクリプトに集約した。
// テンプレートは自分のリポジトリ内に複製を持たず、実行のたびに docs-structure/templates を
// GitHubから直接degit取得する（唯一の正を一本化し、二重管理による乖離を防ぐため）。
//
// 使い方:
//   npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/docs-structure-for-branch ./tmp/docs-structure-for-branch --force
//   node ./tmp/docs-structure-for-branch/install.js
//   rm -rf ./tmp/docs-structure-for-branch

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DOCS_STRUCTURE_TEMPLATES_SRC = '1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure/templates';
const FETCH_DIR = path.join(process.cwd(), '.docs-structure-for-branch-fetch-tmp');
const ACTION_FILES = [
  'docs/actions/00_session_end.md',
  'docs/actions/doc_note.md',
  'docs/actions/doc_letter.md',
  'docs/actions/doc_note_and_commit.md',
];

// 途中でエラー終了しても、取得用の一時ディレクトリだけは必ず消す。
process.on('exit', () => {
  fs.rmSync(FETCH_DIR, { recursive: true, force: true });
});

console.log('docs-structure-for-branch install');
console.log('===================================\n');

function degitFetch(src, dest) {
  try {
    execSync(`npx degit ${src} "${dest}" --force`, { stdio: 'pipe' });
  } catch (e) {
    console.error(`❌ degit取得に失敗しました: ${src}`);
    console.error('   ネットワーク接続を確認するか、手動で以下を取得してください:');
    console.error(`   npx degit ${src} ${dest}`);
    process.exit(1);
  }
}

// docs-structure/install.js と同じロジック（既存ファイルは絶対に上書きしない）。
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

// --- 1. ブランチ名の取得とmain/masterガード（固定ルール、判断不要） ---
let branch;
try {
  branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
} catch (e) {
  console.error('❌ gitリポジトリではないか、ブランチを取得できませんでした。');
  process.exit(1);
}
if (!branch) {
  console.error('❌ 現在のブランチ名を取得できませんでした（detached HEAD等）。');
  process.exit(1);
}
if (branch === 'main' || branch === 'master') {
  console.error(`❌ 現在のブランチは「${branch}」です。main/masterブランチではブランチ専用構造を初期化しません。`);
  console.error('   featureブランチに切り替えてから再実行してください。');
  process.exit(1);
}
console.log(`ブランチ: ${branch}\n`);

// --- 2. docs-structure 導入確認・未導入なら導入 ---
console.log('--- 1. docs-structure 導入確認 ---');
const DOCS_DIR = path.join(process.cwd(), 'docs');
const DOCS_ACTIONS_DIR = path.join(DOCS_DIR, 'actions');
if (fs.existsSync(DOCS_ACTIONS_DIR)) {
  console.log('  SKIP   docs-structure（既に導入済み）');
} else {
  console.log('  docs-structure が未導入のため、先に導入します。');
  const fetchDest = path.join(FETCH_DIR, 'docs-structure-templates');
  degitFetch(DOCS_STRUCTURE_TEMPLATES_SRC, fetchDest);
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  const createdCount = copyRecursiveSkipExisting(fetchDest, DOCS_DIR);
  console.log(`  ✅ docs-structure導入完了（新規 ${createdCount} ファイル）`);
}

// --- 3. ブランチ専用ディレクトリの作成 + テンプレート取得 ---
console.log('\n--- 2. ブランチ専用ディレクトリの作成・テンプレート取得 ---');
const BRANCH_DOCS_DIR = path.join(DOCS_DIR, 'branches', branch);
let totalCreated = 0;
for (const dir of ['notes', 'letters', 'tasks']) {
  const dest = path.join(BRANCH_DOCS_DIR, dir);
  fs.mkdirSync(dest, { recursive: true });
  const fetchDest = path.join(FETCH_DIR, dir);
  degitFetch(`${DOCS_STRUCTURE_TEMPLATES_SRC}/${dir}`, fetchDest);
  totalCreated += copyRecursiveSkipExisting(fetchDest, dest);
}
console.log(`  ✅ 計 ${totalCreated} ファイルを配置しました。`);

// --- 4. TEMPLATE.md 内のパス書き換え ---
console.log('\n--- 3. TEMPLATE.md のパス書き換え ---');
for (const dir of ['notes', 'letters', 'tasks']) {
  const f = path.join(BRANCH_DOCS_DIR, dir, 'TEMPLATE.md');
  if (!fs.existsSync(f)) {
    console.log(`  SKIP   ${path.relative(process.cwd(), f)}（存在しない）`);
    continue;
  }
  const before = fs.readFileSync(f, 'utf8');
  const after = before
    .replace(/docs\/notes\//g, `docs/branches/${branch}/notes/`)
    .replace(/docs\/letters\//g, `docs/branches/${branch}/letters/`)
    .replace(/docs\/tasks\//g, `docs/branches/${branch}/tasks/`);
  if (after !== before) {
    fs.writeFileSync(f, after);
    console.log(`  UPDATE ${path.relative(process.cwd(), f)}`);
  } else {
    console.log(`  SKIP   ${path.relative(process.cwd(), f)}（書き換え不要）`);
  }
}

// --- 5. action ファイルのパス書き換え ---
console.log('\n--- 4. action ファイルのパス書き換え ---');
// 既存が未置換（docs/notes/等）でも、他ブランチ用に置換済み（docs/branches/other/notes/等）でも、
// どちらの状態からでも今のブランチのパスへ一発で正規化できる（再実行・ブランチ切り替え時も安全）。
const PATH_RE = /docs\/(?:branches\/.+?\/)?(?=notes\/|letters\/|tasks\/)/g;
const target = `docs/branches/${branch}/`;
for (const relFile of ACTION_FILES) {
  const f = path.join(process.cwd(), relFile);
  if (!fs.existsSync(f)) {
    console.log(`  SKIP   ${relFile}（存在しない）`);
    continue;
  }
  const before = fs.readFileSync(f, 'utf8');
  let count = 0;
  const after = before.replace(PATH_RE, () => {
    count++;
    return target;
  });
  if (after !== before) {
    fs.writeFileSync(f, after);
    console.log(`  UPDATE（${count}箇所） ${relFile}`);
  } else {
    console.log(`  SKIP   ${relFile}（変更なし）`);
  }
}

// --- 6. post-check（未置換パスが残っていないかの確認） ---
// 置換時と同じ「notes/|letters/|tasks/ の直前」を基準にマッチさせる（PATH_REと同一の境界判定）。
// ブランチ名が "feature/xxx" のようにスラッシュを含む場合、単純に「/」区切りで1階層だけを
// 比較すると誤検知するため、置換ロジックと全く同じ正規表現で捉えた上で target と一致するかを見る。
console.log('\n--- 5. post-check ---');
const staleFindings = [];
for (const relFile of ACTION_FILES) {
  const f = path.join(process.cwd(), relFile);
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(PATH_RE) || [];
  const issues = [...new Set(matches.filter((m) => m !== target))];
  if (issues.length > 0) {
    staleFindings.push({ file: relFile, issues });
  }
}
let postCheckOk = true;
if (staleFindings.length > 0) {
  postCheckOk = false;
  console.error('  ⚠️  未置換のパスが残っています:');
  staleFindings.forEach(({ file, issues }) => console.error(`    ${file}: ${issues.join(', ')}`));
} else {
  console.log('  ✅ 残存パスなし — すべて正常に置換されました');
}

// --- 完了通知 ---
console.log('\n===================================');
if (postCheckOk) {
  console.log(`✅ ブランチ専用ドキュメント構造を初期化しました: docs/branches/${branch}/\n`);
} else {
  console.log(`⚠️  初期化しましたが、post-checkで問題が見つかりました。上記を確認してください: docs/branches/${branch}/\n`);
}
console.log('作成したディレクトリ:');
['notes', 'letters', 'tasks'].forEach((dir) => console.log(`  - docs/branches/${branch}/${dir}/`));
console.log('\n書き換えたaction ファイル:');
ACTION_FILES.forEach((f) => console.log(`  - ${f}`));
console.log('\n以降はそのまま @docs/actions/ を使ってください。');
console.log(`ノート・申し送りは docs/branches/${branch}/ 以下に作成されます。`);
console.log('\n元の docs/notes/, docs/letters/, docs/tasks/ はそのまま残っています（変更していません）。');

if (!postCheckOk) process.exit(1);
