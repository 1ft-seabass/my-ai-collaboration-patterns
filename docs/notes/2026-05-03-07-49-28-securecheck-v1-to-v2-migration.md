---
tags: [setup-securecheck, simple-git-hooks, husky, migration, security]
---

**作成日**: 2026-05-03
**関連タスク**: setup-securecheck v1 → v2.0.0 移行

## 問題

プロジェクトで setup-securecheck v1（husky + lint-staged）を使用していたが、
v2.0.0（simple-git-hooks）への移行が必要になった。

主な変更内容：
- husky + lint-staged → simple-git-hooks（package.json だけで完結する構成）
- pre-commit.js に実行ログ出力機能を追加（`.logs/pre-commit.log`）
- `.gitignore` に `.logs/` を追加

## 試行錯誤

移行ガイド（`tmp/securecheck-migration/MIGRATION_GUIDE_v1_to_v2.0.0.md`）に従い、
ウィザード形式で 6 ステップを順に実行した。

### Step 1: 現状確認

**試したこと**: 依存パッケージ・.husky/ ディレクトリ・スキャンツールの状態を確認

**結果**: 成功

- husky（^9.1.7）・lint-staged（^16.2.7）が存在することを確認
- `.husky/pre-commit` の存在を確認
- secretlint ✅（12.0.0）、gitleaks ❌（Step 4.5 でインストール予定）

---

### Step 2: migrate-to-v2.sh でパッケージ変更を実行

**試したこと**: `bash tmp/securecheck-migration/migrate-to-v2.sh` を実行

**結果**: 成功

- husky・lint-staged をアンインストール
- simple-git-hooks（^2.13.1）をインストール
- `.husky/` ディレクトリを削除

---

### Step 3: package.json を手動で更新

**試したこと**: 以下を手動編集

- `"prepare": "husky"` を削除 → `"postinstall": "npx simple-git-hooks"` を追加
- `"lint-staged": { "*": ["secretlint"] }` セクションを削除
- `"simple-git-hooks": { "pre-commit": "node scripts/pre-commit.js" }` をトップレベルに追加
- `npx simple-git-hooks` でフックを有効化

**結果**: 成功

`.git/hooks/pre-commit` に `node scripts/pre-commit.js` が含まれることを確認。

---

### Step 4: スクリプトファイルを新バージョンに置き換え

**試したこと**: degit で v2 スクリプトを取得し、`scripts/` に上書きコピー

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck/templates/scripts ./tmp/securecheck-v2-scripts
cp tmp/securecheck-v2-scripts/pre-commit.js scripts/
cp tmp/securecheck-v2-scripts/security-verify.js scripts/
```

**結果**: 成功

`writeLog` 関数（18行目）の存在でログ機能追加を確認。

---

### Step 4.5: スキャンツールの確認・インストール

**試したこと**: secretlint と gitleaks を再インストール

```bash
npm install -D secretlint @secretlint/secretlint-rule-preset-recommend
node scripts/install-gitleaks.js
```

**結果**: 成功

- secretlint ✅（11.7.1 に更新）
- gitleaks ✅（8.30.0 を新規インストール）

---

### Step 5: .gitignore を更新

**試したこと**: `.gitignore` の末尾に `.logs/` を追加

**結果**: 成功

`.husky/` 関連のコメントは元々存在しなかったため削除作業は不要だった。

---

### Step 6: 動作確認

**試したこと**: ヘルスチェックとテストコミットを実行

**結果**: 成功

- `npm run security:verify` → 10/11 ✅（残り1件はログ未生成のため。テストコミット前なので正常）
- テストコミット成功、secretlint・gitleaks ともに実行確認
- `.logs/pre-commit.log` に JSONL 形式でログ記録を確認

## 解決策

移行ガイドのウィザード指示書（AI 向け）に従って 6 ステップを順に実行することで、
husky + lint-staged から simple-git-hooks への移行が完了した。

**変更されたファイル**:
- `scripts/pre-commit.js` — ログ機能追加
- `scripts/security-verify.js` — ログ確認機能追加（11項目チェック）
- `package.json` — simple-git-hooks 設定・postinstall 追加、husky/lint-staged 設定削除
- `.git/hooks/pre-commit` — simple-git-hooks で自動生成
- `.gitignore` — `.logs/` 追加

**削除されたもの**:
- `.husky/pre-commit`
- husky / lint-staged（node_modules）

## 学び

- simple-git-hooks は package.json だけで完結するため、husky に比べて設定がシンプル
- `postinstall` に `npx simple-git-hooks` を設定することで、`npm install` 後に全員のフックが自動有効化される
- `package.json` の `simple-git-hooks` セクションを変更した場合は `npx simple-git-hooks` の再実行が必要
- ヘルスチェック（`npm run security:verify`）の 11 項目チェックで移行状態を網羅的に確認できる
- 移行ガイドをウィザード指示書形式にすることで、AI が各ステップでユーザー承認を挟みながら安全に進められる

## 今後の改善案

- 移行完了後は `tmp/securecheck-migration/` と `tmp/securecheck-v2-scripts/` を削除してよい（`.gitignore` で除外済み）

## 関連ドキュメント

- [移行ガイド](../../tmp/securecheck-migration/MIGRATION_GUIDE_v1_to_v2.0.0.md)
- [setup-securecheck パターン](../../patterns/setup-pattern/setup-securecheck/)

---

**最終更新**: 2026-05-03
**作成者**: AI
