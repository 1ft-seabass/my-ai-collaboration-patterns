# docs-structure-for-target-branch-only - 補足ガイド

> **対象**: AIアシスタント（degit後に読む）
> **目的**: 配置されたブランチ専用構造の意図を理解する

## 📖 このガイドについて

このガイドは、degit でブランチ専用のワークスペースを配置した後に読むべき補足資料です。
構造の哲学と意図を理解することで、より効果的に活用できます。

## 🏗️ 配置された構造

```
<ブランチルート>/
├── docs/                        # ブランチ専用ドキュメント
│   ├── README.md
│   ├── ai-collaboration/       # AI協働開発ガイド
│   ├── development/            # 開発ガイド
│   ├── architecture/           # アーキテクチャ設計（ブランチ専用）
│   ├── letter/                 # 申し送り（ブランチ専用）
│   ├── notes/                  # 開発ノート（ブランチ専用）
│   └── spec/                   # 仕様書（ブランチ専用）
├── scripts/                     # ブランチ専用スクリプト
│   ├── README.md
│   ├── test/                   # テストスクリプト（Node.js/Shell）
│   ├── start/                  # 起動スクリプト（Node.js/Shell）
│   └── build/                  # ビルドスクリプト（Node.js/Shell）
└── actions/                     # ブランチ専用actions
    ├── README.md
    ├── git_commit_and_push.md
    ├── current_create_knowledge.md
    └── simple_start_from_latest_letter.md
```

## 🎯 コアコンセプト

### ブランチ封じ込め型

このパターンの核心は「ブランチ内に完全封じ込め」です。

| 項目 | 従来の方法 | このパターン |
|------|-----------|-------------|
| ドキュメント | `docs/` (main) | `feature/xxx/docs/` |
| スクリプト | `scripts/` (main) | `feature/xxx/scripts/` |
| actions | `actions/` (main) | `feature/xxx/actions/` |
| ブランチ削除後 | ファイルが残る | 完全に削除される |
| mainへの影響 | 実験的変更が残る | 完全に分離 |

### 3つのディレクトリ

| ディレクトリ | 目的 | 技術スタック |
|------------|------|------------|
| **docs/** | ブランチ専用ドキュメント | Markdown（docs-structureベース） |
| **scripts/** | テスト・起動・ビルド | Node.js/Shell |
| **actions/** | タスク自動化 | Markdown（actionsパターン） |

### Node.js優先のスクリプト

- **プラットフォーム非依存**: Windows/Mac/Linux対応
- **npm/yarnとの連携**: package.jsonで管理可能
- **シェルも可**: OS固有操作に対応

## 🚀 運用開始

### ブランチ開発の開始

```bash
# ブランチ作成
git checkout -b feature/user-auth

# パターンをセットアップ
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure-for-target-branch-only/templates .

# AIに伝える
「docs/README.md を読んで、このブランチ開発を開始してください」
```

### セッション開始時

```
「docs/README.md を読んで、最新の申し送りを確認してください」
```

または actions を使用：

```
@actions/simple_start_from_latest_letter.md
```

### スクリプト実行

```
「scripts/test/run-all.js でテストを実行してください」
「scripts/start/dev-server.js で開発サーバーを起動してください」
```

### actionsの活用

```
@actions/git_commit_and_push.md
@actions/current_create_knowledge.md
```

### ブランチ削除時

```bash
# ブランチを削除すると、すべて消える
git checkout main
git branch -D feature/user-auth

# mainブランチはクリーンなまま！
```

## 🔧 カスタマイズ

### README・TEMPLATE のカスタマイズ

各 README.md や TEMPLATE.md をこのブランチ固有の内容に書き換えてください：

- `docs/README.md` - ブランチ名、実装内容を調整
- `docs/spec/README.md` - このブランチで実装する仕様を記述
- `letter/TEMPLATE.md` - ブランチ固有のセクション追加
- `notes/TEMPLATE.md` - ブランチ固有のフォーマット調整
- 各ディレクトリの `README.md` - ブランチ固有の説明に更新

### package.jsonとの連携

ブランチルートに`package.json`を配置（推奨）：

```json
{
  "name": "feature-user-auth",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "test": "node scripts/test/run-all.js",
    "dev": "node scripts/start/dev-server.js",
    "build": "node scripts/build/prod.js"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "express": "^4.18.0"
  }
}
```

これにより、`npm test`, `npm run dev`で実行可能になります。

### ディレクトリの追加

```bash
# 例: データベースマイグレーションスクリプトを追加
mkdir -p scripts/migrate
echo "# マイグレーションスクリプト" > scripts/migrate/README.md
```

### 不要なディレクトリの削除

```bash
# 例: ビルドが不要な場合
rm -rf scripts/build
```

## 💡 運用のコツ

### ブランチ開始時の習慣

1. パターンをセットアップ
2. `docs/spec/` にブランチで実装する仕様を記述
3. AIに `docs/README.md` を読ませる

### 開発中の習慣

1. セッション開始時: `docs/letter/` の最新申し送りを確認
2. スクリプト実行: `scripts/` 配下のスクリプトで自動化
3. セッション終了時: `docs/letter/` に申し送り作成

### マージ前の習慣

1. ブランチ固有のドキュメントを確認
2. 必要に応じてmainに反映すべき知見を抽出
3. PRマージ後、ブランチ削除で全て削除

## 🎯 期待される効果

このパターンを導入することで：

- ✅ mainブランチの汚染がゼロに（完全分離）
- ✅ ブランチ削除で関連ファイルが自動削除
- ✅ 文脈が明確に分離（他ブランチと混ざらない）
- ✅ mainブランチがクリーンに保たれる
- ✅ スクリプトがブランチ内で完結

## 🙋 よくある質問

**Q: mainブランチにもdocs/やscripts/がある場合は？**

A: 共存可能です。mainはリポジトリ全体の情報、ブランチはブランチ固有の情報として分けてください。

**Q: ブランチごとにpackage.jsonを持つべき？**

A: 推奨です。ブランチ固有の依存関係を管理でき、クリーンに削除できます。

**Q: マージ時にdocs/やscripts/もマージされる？**

A: はい。必要に応じて`.gitignore`にブランチ固有のディレクトリを追加するか、マージ前に削除してください。

**Q: 小規模な機能ブランチでも有効？**

A: 規模に応じて使い分けてください。大きな機能や長期ブランチで特に効果的です。

**Q: シェルスクリプトとNode.jsどちらを使うべき？**

A: Node.js優先を推奨（プラットフォーム非依存）。OS固有の操作が必要な場合のみシェルスクリプトを使用してください。

## ✅ 確認チェックリスト

配置後、以下を確認してください：

- [ ] `docs/`, `scripts/`, `actions/` ディレクトリが作成された
- [ ] すべてのサブディレクトリに `README.md` が存在する
- [ ] すべてのREADME.mdに「ブランチ専用」であることが明記されている
- [ ] `actions/` に3つのアクションファイルが存在する
- [ ] `letter/TEMPLATE.md` と `notes/TEMPLATE.md` が存在する
- [ ] 各 README.md をブランチ固有の内容に更新した
- [ ] `package.json` が作成された（オプション）

## 📚 さらに詳しく

- [README.md](./README.md) - このパターンの詳細説明（人間向け）
- [examples/](./examples/) - 具体的な使用例
- [docs-structure](../docs-structure/) - ベースとなったドキュメント構造
- [actions-pattern](../actions-pattern/) - タスク自動化パターン

---

**次のステップ**: `docs/spec/` にこのブランチで実装する仕様を記述し、開発を開始してください
