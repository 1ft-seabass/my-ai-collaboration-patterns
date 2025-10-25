# ビルドスクリプト

このディレクトリには、アプリケーションのビルド関連スクリプトを格納します。

## 📁 推奨ファイル構成

```
build/
├── README.md              # このファイル
├── prod.js               # 本番ビルド
├── dev.js                # 開発ビルド
├── clean.js              # ビルド成果物のクリーンアップ
└── assets.js             # アセット生成・最適化
```

## 🎯 スクリプト例

### prod.js（本番ビルド）

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Starting production build...\n');

// ビルドディレクトリのクリーンアップ
const distDir = path.join(__dirname, '../../dist');
if (fs.existsSync(distDir)) {
  console.log('🧹 Cleaning dist directory...');
  fs.rmSync(distDir, { recursive: true });
}

try {
  // TypeScriptコンパイル
  console.log('📦 Compiling TypeScript...');
  execSync('npx tsc --project tsconfig.prod.json', { stdio: 'inherit' });

  // アセットの最適化
  console.log('🎨 Optimizing assets...');
  execSync('node scripts/build/assets.js', { stdio: 'inherit' });

  // ファイルサイズチェック
  console.log('\n📊 Build summary:');
  execSync('du -sh dist', { stdio: 'inherit' });

  console.log('\n✅ Production build completed!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Build failed!');
  process.exit(1);
}
```

### dev.js（開発ビルド）

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🏗️  Starting development build...\n');

try {
  // TypeScriptコンパイル（watch mode）
  console.log('📦 Compiling TypeScript in watch mode...');
  execSync('npx tsc --watch', { stdio: 'inherit' });

  process.exit(0);
} catch (error) {
  console.error('\n❌ Build failed!');
  process.exit(1);
}
```

### clean.js（クリーンアップ）

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning build artifacts...\n');

const dirsToClean = [
  path.join(__dirname, '../../dist'),
  path.join(__dirname, '../../build'),
  path.join(__dirname, '../../.cache')
];

dirsToClean.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  Removing: ${path.basename(dir)}/`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

console.log('\n✅ Cleanup completed!');
```

### assets.js（アセット最適化）

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 Optimizing assets...\n');

const assetsDir = path.join(__dirname, '../../src/assets');
const distAssetsDir = path.join(__dirname, '../../dist/assets');

// ディレクトリ作成
if (!fs.existsSync(distAssetsDir)) {
  fs.mkdirSync(distAssetsDir, { recursive: true });
}

try {
  // 画像最適化（例: imagemin使用）
  console.log('  🖼️  Optimizing images...');
  // execSync('npx imagemin src/assets/images/* --out-dir=dist/assets/images', { stdio: 'inherit' });

  // CSS minify
  console.log('  🎨 Minifying CSS...');
  // execSync('npx postcss src/assets/css/*.css --dir dist/assets/css --use cssnano', { stdio: 'inherit' });

  // JavaScript minify
  console.log('  📦 Minifying JavaScript...');
  // execSync('npx terser src/assets/js/*.js -d dist/assets/js/', { stdio: 'inherit' });

  console.log('\n✅ Asset optimization completed!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Asset optimization failed!');
  process.exit(1);
}
```

## 🔧 使い方

### 実行方法

```bash
# 本番ビルド
node scripts/build/prod.js

# 開発ビルド（watch mode）
node scripts/build/dev.js

# クリーンアップ
node scripts/build/clean.js

# アセット最適化のみ
node scripts/build/assets.js
```

### package.jsonとの連携

```json
{
  "scripts": {
    "build": "node scripts/build/prod.js",
    "build:dev": "node scripts/build/dev.js",
    "clean": "node scripts/build/clean.js",
    "build:assets": "node scripts/build/assets.js"
  }
}
```

## 💡 カスタマイズ例

### Webpack使用

```javascript
#!/usr/bin/env node

const webpack = require('webpack');
const config = require('../../webpack.config.js');

console.log('🏗️  Building with Webpack...\n');

webpack(config, (err, stats) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }));

  if (stats.hasErrors()) {
    console.error('\n❌ Build failed with errors');
    process.exit(1);
  }

  console.log('\n✅ Build completed!');
});
```

### Vite使用

```javascript
#!/usr/bin/env node

const { build } = require('vite');

(async () => {
  try {
    console.log('🏗️  Building with Vite...\n');
    await build({
      mode: 'production',
      build: {
        outDir: 'dist',
        minify: 'terser'
      }
    });
    console.log('\n✅ Build completed!');
  } catch (error) {
    console.error('\n❌ Build failed!', error);
    process.exit(1);
  }
})();
```

### esbuild使用

```javascript
#!/usr/bin/env node

const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'dist/bundle.js',
  platform: 'node',
  target: 'node18'
}).then(() => {
  console.log('✅ Build completed!');
}).catch(() => {
  console.error('❌ Build failed!');
  process.exit(1);
});
```

### 環境変数の埋め込み

```javascript
const fs = require('fs');
const path = require('path');

// .env読み込み
require('dotenv').config();

// 環境変数をJSONとして出力
const envConfig = {
  API_URL: process.env.API_URL,
  VERSION: process.env.npm_package_version
};

fs.writeFileSync(
  path.join(__dirname, '../../dist/config.json'),
  JSON.stringify(envConfig, null, 2)
);
```

## 🛠️ シェルスクリプト版の例

### build.sh

```bash
#!/bin/bash

set -e

echo "🏗️  Starting production build..."

# クリーンアップ
rm -rf dist

# TypeScriptコンパイル
echo "📦 Compiling TypeScript..."
npx tsc

# アセット最適化
echo "🎨 Optimizing assets..."
cp -r src/assets dist/

echo "✅ Build completed!"
```

## 🔗 関連リンク

- [../test/](../test/) - テストスクリプト
- [../start/](../start/) - 起動スクリプト
- [../../docs/notes/](../../docs/notes/) - ビルド関連のノート
