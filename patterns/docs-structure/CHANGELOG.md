# Changelog

docs-structure パターンの変更履歴。

---

## [1.2.0] - 2026-04-17

### 追加
- `actions/for_branch_init.md`: ブランチ専用ドキュメント構造の初期化 action
  - `docs/{branch-name}/notes,letters,tasks/` を作成
  - 4つの action ファイルのパスをブランチ専用に書き換え（Node.js による一括置換）
  - 呼び出しパスは常に `@docs/actions/` で統一

### 変更
- `GUIDE.md`: actions パターンの哲学セクションを追加（向いているケース/向いていないケース、実測データへの参照）

### 廃止・統合
- `patterns/actions-pattern/` を廃止し docs-structure に統合
  - WHY.md の内容を `docs/notes/2025-10-25-00-00-00-actions-pattern-rationale.md` に移植
  - GUIDE.md の有用部分を docs-structure の GUIDE.md に吸収
- `patterns/docs-structure-for-target-branch-only/` を廃止
  - for_branch_init.md による初期化で代替
- `patterns/writing-collaborate/` を廃止
  - docs-structure でカバー可能になったため

---

## [1.1.0] - 2026-02

### 追加
- FrontMatter タグ（`tags: []`）を notes・letters・tasks テンプレートに追加
- `migration/MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md`: 既存プロジェクト向け移行ガイド

### 変更
- **命名規則を統一**: notes が `0001_title.md` → `yyyy-mm-dd-hh-mm-ss-title.md`、letters が `yyyy-mm-dd-hh-mm-ss.md` → `yyyy-mm-dd-hh-mm-ss-title.md`（タイトル付き）
- **テンプレート統合**: README.md を最小化し TEMPLATE.md にガイドを集約（トークン64%削減）
- actions の命名を整理: 連番プレフィックス（`00_`/`01_`）とカテゴリプレフィックス（`git_`/`doc_`/`dev_`/`check_`）を導入
- `doc_note_and_commit.md` を追加（軽量セッション終了用）

---

## [1.0.1] - 2025-11

### 変更
- notes 命名: `title.md` → `0001_title.md`（連番管理）
- letters 命名: タイムスタンプ形式（`yyyy-mm-dd-hh-mm-ss.md`）を導入
- actions ディレクトリを各パターンに追加

---

## [1.0.0] - 2025-10

初版リリース。

- 4フォルダ構成（notes/letters/tasks/actions）
- README 駆動のナビゲーション
- セッション引き継ぎ（申し送り）の仕組み
