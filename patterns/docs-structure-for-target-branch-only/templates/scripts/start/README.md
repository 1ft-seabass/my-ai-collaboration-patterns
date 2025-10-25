# 起動スクリプト

このディレクトリには、開発サーバーや本番サーバーの起動スクリプトを格納します。

## 📁 推奨ファイル構成

```
start/
├── README.md              # このファイル
├── dev-server.js         # 開発サーバー起動
├── prod-server.js        # 本番サーバー起動
├── mock-server.js        # モックサーバー起動
└── watch.js              # ホットリロード付き起動
```

## 🎯 スクリプト例

### dev-server.js（開発サーバー起動）

```javascript
#!/usr/bin/env node

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(express.json());
app.use(express.static('public'));

// ルート設定
app.get('/', (req, res) => {
  res.send('Hello, Development Server!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: 'development' });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Dev server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: development`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});
```

### prod-server.js（本番サーバー起動）

```javascript
#!/usr/bin/env node

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// セキュリティ設定
app.disable('x-powered-by');

// ミドルウェア設定
app.use(express.json({ limit: '10mb' }));
app.use(express.static('dist'));

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: 'production' });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Production server is running on port ${PORT}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// グレースフルシャットダウン
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
```

### watch.js（ホットリロード）

```javascript
#!/usr/bin/env node

const { spawn } = require('child_process');
const chokidar = require('chokidar');

console.log('👀 Starting server with hot reload...\n');

let serverProcess = null;

function startServer() {
  if (serverProcess) {
    serverProcess.kill();
  }

  serverProcess = spawn('node', ['scripts/start/dev-server.js'], {
    stdio: 'inherit'
  });
}

// ファイル監視
const watcher = chokidar.watch(['src/**/*.js', 'src/**/*.json'], {
  ignored: /node_modules/,
  persistent: true
});

watcher.on('change', (path) => {
  console.log(`\n🔄 File changed: ${path}`);
  console.log('🔄 Restarting server...\n');
  startServer();
});

// 初回起動
startServer();

// 終了処理
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  if (serverProcess) {
    serverProcess.kill();
  }
  watcher.close();
  process.exit(0);
});
```

### mock-server.js（モックサーバー）

```javascript
#!/usr/bin/env node

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// モックAPI
app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
  });
});

app.post('/api/users', (req, res) => {
  res.status(201).json({
    id: 3,
    ...req.body
  });
});

app.listen(PORT, () => {
  console.log(`🎭 Mock server is running on http://localhost:${PORT}`);
});
```

## 🔧 使い方

### 実行方法

```bash
# 開発サーバー起動
node scripts/start/dev-server.js

# 本番サーバー起動
NODE_ENV=production node scripts/start/prod-server.js

# ホットリロード付き起動
node scripts/start/watch.js

# モックサーバー起動
node scripts/start/mock-server.js
```

### package.jsonとの連携

```json
{
  "scripts": {
    "dev": "node scripts/start/dev-server.js",
    "start": "node scripts/start/prod-server.js",
    "dev:watch": "node scripts/start/watch.js",
    "mock": "node scripts/start/mock-server.js"
  }
}
```

## 💡 カスタマイズ例

### 環境変数の読み込み

```javascript
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL;
```

### CORS設定

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
```

### ログ出力

```javascript
const morgan = require('morgan');

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
```

### データベース接続

```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('✅ Database connected'))
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });
```

## 🛠️ シェルスクリプト版の例

### dev-server.sh

```bash
#!/bin/bash

export NODE_ENV=development
export PORT=3000

echo "🚀 Starting development server..."
node src/server.js
```

## 🔗 関連リンク

- [../test/](../test/) - テストスクリプト
- [../build/](../build/) - ビルドスクリプト
- [../../docs/notes/](../../docs/notes/) - サーバー起動関連のノート
