# docs-structure-for-branch

docs-structure 導入済みのプロジェクトで、**ブランチ専用のドキュメント構造を初期化する**セットアップガイドです。

## いつ使うか

- feature ブランチで作業を開始するとき
- ブランチ固有のノート・申し送りを main と分けて管理したいとき
- `docs-structure` が未導入でも自動で導入してからブランチ初期化まで行います

---

## 🤖 AIへの発動プロンプト（コピペ用）

この手順は「main/masterなら中断」「パスを機械的に書き換える」だけで、人間の判断が必要な箇所がありません。そのため`install.js`が全工程を1回で完結させます。

以下をそのまま AI に貼り付けてください：

```
ブランチ専用のドキュメント構造を初期化したいです。

npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/docs-structure-for-branch ./tmp/docs-structure-for-branch --force
node ./tmp/docs-structure-for-branch/install.js
rm -rf ./tmp/docs-structure-for-branch

install.js の出力（ブランチ名、作成/書き換えしたファイル、post-check結果）をそのまま報告してください。
```

`install.js`は`docs-structure`が未導入なら自動で導入し、`docs/branches/{branch}/`の作成・テンプレート取得・`docs/actions/`内のパス書き換え・post-check（未置換パスの確認）まで1回で行います。テンプレートは実行のたびに`docs-structure/templates`から直接取得するため、このパターン側に古いコピーを持ちません。

### 手順書を1つずつ確認したい場合

`install.js`を使わず、AIに1ステップずつ確認しながら進めさせたい場合は、代わりに以下を使ってください：

```
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/docs-structure-for-branch tmp/docs-structure-for-branch --force
```

取得後、`tmp/docs-structure-for-branch/for_branch_init.md`を読んで指示に従ってください。

## 📂 実行後の構造

```
docs/
├── actions/              ← パスが docs/branches/{branch}/ に書き換え済み
├── branches/
│   └── {branch}/
│       ├── notes/        ← README.md + TEMPLATE.md（パス書き換え済み）
│       ├── letters/      ← 同上
│       └── tasks/        ← 同上
└── README.md
```

---

## 🔗 関連パターン

- [docs-structure](../../docs-structure/) - 未導入の場合はウィザードが自動で導入します
