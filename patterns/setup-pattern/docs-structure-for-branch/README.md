# docs-structure-for-branch

docs-structure 導入済みのプロジェクトで、**ブランチ専用のドキュメント構造を初期化する**セットアップガイドです。

## いつ使うか

- feature ブランチで作業を開始するとき
- ブランチ固有のノート・申し送りを main と分けて管理したいとき
- `docs-structure` が未導入でも自動で導入してからブランチ初期化まで行います

---

## 🤖 AIへの発動プロンプト（コピペ用）

以下をそのまま AI に貼り付けてください：

---

ブランチ専用のドキュメント構造を初期化したいです。

まず以下のコマンドで手順書を取得してください：

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/docs-structure-for-branch tmp/docs-structure-for-branch --force
```

取得後、`tmp/docs-structure-for-branch/for_branch_init.md` を読んで指示に従ってください。

---

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
