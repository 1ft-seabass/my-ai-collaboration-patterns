---
tags: [setup-securecheck, windows, install-gitleaks, pre-commit, bug-fix]
---

# setup-securecheck Windows実機検証で発見された2件のバグ修正 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-14
**関連タスク**: setup-securecheck v3.0.0 のWindows実機検証（前回申し送りで「時が来たら」として持ち越されていた項目）

## 問題

ユーザーがWindows 11 Pro + PowerShell 5.1（Node.jsはgit bash経由）の新規リポジトリで`setup-securecheck`を実地導入検証したところ、ウィザードの手順自体は迷いなく完走できたものの、Windows環境特有と思われる不具合を2件発見した。

1. `install-gitleaks`サブコマンドがWindowsで必ず失敗する
2. pre-commitフックのsecretlint自動自己検証（カナリア）がWindowsで常に失敗し、シークレットを含まないコミットも毎回ブロックされる

## 調査・原因

### 不具合1: install-gitleaksのzip展開レース条件

**症状**:
```
New-Object : "3" 個の引数を指定して ".ctor" を呼び出し中に例外が発生しました: "別のプロセスで使用されているため、プロセスはファイル '...\gitleaks_8.30.0_windows_x64.zip' にアクセスできません。"
❌ Installation verification failed: ...
```
2回連続で再現。

**原因**: `.security-check/lib/install-gitleaks.js`の`file.on('finish', () => { file.close(); extractAndCleanup(); })`で、`fs.WriteStream.close()`はコールバックを渡さない限り非同期にファイルハンドルを解放する。直後に呼ばれる`extractAndCleanup()`（PowerShellの`Expand-Archive`）がまだロックの外れていないzipファイルにアクセスしようとして競合していた。Linux/macOSでは`tar`が別プロセスでハンドルの持ち方が異なるため顕在化していなかった。

**ユーザーによる回避策（検証時）**: 手動で`Invoke-WebRequest`でダウンロード→`Expand-Archive`を別ステップで実行することで回避を確認。

### 不具合2: pre-commitのカナリア判定パス比較

**症状**: pre-commitフックの動作確認で、シークレットを一切含まないコミットでもsecretlint側が毎回ブロックされる。
```
=== secretlint ===
  ❌ .canary-probe-secretlint
      found GitHub Token(...): ...
  ❌ secretlint 自動自己検証 — カナリアが検出されませんでした（検出ルールが機能していない可能性）
```

**原因**: `.security-check/lib/pre-commit.js`の`if (secretlintCanaryPath && r.filePath === secretlintCanaryPath)`における文字列完全一致比較がWindowsでは常に不一致になる。
- `secretlintCanaryPath`（`path.join(process.cwd(), ...)`由来）: `C:\workspace\...\.canary-probe-secretlint`（バックスラッシュ区切り）
- `r.filePath`（secretlintのJSON出力）: `C:/workspace/.../.canary-probe-secretlint`（フォワードスラッシュ区切り）

secretlint自体は正しくカナリアを検出していたが、パス区切り文字の違いだけで「カナリア未検出」と誤判定され、かつカナリア自体が「実ファイルの検出結果」として`realFindings`に混入するため、Windows環境ではpre-commitが毎回必ずブロックされる状態になっていた。

**ユーザーによる回避策（検証時）**: ローカルの`.security-check/lib/pre-commit.js`に修正を当てて解決を確認済みだった内容を、そのままリポジトリ本体に反映した。

## 解決策

### 不具合1の修正

**実装場所**: `.security-check/lib/install-gitleaks.js:102,106` および `patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/install-gitleaks.js:102,106`

```js
// 修正前
file.on('finish', () => { file.close(); extractAndCleanup(); });

// 修正後
file.on('finish', () => { file.close(() => extractAndCleanup()); });
```

`file.close()`にコールバックを渡し、ファイルハンドルが確実に解放されてから`extractAndCleanup()`を呼ぶようにした。

### 不具合2の修正

**実装場所**: `.security-check/lib/pre-commit.js:66-71,149` および `patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/pre-commit.js:同箇所`

```js
// パス正規化関数を追加
function normalizeForCompare(p) {
  const resolved = path.resolve(p).replace(/\\/g, '/');
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

// 比較箇所を置き換え
if (secretlintCanaryPath && normalizeForCompare(r.filePath) === normalizeForCompare(secretlintCanaryPath)) {
  canaryDetected = true;
} else {
  realFindings.push(r);
}
```

区切り文字を`/`に統一した上で、Windowsのみ大文字小文字を無視する比較にした（Windowsのファイルシステムは大文字小文字を区別しないため）。

**主なポイント**:
1. 2件とも、ユーザーが実機で発見・原因診断・回避策検証まで済ませた状態で報告してくれたため、AI側はソースを確認して同じ修正をテンプレート側・デプロイ済みコピー側の両方に反映するだけで済んだ
2. デプロイ済みコピー（`.security-check/`）とテンプレート（`patterns/setup-pattern/setup-securecheck/templates/.security-check/`）は修正前後で内容が完全一致していることを`diff`で確認しながら進めた
3. Linux環境で`node .security-check/cli.js verify`（15/15）が引き続き通ることを確認。Windows固有分岐（`process.platform === 'win32'`）のため、Linux側の挙動には影響しない

## 学び

- Node.jsの`fs.WriteStream.close()`はコールバックなしだと非同期解放であることが、クロスプラットフォームでの後続処理の競合バグとして顕在化しやすい。ファイルI/O後に別プロセス（PowerShellなど）へ引き渡す処理がある場合は、必ずクローズ完了を待つ設計にする必要がある
- パス文字列の完全一致比較は、Windowsのパス区切り文字（`\`）とNode.jsの一部API（JSON出力など）が返す`/`区切りの不一致で簡単に壊れる。パス比較は常に正規化してから行うべき
- ユーザー自身が実機で不具合を発見し、原因診断・修正案・検証まで行った上で報告してくれる形は、AI側の調査コストを大幅に下げる。今回はその報告をそのまま裏取り（ソース確認・diff確認・verify再実行）した上で反映する流れになった

## 今後の改善案

- Windows実機でのCI（GitHub Actions windows-latestなど）を将来的に用意できれば、今回のような回帰を機械的に検知できる
- `install-gitleaks`のtar展開側（Linux/macOS）も同様の非同期ハンドル解放リスクがないか、余裕があるときに再点検してもよい

## 関連ドキュメント
- [前回申し送り: setup-securecheck v3ウィザード追加・実地検証完了](../letters/2026-07-12-13-01-39-setup-securecheck-v3-wizard-and-live-verification.md)
- [ウィザード実装・cwdガード修正の技術詳細](./2026-07-12-12-34-18-setup-securecheck-v3-wizard-and-cwd-guard-fix.md)

---

**最終更新**: 2026-07-14
**作成者**: Claude
