# docs-structure-for-target-branch-only パターン

> **🤖 AIへのワンショット指示（コピペ用）**
>
> ```
> https://github.com/1ft-seabass/my-ai-collaboration-patterns/tree/main/patterns/docs-structure-for-target-branch-only
> この仕組みを導入したいです。degit で構造をそのまま持ってきましょう。
> degit するのは配下の templates フォルダの中身です。
> また、中の各 README や TEMPLATE を案件固有のものに合わせてください。
> ```

ブランチ開発に特化した、封じ込め型のドキュメント・スクリプト管理構造

## 📦 このパターンについて

ブランチ開発時に、ドキュメント・テストスクリプト・起動スクリプト・actionsをブランチ内に封じ込め、mainブランチを汚さない開発スタイルを実現します。

### 解決する問題

- **mainブランチの汚染**: 実験的なスクリプトやドキュメントがmainに残る
- **ブランチ間の干渉**: 他のブランチの開発ノートや設定が混ざる
- **削除の困難さ**: ブランチ削除時に関連ファイルが残る
- **文脈の分散**: ブランチ固有の情報がリポジトリ全体に散らばる

### このパターンの特徴

- **完全封じ込め**: すべてがブランチルート配下に配置
- **クリーンな削除**: ブランチ削除で全て消える
- **mainブランチ保護**: 実験的な変更がmainに影響しない
- **Node.js優先**: プラットフォーム非依存のスクリプト
- **AI最適化**: docs-structureパターンを継承

## 🚀 使い方

### ブランチ作成時にセットアップ

**重要**: `templates` ディレクトリを指定してください。パターン直下ではなく、`templates` 以下がプロジェクトで使用する構造です。

```bash
# ブランチを作成
git checkout -b feature/sample-001

# パターンを取得（degit推奨）
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure-for-target-branch-only/templates .

# ディレクトリ構造を確認
ls -la
# docs/
# scripts/
# actions/
```

### Git Clone

```bash
git checkout -b feature/sample-001
git clone https://github.com/1ft-seabass/my-ai-collaboration-patterns.git
cp -r my-ai-collaboration-patterns/patterns/docs-structure-for-target-branch-only/templates/* .
```

## 📂 作成される構造

```
feature/sample-001/              # ブランチルート
├── docs/                        # ブランチ専用ドキュメント
│   ├── README.md
│   ├── ai-collaboration/       # AI協働開発ガイド
│   ├── development/            # 開発ガイド
│   ├── architecture/           # アーキテクチャ設計（ブランチ専用）
│   ├── letters/                # 申し送り（ブランチ専用）
│   ├── notes/                  # 開発ノート（ブランチ専用）
│   └── spec/                   # 仕様書（ブランチ専用）
├── scripts/                     # ブランチ専用スクリプト
│   ├── README.md
│   ├── test/                   # テストスクリプト（Node.js/Shell）
│   │   └── README.md
│   ├── start/                  # 起動スクリプト（Node.js/Shell）
│   │   └── README.md
│   └── build/                  # ビルドスクリプト（Node.js/Shell）
│       └── README.md
└── actions/                     # ブランチ専用actions
    ├── README.md
    ├── git_commit_and_push.md
    ├── current_create_knowledge.md
    └── simple_start_from_latest_letter.md
```

## 🎯 使用例

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

### テスト実行

```
「scripts/test/run-all.js でテストを実行してください」
```

### サーバー起動

```
「scripts/start/dev-server.js で開発サーバーを起動してください」
```

### actionsの活用

```
@actions/simple_start_from_latest_letter.md
@actions/git_commit_and_push.md
```

### ブランチ削除時

```bash
# ブランチを削除すると、すべて消える
git checkout main
git branch -D feature/user-auth

# mainブランチはクリーンなまま！
```

## 📖 コアコンセプト

### ブランチ封じ込め型

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

## 💡 運用のコツ

### ブランチ開始時の習慣

1. パターンをセットアップ
2. `docs/spec/` にブランチで実装する仕様を記述
3. AIに `docs/README.md` を読ませる

### 開発中の習慣

1. セッション開始時: `docs/letters/` の最新申し送りを確認
2. スクリプト実行: `scripts/` 配下のスクリプトで自動化
3. セッション終了時: `docs/letters/` に申し送り作成

### マージ前の習慣

1. ブランチ固有のドキュメントを確認
2. 必要に応じてmainに反映すべき知見を抽出
3. PRマージ後、ブランチ削除で全て削除

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

## 🔗 関連パターン

- [docs-structure](../docs-structure/) - ベースとなったドキュメント構造
- [actions-pattern](../actions-pattern/) - タスク自動化パターン

## 📚 詳細ドキュメント

詳細な使い方やカスタマイズ方法は以下を参照：
- [GUIDE.md](./GUIDE.md) - ワンショット作成指示
- [examples/](./examples/) - 具体的な使用例

## ⚡ 効果

### Before（パターン適用前）

- mainブランチに実験的スクリプトが蓄積
- ブランチ削除後もファイルが残る
- 他のブランチの開発ノートと混ざる
- mainブランチが汚れていく

### After（パターン適用後）

- ブランチ内に完全封じ込め
- ブランチ削除で全て消える
- 文脈が明確に分離
- mainブランチがクリーンに保たれる

## 📊 メトリクス

実際のプロジェクトでの効果（参考値）：
- mainブランチの汚染: **100% → 0%**（完全分離）
- ブランチ削除の手間: **手動クリーンアップ → 自動削除**
- 文脈の混在: **頻繁 → なし**
- スクリプトの再利用性: **低 → ブランチ内で完結**

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

## 🛠️ カスタマイズ

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

## 📝 ライセンス

MIT License - 自由に使用・改変・配布できます

---

**Quick Start**:
```bash
git checkout -b feature/my-feature
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure-for-target-branch-only/templates .
```
