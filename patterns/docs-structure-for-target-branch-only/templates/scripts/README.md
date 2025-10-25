# ブランチ専用スクリプト

このディレクトリには、**このブランチ専用**のテスト・起動・ビルドスクリプトが格納されています。

> **ブランチ封じ込め型**: このscripts/ディレクトリはブランチと共に生まれ、ブランチと共に消えます。mainブランチを汚しません。

## 📂 ディレクトリ構成

### [test/](./test/) - テストスクリプト
ブランチ固有の機能をテストするスクリプトを格納しています。

- ユニットテスト実行
- 統合テスト実行
- E2Eテスト実行

**推奨**: Node.js（`node test/run-all.js`）またはシェルスクリプト（`bash test/run-all.sh`）

### [start/](./start/) - 起動スクリプト
開発サーバーや本番サーバーの起動スクリプトを格納しています。

- 開発サーバー起動
- 本番サーバー起動
- モックサーバー起動

**推奨**: Node.js（`node start/dev-server.js`）

### [build/](./build/) - ビルドスクリプト
アプリケーションのビルド関連スクリプトを格納しています。

- プロダクションビルド
- 開発ビルド
- アセット生成

**推奨**: Node.js（`node build/prod.js`）

## 🎯 使い方

### テストの実行

```bash
# すべてのテストを実行
node scripts/test/run-all.js

# 特定のテストを実行
node scripts/test/unit.js
```

### サーバーの起動

```bash
# 開発サーバーを起動
node scripts/start/dev-server.js

# 本番サーバーを起動
node scripts/start/prod-server.js
```

### ビルドの実行

```bash
# プロダクションビルド
node scripts/build/prod.js

# 開発ビルド
node scripts/build/dev.js
```

## 📝 スクリプト作成のガイドライン

### 1. Node.js優先
- プラットフォーム非依存
- npm/yarnパッケージを活用可能
- package.jsonのscriptsと連携しやすい

### 2. シェルスクリプトも可
- OS固有の操作が必要な場合
- 軽量な起動スクリプト
- bash/zsh/sh対応

### 3. 命名規則
- ケバブケース: `run-all.js`, `dev-server.js`
- 動詞-名詞形式: `start-server.js`, `run-tests.js`
- 拡張子を明示: `.js`, `.sh`

### 4. エラーハンドリング
- 適切なexit code（0: 成功, 1: 失敗）
- わかりやすいエラーメッセージ
- ログ出力

### 5. ドキュメント化
- 各サブディレクトリにREADME.md
- スクリプトの先頭にコメント
- 使用例を明記

## 🤖 AIへの指示例

### スクリプト実行
```
「scripts/test/run-all.js でテストを実行してください」
「scripts/start/dev-server.js で開発サーバーを起動してください」
```

### スクリプト作成依頼
```
「scripts/test/ にJestを使ったユニットテスト実行スクリプトを作成してください」
「scripts/start/ にExpress開発サーバーの起動スクリプトを作成してください」
```

## 💡 ベストプラクティス

### package.jsonとの連携

ブランチルートに`package.json`を配置し、scriptsセクションで呼び出す：

```json
{
  "scripts": {
    "test": "node scripts/test/run-all.js",
    "dev": "node scripts/start/dev-server.js",
    "build": "node scripts/build/prod.js"
  }
}
```

これにより、`npm test`, `npm run dev`で実行可能になります。

### 環境変数の活用

`.env`ファイル（ブランチルート）で環境変数を管理：

```
PORT=3000
NODE_ENV=development
```

スクリプト内で読み込み：

```javascript
require('dotenv').config();
const port = process.env.PORT || 3000;
```

### 相対パスの注意

スクリプトはブランチルートから実行されることを想定：

```javascript
// Good
const path = require('path');
const rootDir = path.resolve(__dirname, '../..');

// Bad（カレントディレクトリ依存）
const config = require('./config.json');
```

## 🔗 関連リンク

- [../docs/](../docs/) - ブランチ専用ドキュメント
- [../actions/](../actions/) - ブランチ専用アクション
