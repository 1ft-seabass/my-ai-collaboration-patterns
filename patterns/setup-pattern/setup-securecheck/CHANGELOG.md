# Changelog

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
