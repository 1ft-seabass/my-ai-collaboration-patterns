# Changelog

## [2.0.2] - 2026-07-09

### 修正

- **gitleaks 検出ルール0件バグを修正（根本原因）**
  - `templates/gitleaks.toml` に `[extend] useDefault = true` が無く、gitleaks のデフォルト検出ルールが一切適用されていなかった
  - allowlist の `tmp/.*` を `^tmp/.*` にアンカー（`src/mytmp/` 等への部分文字列誤爆を防止）

- **pre-commit で secretlint 失敗時に gitleaks が実行されない問題を修正**
  - `templates/scripts/pre-commit.js` を、secretlint と gitleaks を独立実行して結果を集約する構成に変更

- **ヘルスチェックの中身検証を強化（11項目 → 12項目）**
  - `templates/scripts/security-verify.js` の gitleaks.toml チェックを、`[extend]`/`[[rules]]` の有無まで確認するよう強化
  - 新規 check#11「gitleaks 機能的カナリアテスト」を追加（合成シークレットを実際にスキャンして検出できるかを確認する機能的チェック）

- **導入ガイドのネガティブテストを修正**
  - `setup-securecheck.md` ステップ3.6.5のネガティブテストのカナリア値が allowlist に一致してしまい、gitleaks の検出を正しく検証できていなかった問題を修正
  - secretlint / gitleaks を個別に確認するステップを追加
  - `detect`/`protect`（gitleaks 8.28+ で非推奨）を `git` サブコマンドに移行

### 背景

ユーザーからの実バグ報告（4件）を受けて検証・修正。詳細は `docs/notes/2026-07-09-23-13-15-setup-securecheck-v2-0-1-gitleaks-zero-rules-report-verification.md` 以降のノートを参照。

---

## [2.0.1] - 2026-06-10

### 修正

- **pre-commit の secretlint を staged ファイルのみに変更**
  - `"**/*"` 全件スキャン → `git diff --cached --name-only` で staged ファイルに絞る
  - コミット時間: 数十秒〜10分超 → 数秒に改善
  - gitleaks の `protect --staged` と対称な構成に統一
  - Windows のコマンドライン長制限を考慮して 100 件ずつ分割処理

---

## [2.0.0] - 2026-04-18

### 変更

- **husky → simple-git-hooks に移行**
  - `.husky/` ディレクトリが不要になった
  - `package.json` だけで hooks 管理が完結
  - `postinstall` で `npm install` 後に全員の hooks が自動有効化

- **lint-staged を削除**
  - `pre-commit.js` が secretlint を直接呼び出す構成に変更
  - 依存チェーン（secretlint → lint-staged → husky）を解消

- **Phase 3/4 を Phase 3 に統合**
  - 「チーム用」と「個人用」の分岐は `.husky/` の gitignore 有無だけだった
  - simple-git-hooks では `.git/hooks/` に書き込まれるため分岐不要

- **pre-commit 実行ログを追加**
  - `.logs/pre-commit.log` に JSONL 形式で記録（最新50件）
  - 記録内容: `timestamp / result（passed/failed）/ branch`
  - `.gitignore` 管理（ローカル専用）

- **ヘルスチェック項目を更新**（10項目 → 11項目）
  - `.husky/pre-commit` 存在チェック → `.git/hooks/pre-commit` 存在チェック
  - `lint-staged` 設定チェック → `simple-git-hooks` 設定チェック
  - フック内容チェックを `pre-commit.js` 記述確認に変更
  - `lint-staged` 動作チェック → 実行ログ最終確認チェック（新規）

- **`.gitignore` テンプレートを更新**
  - `.husky/` 関連の記述を削除
  - `.logs/` を追加

- **VERSION / CHANGELOG.md を追加**

### 追加

- `migration/` ディレクトリ: v1 → v2.0.0 移行ガイドとシェル補助スクリプト

---

## [1.x] - 2026-03-24 以前

初期バージョン（husky + lint-staged 構成）。バージョン管理なし。
