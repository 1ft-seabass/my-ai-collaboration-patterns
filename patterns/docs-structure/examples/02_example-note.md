# Webpack バンドルサイズ最適化 - 開発記録

**作成日**: 2025-10-20
**関連タスク**: パフォーマンス改善
**ステータス**: 解決済み

---

## 問題

本番ビルド後のJSバンドルサイズが 2.8MB と大きく、初回ロードが遅い（約8秒）。

### 背景

- ユーザーからのフィードバックで初回ロード時間が長いとの指摘
- Lighthouse スコア: Performance 42/100
- 目標: バンドルサイズ 1MB 以下、初回ロード 3秒以内

### 環境

- Webpack v5.88
- React v18.2
- Node.js v20.5

---

## 試行錯誤

### アプローチA: Moment.js の削除

**試したこと**:
```bash
npm uninstall moment
npm install date-fns
```

全ての日付処理を date-fns に置き換え。

**結果**: 失敗

- バンドルサイズ: 2.8MB → 2.6MB（7%減少）
- 期待していたほど減らなかった
- Moment.js のロケールデータが問題だったが、他の大きな依存関係が残っていた

**学び**:
- Moment.js は確かに大きいが、他にも問題がある
- webpack-bundle-analyzer で分析が必要

---

### アプローチB: Code Splitting の追加

**試したこと**:
```javascript
// Before
import Dashboard from './Dashboard';

// After
const Dashboard = React.lazy(() => import('./Dashboard'));
```

主要なルートコンポーネントを動的インポートに変更。

**結果**: 部分的成功

- 初期バンドル: 2.6MB → 1.2MB（54%減少）
- 初回ロード時間: 8秒 → 5秒
- しかし、ページ遷移時に遅延が発生（UX悪化）

**問題点**:
- Dashboard への遷移で 2秒の待ち時間
- ユーザーから「遷移が遅い」とのフィードバック
- ローディングスピナーが頻繁に表示されUXが悪化

**学び**:
- Code Splitting は有効だが、粒度が重要
- 頻繁にアクセスするページは分割すべきでない
- Prefetch/Preload の検討が必要

---

### アプローチC: Tree Shaking + 選択的 Code Splitting（成功）

**試したこと**:

1. **Tree Shaking の最適化**:
```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false,
  },
};

// package.json
{
  "sideEffects": false
}
```

2. **lodash の最適化**:
```javascript
// Before
import _ from 'lodash';
_.debounce(fn, 300);

// After
import debounce from 'lodash/debounce';
debounce(fn, 300);
```

3. **選択的 Code Splitting**:
```javascript
// 頻繁にアクセスするページ: 通常のインポート
import Dashboard from './Dashboard';
import Profile from './Profile';

// 管理者ページなど: 動的インポート
const AdminPanel = React.lazy(() => import('./AdminPanel'));
const Reports = React.lazy(() => import('./Reports'));

// Prefetch で UX 改善
<link rel="prefetch" href="/admin-panel.chunk.js" />
```

**結果**: 成功 🎉

- 初期バンドル: 2.6MB → **850KB**（67%減少）
- 初回ロード時間: 8秒 → **2.8秒**（65%改善）
- Lighthouse スコア: 42 → **78**
- ページ遷移: スムーズ（頻繁なページは分割せず）

**数値詳細**:
```
Before:
- main.js: 2.6MB
- vendors.js: 含まれていない

After:
- main.js: 450KB
- vendors.js: 400KB
- admin.chunk.js: 280KB (lazy)
- reports.chunk.js: 320KB (lazy)
```

---

## 解決策

### 最終実装

#### 1. Tree Shaking の有効化

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
      },
    },
  },
};
```

#### 2. 依存関係の最適化

- Moment.js → date-fns に置き換え
- lodash の使用を個別インポートに変更
- 未使用の依存関係を削除（react-transition-group など）

#### 3. 選択的 Code Splitting

```javascript
// src/routes.tsx
import { lazy } from 'react';

// 頻繁にアクセス（通常インポート）
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// 管理者機能（動的インポート）
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
```

#### 4. Prefetch の追加

```html
<!-- public/index.html -->
<link rel="prefetch" href="/admin-panel.chunk.js" />
<link rel="prefetch" href="/reports.chunk.js" />
```

---

## 学び

### 1. webpack-bundle-analyzer は必須

問題の原因を正確に把握できる。思い込みで対策すると無駄な作業になる。

```bash
npm install --save-dev webpack-bundle-analyzer
```

### 2. Code Splitting の粒度が重要

- **頻繁にアクセス**: 通常インポート（初期バンドルに含める）
- **たまにアクセス**: 動的インポート（遅延ロード）
- **Prefetch**: ユーザーがアクセスしそうなページを事前読み込み

### 3. lodash は個別インポート

```javascript
// ❌ Bad: lodash 全体をインポート（540KB）
import _ from 'lodash';

// ✅ Good: 必要な関数だけ（15KB）
import debounce from 'lodash/debounce';
```

### 4. Tree Shaking の前提条件

- ES6 モジュール（import/export）を使用
- `sideEffects: false` を package.json に追加
- production モードでビルド

### 5. パフォーマンス計測は必須

- Lighthouse で定期的に計測
- 改善前後の数値を記録
- ユーザー体感も重要（数値だけでなく）

---

## 今後の課題

### 短期

- [ ] 画像の最適化（WebP 変換、lazy loading）
- [ ] CSS の最適化（未使用スタイルの削除）

### 長期

- [ ] SSR/SSG の検討（Next.js への移行？）
- [ ] CDN の活用
- [ ] HTTP/2 Server Push

---

## 関連ドキュメント

- [Webpack Bundle Analyzer レポート](./assets/bundle-report.html)
- [Lighthouse レポート Before](./assets/lighthouse-before.html)
- [Lighthouse レポート After](./assets/lighthouse-after.html)
- [ADR-0003: Code Splitting 戦略](../architecture/decisions/0003-code-splitting-strategy.md)

---

**最終更新**: 2025-10-20
**作成者**: Claude Code + User
