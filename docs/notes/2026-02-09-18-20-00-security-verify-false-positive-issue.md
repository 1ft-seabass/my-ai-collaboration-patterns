---
tags: [security-verify, false-positive, npm-scripts, health-check, bug-fix]
---

# security-verify.js の偽陽性問題と修正 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-02-09
**関連タスク**: setup_securecheck パターンの改善

## 問題

前回セッション（`2026-02-09-02-05-10-securecheck-improvements-complete.md`）で改善されたウィザードを実戦テストした際、以下の問題が発見された：

1. **Phase 0 のヘルスチェックが 10/10 passed** と表示
2. **しかし `npm run security:verify:simple` が存在しない**（Missing script エラー）
3. package.json には `secret-scan` と `secret-scan:full` のみ存在

つまり、**ヘルスチェックが偽陽性**（npm scripts が不足しているのに合格判定）を出していた。

### 実戦テストの流れ

```
ユーザー: 試してきました！（ウィザード実行）
↓
Phase 0: ヘルスチェック実行
↓
結果: 10/10 passed - 完璧です！
↓
ユーザー: 実際のスキャンが正常に動作するか確認しましょう
↓
npm run security:verify:simple
↓
❌ Error: Missing script: "security:verify:simple"
```

## 原因調査

`security-verify.js` のチェック項目（10個）を確認：

### 存在チェック（4項目）
1. `.secretlintrc.json` ✅
2. `gitleaks.toml` ✅
3. `.husky/pre-commit` ✅
4. `package.json` の `lint-staged` 設定 ✅

### 中身チェック（3項目）
5. `.secretlintrc.json` に `preset-recommend` ✅
6. `gitleaks.toml` が空でない ✅
7. `.husky/pre-commit` に `secretlint`/`lint-staged` ✅

### 動作チェック（3項目）
8. `secretlint` コマンド ✅
9. `lint-staged` コマンド ✅
10. `gitleaks` バイナリ（bin/gitleaks） ✅

### 問題点

**npm scripts の存在チェックが完全に欠落していた。**

`package.json.example` には以下の6つのセキュリティ関連scriptsが定義されているのに、チェックしていない：

```json
{
  "scripts": {
    "security:verify": "node scripts/security-verify.js",
    "security:verify:simple": "node scripts/security-verify.js --simple",
    "security:verify:testrun": "node scripts/security-verify.js --test-run",
    "security:install-gitleaks": "node scripts/install-gitleaks.js",
    "secret-scan": "secretlint \"**/*\"",
    "secret-scan:full": "secretlint \"**/*\" && ./bin/gitleaks detect --source . -v --config gitleaks.toml"
  }
}
```

## 解決策

### 修正内容

`security-verify.js` に **npm scripts チェックを追加**：

**実装場所**: `patterns/setup-pattern/setup_securecheck/templates/scripts/security-verify.js:103-128`

**主なポイント**:

1. **チェック項目を 10→11 に増加**
2. **新しいチェック項目5**: package.json の必須 npm scripts
   - `security:verify`
   - `security:verify:simple`
   - `security:verify:testrun`
   - `security:install-gitleaks`
3. **不足しているscriptsを明確に表示**

### 実装コード

```javascript
// 5. package.json の npm scripts
const requiredScripts = [
  'security:verify',
  'security:verify:simple',
  'security:verify:testrun',
  'security:install-gitleaks'
];

let scriptsCheckPassed = true;
const missingScripts = [];

if (packageJsonData && packageJsonData.scripts) {
  for (const scriptName of requiredScripts) {
    if (!packageJsonData.scripts[scriptName]) {
      scriptsCheckPassed = false;
      missingScripts.push(scriptName);
    }
  }
}

if (scriptsCheckPassed && packageJsonData) {
  checkResult(true, 'package.json に必須 npm scripts あり');
} else {
  checkResult(false, `package.json に必須 npm scripts — 不足: ${missingScripts.join(', ')}`);
}
checks.existence.push({ name: 'npm-scripts', exists: scriptsCheckPassed });
```

### テスト結果

**修正前**:
```
結果: 10/10 passed（偽陽性 - npm scriptsが無いのに合格）
✅ ヘルスチェック完了
```

**修正後**:
```
[存在チェック]
  ✅ .secretlintrc.json
  ✅ gitleaks.toml
  ✅ .husky/pre-commit
  ✅ package.json lint-staged 設定
  ❌ package.json に必須 npm scripts — 不足: security:verify, security:verify:simple, security:verify:testrun, security:install-gitleaks

[中身チェック]
  ✅ .secretlintrc.json に preset-recommend あり
  ✅ gitleaks.toml が空でない
  ✅ .husky/pre-commit に secretlint/lint-staged あり

[動作チェック]
  ✅ secretlint 11.3.0
  ✅ lint-staged 16.2.7
  ✅ gitleaks 8.30.0

================================
結果: 10/11 passed, 1 failed, 0 warning

❌ ヘルスチェックに問題があります。まず設定を修正してください。
```

**正しく検出できている！** ✅

## 学び

### 1. ヘルスチェックの包括性の重要性

- ヘルスチェックは「導入が完璧か」を判定するツール
- **チェック漏れがあると偽陽性が発生**し、ユーザーに誤った安心感を与える
- 実行時に初めて問題に気づくという最悪のUX

### 2. 実戦テストの価値

- 今回の問題は**実戦テストで初めて発見**された
- テンプレート開発者の環境では気づきにくい
- ユーザー視点でのテストが不可欠

### 3. package.json.example との整合性

- テンプレートで提供する内容（package.json.example）
- ヘルスチェックで検証する内容（security-verify.js）
- この2つは**完全に一致すべき**

## 今後の改善案

### 1. チェックリストの明確化

`setup_securecheck.md` に「ヘルスチェックで検証される項目一覧」を追加し、package.json.example との対応を明記する。

### 2. 他のチェック漏れの可能性

今回は npm scripts だったが、他にもチェック漏れがある可能性：
- `scripts/` ディレクトリ内のファイル存在チェック
- `.gitignore` に `bin/` が含まれているか
- devDependencies の存在確認

### 3. テストスイートの追加

`security-verify.js` 自体のテストを作成：
- 不足している設定を検出できるか
- 偽陽性を出さないか
- 偽陰性を出さないか

## 関連ドキュメント

- [前回の申し送り](../letters/2026-02-09-02-05-10-securecheck-improvements-complete.md) - 今回テストしたウィザードの改善内容
- [前々回のノート](./2026-02-08-15-44-55-setup-securecheck-wizard-issues.md) - ウィザード実行時の問題点

---

**最終更新**: 2026-02-09
**作成者**: Claude Sonnet 4.5
