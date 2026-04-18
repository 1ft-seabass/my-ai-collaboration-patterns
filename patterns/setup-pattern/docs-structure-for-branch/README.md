# docs-structure-for-branch

docs-structure 導入済みのプロジェクトで、**ブランチ専用のドキュメント構造を初期化する**セットアップガイドです。

## いつ使うか

- `docs-structure` を導入済み
- feature ブランチで作業を開始するとき
- ブランチ固有のノート・申し送りを main と分けて管理したいとき

---

## 🤖 AIへのワンショット指示（コピペ用）

degit で `for_branch_init.md` を取得してから AI に渡すのが推奨です。

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/docs-structure-for-branch /tmp/docs-structure-for-branch
cp /tmp/docs-structure-for-branch/for_branch_init.md ./for_branch_init.md
```

取得後、AI に以下を指示：

```
@for_branch_init.md を読んで、ブランチ専用のドキュメント構造を初期化してください。
```

---

## 🔧 シェルスクリプト例（固定処理部分）

AIに頼まずシェルで直接実行することも可能です。

```bash
#!/bin/bash
set -e
BRANCH=$(git branch --show-current)

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  echo "ERROR: main/master ブランチでは実行しないでください"
  exit 1
fi

echo "ブランチ: $BRANCH"

# 1. ブランチ専用ディレクトリを作成
mkdir -p "docs/${BRANCH}/notes" "docs/${BRANCH}/letters" "docs/${BRANCH}/tasks"
echo "ディレクトリ作成完了"

# 2. 公式テンプレートを degit で取得
for dir in notes letters tasks; do
  npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure/templates/${dir} "docs/${BRANCH}/${dir}" --force
done
echo "テンプレート取得完了"

# 3. TEMPLATE.md 内のパスをブランチ専用に書き換え
node -e "
const fs = require('fs');
const branch = process.env.BRANCH;
['notes', 'letters', 'tasks'].forEach(dir => {
  const f = \`docs/\${branch}/\${dir}/TEMPLATE.md\`;
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/docs\/notes\//g,   \`docs/\${branch}/notes/\`);
  c = c.replace(/docs\/letters\//g, \`docs/\${branch}/letters/\`);
  c = c.replace(/docs\/tasks\//g,   \`docs/\${branch}/tasks/\`);
  fs.writeFileSync(f, c);
  console.log('Updated:', f);
});
" BRANCH="$BRANCH"
echo "TEMPLATE.md パス書き換え完了"

# 4. action ファイルのパスをブランチ専用に書き換え
node -e "
const fs = require('fs');
const branch = process.env.BRANCH;
const files = [
  'docs/actions/00_session_end.md',
  'docs/actions/doc_note.md',
  'docs/actions/doc_letter.md',
  'docs/actions/doc_note_and_commit.md',
  'docs/actions/check_my_security_prepare_level.md',
];
files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/docs\/notes\//g,   \`docs/\${branch}/notes/\`);
  c = c.replace(/docs\/letters\//g, \`docs/\${branch}/letters/\`);
  c = c.replace(/docs\/tasks\//g,   \`docs/\${branch}/tasks/\`);
  fs.writeFileSync(f, c);
  console.log('Updated:', f);
});
" BRANCH="$BRANCH"
echo "action ファイル書き換え完了"

echo ""
echo "完了: docs/${BRANCH}/ を初期化しました"
echo "元の docs/notes/, docs/letters/, docs/tasks/ はそのまま残っています（変更していません）"
```

---

## 📂 実行後の構造

```
docs/
├── actions/              ← パスが docs/{branch}/ に書き換え済み
├── {branch}/
│   ├── notes/            ← README.md + TEMPLATE.md（パス書き換え済み）
│   ├── letters/          ← 同上
│   └── tasks/            ← 同上
└── README.md
```

---

## 🔗 前提パターン

- [docs-structure](../../docs-structure/) - 先に導入してください
