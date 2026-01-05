# Express での REST API 実装パターン - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2025-01-04
**関連タスク**: ユーザー管理 API の実装

---

## 問題

Express でバックエンド API を実装する際、エラーハンドリング、CORS 設定、ミドルウェアの順序など、初心者がつまずきやすいポイントが多い。

### 背景

- フロントエンド（React）から fetch で API を呼び出す際に CORS エラーが発生
- エラーレスポンスの形式が統一されていない
- ミドルウェアの順序によって想定外の動作が発生

### 要件

- フロントエンド（localhost:3000）からのリクエストを受け付ける
- 統一されたエラーレスポンス形式
- JSON リクエスト/レスポンスの処理
- 開発時のログ出力

---

## 試行錯誤

### アプローチA: CORS を後から追加

**試したこと**:
```javascript
// server/index.js
const express = require('express');
const app = express();

// ルート定義
app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

// CORS を最後に追加
const cors = require('cors');
app.use(cors());

app.listen(3001);
```

**結果**: 失敗

**理由**:
- ミドルウェアは上から順に実行される
- ルート定義より後に `cors()` を追加しても、すでにルートが処理されているため効果がない
- フロントエンドから `Access-Control-Allow-Origin` ヘッダーがないエラーが発生

**学び**:
- Express のミドルウェアは**定義順序が重要**
- CORS ミドルウェアはルート定義より**前**に配置する必要がある

---

### アプローチB: エラーハンドリングを各ルートに記述

**試したこと**:
```javascript
// server/routes/users.js
router.get('/:id', async (req, res) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 他のルートも同様に try-catch を記述...
```

**結果**: 部分的に成功

**問題点**:
- すべてのルートに同じ try-catch を書く必要がある（DRY 原則に違反）
- エラーレスポンスの形式を統一するのが困難（各ルートで微妙に違うレスポンスになる）
- コードが冗長で読みにくい

**学び**:
- エラーハンドリングは共通化すべき
- Express の**エラーハンドリングミドルウェア**を使うべき

---

### アプローチC: ミドルウェアを正しい順序で配置（成功）

**試したこと**:

**1. ミドルウェアの配置順序を整理**:
```javascript
// server/index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// 1. CORS（最初に配置）
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 2. ロギング（開発時のデバッグ用）
app.use(morgan('dev'));

// 3. JSON パーサー（req.body を使う前に必須）
app.use(express.json());

// 4. ルート定義
app.use('/api/users', require('./routes/users'));

// 5. 404 ハンドラー（ルート定義の後）
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 6. エラーハンドリングミドルウェア（最後に配置）
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
```

**2. ルートをシンプルに**:
```javascript
// server/routes/users.js
const express = require('express');
const router = express.Router();

// モックデータ（後でデータベースに置き換え）
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

// GET /api/users - 全ユーザー取得
router.get('/', (req, res) => {
  res.json(users);
});

// GET /api/users/:id - 特定ユーザー取得
router.get('/:id', (req, res, next) => {
  const user = users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    return next(error);  // エラーハンドリングミドルウェアに渡す
  }

  res.json(user);
});

// POST /api/users - ユーザー作成
router.post('/', (req, res, next) => {
  const { name, email } = req.body;

  // バリデーション
  if (!name || !email) {
    const error = new Error('Name and email are required');
    error.status = 400;
    return next(error);
  }

  const newUser = {
    id: users.length + 1,
    name,
    email
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

module.exports = router;
```

**結果**: 成功

**メリット**:
- CORS エラーが解消
- エラーハンドリングが統一され、コードがシンプルに
- JSON のパース処理が自動で行われる
- 開発時のログが見やすい

---

## 解決策

### 最終実装パターン

#### 1. ミドルウェアの正しい配置順序

```javascript
// server/index.js
const express = require('express');
const app = express();

// ① CORS（最初）
app.use(cors({ origin: 'http://localhost:3000' }));

// ② ロギング
app.use(morgan('dev'));

// ③ JSON パーサー
app.use(express.json());

// ④ ルート定義
app.use('/api/users', require('./routes/users'));

// ⑤ 404 ハンドラー
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ⑥ エラーハンドリング（最後）
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});
```

#### 2. ルートでのエラー処理

```javascript
// エラーを next() に渡す
router.get('/:id', (req, res, next) => {
  const user = findUser(req.params.id);

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    return next(error);  // ← エラーハンドリングミドルウェアに任せる
  }

  res.json(user);
});
```

#### 3. 統一されたエラーレスポンス形式

```json
{
  "error": "エラーメッセージ"
}
```

---

## 学び

### 1. Express ミドルウェアの順序は重要

**正しい順序**:
1. **CORS** - 最初に配置（すべてのリクエストに適用）
2. **ロギング** - リクエストの詳細を記録
3. **JSON パーサー** - `req.body` を使う前に必須
4. **ルート定義** - 実際の API エンドポイント
5. **404 ハンドラー** - どのルートにもマッチしなかった場合
6. **エラーハンドリング** - 最後に配置（すべてのエラーをキャッチ）

### 2. エラーハンドリングミドルウェアの使い方

```javascript
// エラーハンドリングミドルウェアは4つの引数が必須
app.use((err, req, res, next) => {
  // ^^^^^^^^^ 4つの引数
  res.status(err.status || 500).json({
    error: err.message
  });
});
```

**ポイント**:
- 4つの引数 `(err, req, res, next)` が必須
- 3つの引数だと通常のミドルウェアとして扱われる
- `next(error)` でエラーを渡すと、このミドルウェアが呼ばれる

### 3. CORS の設定

```javascript
// 開発時: すべてのオリジンを許可（簡単だが本番非推奨）
app.use(cors());

// 本番: 特定のオリジンのみ許可（推奨）
app.use(cors({
  origin: 'https://example.com',
  credentials: true  // Cookie を使う場合
}));
```

### 4. モックデータから始める

```javascript
// 最初は配列でモックデータ
const users = [
  { id: 1, name: 'Alice' }
];

// 後でデータベースに置き換え
const users = await db.query('SELECT * FROM users');
```

**メリット**:
- フロントエンド開発を先行できる
- API の形式を早期に確定できる
- 後からデータベースに置き換えが容易

### 5. ステータスコードの使い分け

| ステータス | 用途 | 例 |
|-----------|------|-----|
| 200 | 成功（GET, PUT） | ユーザー取得成功 |
| 201 | 作成成功（POST） | ユーザー作成成功 |
| 400 | リクエストエラー | バリデーションエラー |
| 404 | 見つからない | ユーザーが存在しない |
| 500 | サーバーエラー | 予期しないエラー |

---

## 今後の改善案

### 短期
- [ ] バリデーションライブラリの導入（Joi or Zod）
- [ ] データベース接続（SQLite or PostgreSQL）
- [ ] 認証機能の追加（JWT）

### 長期
- [ ] レート制限（express-rate-limit）
- [ ] API ドキュメント自動生成（Swagger）
- [ ] テストの追加（Jest + Supertest）

---

## 関連ドキュメント

- [Express 公式ドキュメント - エラーハンドリング](https://expressjs.com/en/guide/error-handling.html)
- [Express 公式ドキュメント - ミドルウェア](https://expressjs.com/en/guide/using-middleware.html)
- [CORS パッケージ](https://www.npmjs.com/package/cors)
- 関連する申し送り: `docs/letters/2025-01-05-18-30-00.md` - ユーザー管理機能の実装状況

---

**最終更新**: 2025-01-04
**作成者**: Claude Code + User
