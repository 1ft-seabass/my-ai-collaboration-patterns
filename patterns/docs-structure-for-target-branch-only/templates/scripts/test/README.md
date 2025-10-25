# テストスクリプト

このディレクトリには、ブランチ固有の機能をテストするスクリプトを格納します。

## 📁 推奨ファイル構成

```
test/
├── README.md              # このファイル
├── run-all.js            # すべてのテストを実行
├── unit.js               # ユニットテストのみ実行
├── integration.js        # 統合テストのみ実行
├── e2e.js                # E2Eテストのみ実行
└── watch.js              # テストをwatch mode で実行
```

## 🎯 スクリプト例

### run-all.js（全テスト実行）

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Running all tests...\n');

try {
  // Jestを使う場合
  execSync('npx jest --coverage', { stdio: 'inherit' });

  console.log('\n✅ All tests passed!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Tests failed!');
  process.exit(1);
}
```

### unit.js（ユニットテストのみ）

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Running unit tests...\n');

try {
  execSync('npx jest --testPathPattern=unit', { stdio: 'inherit' });

  console.log('\n✅ Unit tests passed!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Unit tests failed!');
  process.exit(1);
}
```

### watch.js（Watch mode）

```javascript
#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('👀 Running tests in watch mode...\n');

const jest = spawn('npx', ['jest', '--watch'], { stdio: 'inherit' });

jest.on('close', (code) => {
  process.exit(code);
});
```

## 🔧 使い方

### 実行方法

```bash
# すべてのテストを実行
node scripts/test/run-all.js

# ユニットテストのみ実行
node scripts/test/unit.js

# Watch mode
node scripts/test/watch.js
```

### package.jsonとの連携

```json
{
  "scripts": {
    "test": "node scripts/test/run-all.js",
    "test:unit": "node scripts/test/unit.js",
    "test:watch": "node scripts/test/watch.js"
  }
}
```

## 💡 カスタマイズ例

### 環境変数の設定

```javascript
process.env.NODE_ENV = 'test';
process.env.TEST_TIMEOUT = '5000';
```

### 並列実行

```javascript
const { execSync } = require('child_process');

try {
  execSync('npx jest --maxWorkers=4', { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}
```

### カバレッジ閾値のチェック

```javascript
const { execSync } = require('child_process');

try {
  execSync('npx jest --coverage --coverageThreshold=\'{"global":{"branches":80,"functions":80,"lines":80}}\'', {
    stdio: 'inherit'
  });
} catch (error) {
  console.error('❌ Coverage threshold not met!');
  process.exit(1);
}
```

## 📚 テストフレームワーク別の例

### Jest

```javascript
execSync('npx jest', { stdio: 'inherit' });
```

### Mocha

```javascript
execSync('npx mocha "src/**/*.test.js"', { stdio: 'inherit' });
```

### Vitest

```javascript
execSync('npx vitest run', { stdio: 'inherit' });
```

## 🔗 関連リンク

- [../start/](../start/) - 起動スクリプト
- [../build/](../build/) - ビルドスクリプト
- [../../docs/notes/](../../docs/notes/) - テスト関連のノート
