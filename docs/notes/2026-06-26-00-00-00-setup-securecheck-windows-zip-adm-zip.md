---
tags: [setup-securecheck, windows, adm-zip, powershell, install-gitleaks]
---

# setup-securecheck Windows ZIP解凍を PowerShell 依存から adm-zip に変更

**作成日**: 2026-06-26
**関連タスク**: setup-securecheck Windows 環境での gitleaks インストール安定化

## 問題

`install-gitleaks.js` の Windows 向け ZIP 解凍処理が PowerShell の `Expand-Archive` に依存しており、環境によって動作が不安定だった。

```js
// Before: PowerShell 依存
const psCommand = `Expand-Archive -Path "${downloadPath}" -DestinationPath "${binDir}" -Force`;
execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
```

また、`const zlib = require('zlib')` が冒頭でインポートされていたが、実際には使われていない dead import だった。

## 解決策

### PowerShell → adm-zip（pure JS）に置き換え

`adm-zip` は pure JavaScript の ZIP ライブラリで、PowerShell や外部コマンドに依存しない。

```js
// After: pure JS で ZIP 解凍
try {
  require.resolve('adm-zip');
} catch (e) {
  console.log('   adm-zip をインストールしています...');
  execSync('npm install --no-save adm-zip', { stdio: 'inherit' });
}
const AdmZip = require('adm-zip');
const zip = new AdmZip(downloadPath);
zip.extractAllTo(binDir, true);
```

`require.resolve()` で存在確認し、未インストールなら `--no-save` で一時インストール。スクリプト実行のたびに余分なインストールは走らない。

### 未使用 import の削除

`const zlib = require('zlib')` を削除。

### Linux/macOS のコメント修正

"Use Node.js built-in zlib + tar" という誤ったコメントを "Use system tar for Linux/macOS (universally available)" に修正。

## 今後の改善案

- Linux/macOS の `tar` もシステム依存なので、将来的に `tar` npm パッケージへの統一も検討可能（現状は安定しているため優先度低）

## 関連ドキュメント

- [setup-securecheck パターン](../../patterns/setup-pattern/setup-securecheck/)

---

**最終更新**: 2026-06-26
**作成者**: AI (Claude) + 人間レビュー
