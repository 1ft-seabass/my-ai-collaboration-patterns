# docs-structure-for-target-branch-only セットアップガイド

AIアシスタントにこのファイルを読ませて、ブランチ専用のワークスペースを自動構築できます。

---

## 指示: ブランチ専用ワークスペースの構築

以下の手順でブランチ専用のドキュメント・スクリプト・actions構造を構築してください。

### 前提条件

- 現在のブランチ名を確認する（`git branch --show-current`）
- ブランチルート（リポジトリルート）に配置する

### 構築手順

#### 1. ディレクトリ構造の作成

以下のディレクトリ構造を作成してください：

```
<ブランチルート>/
├── docs/
│   ├── README.md
│   ├── ai-collaboration/
│   ├── development/
│   │   └── best-practices/
│   ├── architecture/
│   │   └── decisions/
│   ├── letter/
│   ├── notes/
│   └── spec/
├── scripts/
│   ├── README.md
│   ├── test/
│   ├── start/
│   └── build/
└── actions/
    └── README.md
```

#### 2. docs/ の構築

`docs-structure` パターンをベースに、ブランチ専用版として構築：

1. `docs/README.md` を作成（ブランチ専用ドキュメントのインデックス）
2. 以下のサブディレクトリを作成し、各README.mdを配置：
   - `ai-collaboration/` - AI協働開発ガイド
   - `development/best-practices/` - ベストプラクティス
   - `architecture/decisions/` - ADR
   - `letter/` - 申し送り（テンプレート含む）
   - `notes/` - 開発ノート（テンプレート含む）
   - `spec/` - 仕様書

**重要**: すべてのREADME.mdに「このブランチ専用」であることを明記してください。

#### 3. scripts/ の構築

Node.js/シェルスクリプトを配置するディレクトリ構造を作成：

1. `scripts/README.md` を作成（スクリプト全体の説明）
2. 以下のサブディレクトリを作成し、各README.mdを配置：
   - `test/` - テストスクリプト（Jest, Mochaなど）
   - `start/` - 起動スクリプト（dev-server, prod-serverなど）
   - `build/` - ビルドスクリプト（prod, devなど）

各README.mdには、スクリプトの例とNode.jsでの実装方法を記載してください。

#### 4. actions/ の構築

ブランチ専用のタスク自動化指示書を配置：

1. `actions/README.md` を作成（ブランチ専用actionsの説明）
2. 以下のactionsをコピー（必要に応じてカスタマイズ）：
   - `git_commit_and_push.md`
   - `current_create_knowledge.md`
   - `simple_start_from_latest_letter.md`

**重要**: README.mdに「ブランチ専用」であることと、`scripts/` のスクリプトと連携することを明記してください。

#### 5. package.json の作成（オプション）

ブランチルートに`package.json`を作成し、scripts/のスクリプトを呼び出せるようにしてください：

```json
{
  "name": "branch-<ブランチ名>",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "test": "node scripts/test/run-all.js",
    "dev": "node scripts/start/dev-server.js",
    "build": "node scripts/build/prod.js"
  }
}
```

### 完了確認

構築完了後、以下を確認してください：

1. ✅ `docs/`, `scripts/`, `actions/` ディレクトリが存在する
2. ✅ 各ディレクトリにREADME.mdが配置されている
3. ✅ すべてのREADME.mdに「ブランチ専用」であることが明記されている
4. ✅ `package.json` が作成されている（オプション）

### 報告形式

構築完了後、以下の形式で報告してください：

```
✅ ブランチ専用ワークスペースを構築しました

📂 作成されたディレクトリ:
- docs/ (ブランチ専用ドキュメント)
- scripts/ (テスト・起動・ビルドスクリプト)
- actions/ (タスク自動化指示書)

📝 次のステップ:
1. docs/spec/ にこのブランチで実装する仕様を記述してください
2. scripts/test/ にテストスクリプトを追加してください
3. scripts/start/ に起動スクリプトを追加してください

🤖 AIへの指示例:
「docs/README.md を読んで、このブランチ開発を開始してください」
```

---

## カスタマイズ例

### テストフレームワークを指定

```
「JestをテストフレームワークとしてGUIDE.mdに従ってワークスペースを構築してください。
scripts/test/run-all.js にJestを実行するスクリプトを追加してください」
```

### サーバーフレームワークを指定

```
「Expressを使った開発サーバーとしてGUIDE.mdに従ってワークスペースを構築してください。
scripts/start/dev-server.js にExpressサーバーの起動スクリプトを追加してください」
```

### 最小構成

```
「GUIDE.mdに従ってワークスペースを構築してください。
ただし、scripts/build/ は不要なので省略してください」
```

---

## トラブルシューティング

### Q: すでにdocs/やscripts/が存在する場合は？

A: 既存のディレクトリを確認し、競合を避けるために以下のいずれかを選択してください：
1. 既存のディレクトリを別名にリネーム（例: `docs-old/`）
2. 既存のディレクトリをバックアップして削除
3. このパターンの適用を中止

### Q: ブランチ名にスラッシュが含まれる場合（例: feature/user-auth）は？

A: package.jsonのnameフィールドでは、スラッシュをハイフンに置き換えてください：
```json
{
  "name": "branch-feature-user-auth"
}
```

### Q: mainブランチのdocs/と競合する場合は？

A: ブランチ専用のdocs/はブランチ固有の情報のみを記録してください。リポジトリ全体の情報はmainブランチのdocs/に記録します。

---

**使い方**: このファイルをAIアシスタントに読ませて、「GUIDE.mdに従ってワークスペースを構築してください」と指示してください。
