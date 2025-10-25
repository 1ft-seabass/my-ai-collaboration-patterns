# 例1: 基本的なセットアップ

新しいfeatureブランチでパターンをセットアップする最もシンプルな使用例。

## シナリオ

- プロジェクト: Webアプリケーション
- タスク: ユーザー認証機能の実装
- ブランチ: `feature/user-auth`
- 期間: 1週間程度

## セットアップ手順

### 1. ブランチを作成

```bash
# mainブランチから新しいブランチを作成
git checkout -b feature/user-auth
```

### 2. パターンを取得

```bash
# degitで取得（推奨）
npx degit your-username/my-ai-collaboration-patterns/patterns/docs-structure-for-target-branch-only/templates .

# または、Git Clone
git clone https://github.com/your-username/my-ai-collaboration-patterns.git temp
cp -r temp/patterns/docs-structure-for-target-branch-only/templates/* .
rm -rf temp
```

### 3. 構造を確認

```bash
ls -la
# docs/
# scripts/
# actions/
```

### 4. AIにセットアップを伝える

```
「docs/README.md を読んで、このブランチ専用のワークスペースが構築されたことを確認してください」
```

## 作成されるディレクトリ構造

```
feature/user-auth/
├── docs/
│   ├── README.md
│   ├── ai-collaboration/
│   ├── development/
│   ├── architecture/
│   ├── letter/
│   │   ├── README.md
│   │   └── TEMPLATE.md
│   ├── notes/
│   │   ├── README.md
│   │   └── TEMPLATE.md
│   └── spec/
│       └── README.md
├── scripts/
│   ├── README.md
│   ├── test/
│   │   └── README.md
│   ├── start/
│   │   └── README.md
│   └── build/
│       └── README.md
└── actions/
    ├── README.md
    ├── git_commit_and_push.md
    ├── current_create_knowledge.md
    └── simple_start_from_latest_letter.md
```

## 実行例

### セッション開始時

```
「docs/letter/ の最新の申し送りを確認してください」
```

AIが最新の申し送りを読み込み、前回の作業内容を理解します。

### 仕様を記録

```
「docs/spec/ にユーザー認証機能の仕様を記録してください。
以下の要件を含めてください：
- メールアドレスとパスワードでのログイン
- JWT トークンベースの認証
- セッション管理」
```

AIが `docs/spec/user-auth.md` などに仕様を記録します。

### 開発ノートを記録

```
「JWT トークンの実装方法について調査した内容を docs/notes/ に記録してください」
```

AIが `docs/notes/01_jwt-implementation.md` などに調査内容を記録します。

### セッション終了時

```
「今日のブランチ作業内容を docs/letter/ に申し送りとして記録してください」
```

AIが `docs/letter/2025-10-25-15-30-00.md` などに申し送りを作成します。

## 成果物

### docs/spec/user-auth.md

```markdown
# ユーザー認証機能 仕様書

## 概要
ユーザーがメールアドレスとパスワードでログインできる機能

## 要件
- メールアドレス・パスワードでのログイン
- JWT トークンベースの認証
- セッション管理（7日間）

...
```

### docs/notes/01_jwt-implementation.md

```markdown
# JWT実装方法の調査

## 日時
2025-10-25

## 調査内容
- jsonwebtokenライブラリの使用方法
- トークンの有効期限設定
- リフレッシュトークンの実装パターン

...
```

### docs/letter/2025-10-25-15-30-00.md

```markdown
# 申し送り - 2025-10-25 15:30

## 本日の作業内容
- ユーザー認証機能の仕様を docs/spec/ に記録
- JWT実装方法を調査、docs/notes/ に記録

## 完了タスク
- [x] 仕様書作成
- [x] JWT調査

## 進行中タスク
- [ ] JWT実装

## 次回の優先事項
1. JWT実装を開始
2. テストスクリプトの作成

...
```

## ポイント

### ✅ Good

- **早期セットアップ**: ブランチ作成直後にパターンを適用
- **仕様から開始**: `docs/spec/` に仕様を記録してから実装
- **申し送りの習慣**: セッション終了時に必ず記録
- **ノートの活用**: 調査内容を `docs/notes/` に蓄積

### ❌ Bad

- 実装を始めてからドキュメントを書く（後回し）
- 申し送りを書かずにセッション終了
- ノートを書かずに調査結果を忘れる

## ブランチ削除時

```bash
# 開発完了、mainにマージ済み
git checkout main
git branch -D feature/user-auth

# docs/, scripts/, actions/ がすべて削除される
# mainブランチはクリーンなまま！
```

## まとめ

このパターンを使うことで：
- ブランチ固有の情報がブランチ内に封じ込められる
- セッション間の引き継ぎがスムーズ
- mainブランチが汚れない
- ブランチ削除で全て消える

次の例: [example-02-with-nodejs-scripts.md](./example-02-with-nodejs-scripts.md) - Node.jsスクリプトの実装
