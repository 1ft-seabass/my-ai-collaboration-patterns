# 例2: Node.jsスクリプトの実装

scripts/ディレクトリにNode.jsスクリプトを実装し、テスト・起動・ビルドを自動化する例。

## シナリオ

- プロジェクト: Express.js API
- タスク: REST API エンドポイントの追加
- ブランチ: `feature/api-endpoints`
- テストフレームワーク: Jest
- ランタイム: Node.js 18+

## セットアップ

### 1. ブランチとパターンのセットアップ

```bash
git checkout -b feature/api-endpoints
npx degit your-username/my-ai-collaboration-patterns/patterns/docs-structure-for-target-branch-only/templates .
```

### 2. package.json の作成

```bash
npm init -y
```

AIに依頼してカスタマイズ：

```
「package.json を以下の内容で更新してください：
- name: "branch-feature-api-endpoints"
- scripts: test, dev, build を追加
- devDependencies: jest, express, nodemon を追加」
```

生成される `package.json`:

```json
{
  "name": "branch-feature-api-endpoints",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "test": "node scripts/test/run-all.js",
    "dev": "node scripts/start/dev-server.js",
    "build": "node scripts/build/prod.js"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "express": "^4.18.2",
    "nodemon": "^3.0.1"
  }
}
```

### 3. 依存関係のインストール

```bash
npm install
```

## Node.jsスクリプトの実装

### scripts/test/run-all.js

```
「scripts/test/run-all.js にJestを使った全テスト実行スクリプトを作成してください」
```

生成されるスクリプト:

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Running all tests...\n');

try {
  execSync('npx jest --coverage --verbose', { stdio: 'inherit' });

  console.log('\n✅ All tests passed!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Tests failed!');
  process.exit(1);
}
```

実行:

```bash
node scripts/test/run-all.js
# または
npm test
```

### scripts/start/dev-server.js

```
「scripts/start/dev-server.js にExpressを使った開発サーバー起動スクリプトを作成してください。
ポート3000でリッスンし、/health エンドポイントを含めてください」
```

生成されるスクリプト:

```javascript
#!/usr/bin/env node

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(express.json());

// ルート
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: 'development',
    timestamp: new Date().toISOString()
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Dev server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: development`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
  console.log(`📍 Endpoints:`);
  console.log(`  GET  /           - API root`);
  console.log(`  GET  /health     - Health check`);
});
```

実行:

```bash
node scripts/start/dev-server.js
# または
npm run dev
```

### scripts/build/prod.js

```
「scripts/build/prod.js に本番ビルドスクリプトを作成してください。
dist/ ディレクトリに成果物を出力してください」
```

生成されるスクリプト:

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Starting production build...\n');

// dist ディレクトリのクリーンアップ
const distDir = path.join(__dirname, '../../dist');
if (fs.existsSync(distDir)) {
  console.log('🧹 Cleaning dist directory...');
  fs.rmSync(distDir, { recursive: true });
}

fs.mkdirSync(distDir, { recursive: true });

try {
  // ソースファイルをコピー
  console.log('📦 Copying source files...');
  execSync('cp -r src/* dist/', { stdio: 'inherit' });

  // package.jsonをコピー
  console.log('📄 Copying package.json...');
  const packageJson = require('../../package.json');
  const prodPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    dependencies: packageJson.dependencies
  };
  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(prodPackageJson, null, 2)
  );

  // ビルドサマリー
  console.log('\n📊 Build summary:');
  execSync('du -sh dist', { stdio: 'inherit' });

  console.log('\n✅ Production build completed!');
  console.log(`📦 Output: ${distDir}`);
  process.exit(0);
} catch (error) {
  console.error('\n❌ Build failed!');
  process.exit(1);
}
```

実行:

```bash
node scripts/build/prod.js
# または
npm run build
```

## 実行例

### 1. 開発サーバーの起動

```bash
npm run dev
```

出力:
```
🚀 Dev server is running on http://localhost:3000
📝 Environment: development
⏰ Started at: 2025-10-25T10:30:00.000Z

📍 Endpoints:
  GET  /           - API root
  GET  /health     - Health check
```

### 2. テストの実行

```bash
npm test
```

出力:
```
🧪 Running all tests...

 PASS  src/__tests__/api.test.js
  API Endpoints
    ✓ GET / returns API message (15ms)
    ✓ GET /health returns health status (8ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Coverage:    100%

✅ All tests passed!
```

### 3. 本番ビルド

```bash
npm run build
```

出力:
```
🏗️  Starting production build...

🧹 Cleaning dist directory...
📦 Copying source files...
📄 Copying package.json...

📊 Build summary:
12K     dist

✅ Production build completed!
📦 Output: /path/to/feature/api-endpoints/dist
```

## actionsとの連携

### actions/branch_test_and_commit.md

```
「actions/branch_test_and_commit.md を作成してください。
テストを実行し、成功したらコミット・プッシュするアクションです」
```

生成されるアクション:

```markdown
# ブランチのテスト実行とコミット

## 目的
ブランチの変更に対してテストを実行し、成功したらコミット・プッシュする

## 実行手順

1. テストを実行
   ```bash
   npm test
   ```

2. テストが成功したら、変更をステージング
   ```bash
   git add .
   ```

3. コミットメッセージを作成してコミット
   - コミットメッセージには変更内容を簡潔に記述

4. ブランチにプッシュ
   ```bash
   git push origin feature/api-endpoints
   ```

## 注意事項
- テストが失敗した場合は、コミット・プッシュを中止
- コミットメッセージは具体的に

## 期待する結果
- テストが全てパス
- 変更がブランチにプッシュされる
```

使い方:
```
@actions/branch_test_and_commit.md
```

## ディレクトリ構造

```
feature/api-endpoints/
├── package.json
├── package-lock.json
├── node_modules/
├── src/
│   ├── server.js
│   └── __tests__/
│       └── api.test.js
├── dist/                    # ビルド成果物
├── docs/
│   ├── letter/
│   ├── notes/
│   └── spec/
├── scripts/
│   ├── test/
│   │   └── run-all.js      ★ Jestテスト実行
│   ├── start/
│   │   └── dev-server.js   ★ Express開発サーバー
│   └── build/
│       └── prod.js         ★ 本番ビルド
└── actions/
    └── branch_test_and_commit.md
```

## ポイント

### ✅ Good

- **npm scriptsと連携**: `npm test`, `npm run dev` で実行可能
- **Node.js優先**: プラットフォーム非依存
- **エラーハンドリング**: 適切なexit code
- **わかりやすいログ**: 絵文字と色分け（オプション）

### ❌ Bad

- シェルスクリプトのみに依存（OS依存）
- エラーハンドリングなし
- ログ出力なし

## まとめ

このパターンを使うことで：
- Node.jsスクリプトでテスト・起動・ビルドを自動化
- `npm test`, `npm run dev` で簡単に実行
- ブランチ内に封じ込め、mainブランチを汚さない
- AIと協力してスクリプトを段階的に改善可能

次の例: [example-03-branch-workflow.md](./example-03-branch-workflow.md) - ブランチ開発の全体フロー
