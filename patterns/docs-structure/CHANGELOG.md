# Changelog

docs-structure パターンの変更履歴。

---

## [1.3.0] - 2026-09-23

### 追加
- `install.js`: 既存プロジェクトへの安全マージ用Node.js確定的インストーラーを新設。`templates/`と同じ階層に配置し、`__dirname`基準でコピー元を解決するため`process.cwd()`に依存しない。既存ファイルは絶対に上書きせず（skip-existing）、新規導入と中断からの再開を同一ロジックで自然にカバーする。package.json・gitには一切依存しない。書く前に配置先の絶対パスを出力してcwd事故を防止し、作成0件かつ既存ありの場合は「既存のdocs-structureを最新版に更新する場合」の判断層ウィザードへ誘導する

### 変更
- `README.md`（ja/en）: 冒頭のワンショット指示を「新規プロジェクトへの導入」（Node.js前提／プロンプトのみ／手動、の3段階）と「既存プロジェクトの更新」（プロンプトのみ／手動、の2段階）に再構成
- `README.md`（ja/en）: 「🚀 使い方」節を削除。内容が新しい冒頭ブロックおよび「🎯 使用例」節と重複していたため

## [1.2.6] - 2026-09-23

### 廃止
- `GUIDE.md` を廃止（ja/en）。`templates/`に含まれずdegitで配布されないため実質誰にも読まれておらず、内容が陳腐化（存在しないディレクトリ構造・actionファイル名を記載）していた。導入時に実際に使われる一次動線（パターンルート`README.md`冒頭のワンショット指示）には一切関与していなかったため、廃止しても実害なし
- `SETUP.md`（リポジトリルート）を廃止。docs-structureパターンとは無関係（このモノレポ自身の古い構造説明）で、どこからも参照されていなかった

### 修正
- `templates/README.md`（ja/en、配布先`docs/README.md`）: 存在しないaction名（`git_commit_and_push.md`, `current_create_knowledge.md`, `simple_start_from_latest_letter.md`）の記載を、実在するファイル名（`01_git_push.md`, `doc_letter.md`, `start_init_rule.md`）またはREADME.mdへの参照に修正
- `templates/README.md`（ja/en）: 陳腐化した「必要に応じて追加できるフォルダ」節（`ai-collaboration/`, `architecture/`, `development/`, `spec/`）を削除。同ファイル内で「READMEの手動一覧は更新漏れのリスクがある」と自ら述べている方針と矛盾していたため
- `templates/README.md`（ja/en）、`docs/README.md`: 廃止した`SETUP.md`へのデッドリンクを削除
- `patterns/docs-structure/README.md`（ja/en）: 「関連パターン」節の`server-management`/`prompt-engineering`（実在しないディレクトリ）へのデッドリンクを削除
- `templates/actions/README.md`（ja/en）、`docs/actions/README.md`: 廃止した`GUIDE.md`への参照を削除
- ルート`README.md`: 廃止した`GUIDE.md`への言及3箇所を修正（パターン紹介・特徴・コントリビューションガイド）

---

## [1.2.5] - 2026-09-22

### 廃止
- `templates/actions/check_my_security_prepare_level.md` を廃止（利用頻度が低く、setup-securecheck 側が v3 で独自のバージョン検出・自己検証（カナリア）を持つようになったため、診断ロジックが重複・陳腐化していた。husky pre-commit 前提のまま v2.0.0 の simple-git-hooks 移行や v3 のフェイルクローズ設計に追従できていなかった）
  - `templates/actions/help.md`, `templates/actions/README.md` から参照を削除
  - `patterns/setup-pattern/docs-structure-for-branch/for_branch_init.md` の書き換え対象ファイル一覧・完了通知からも参照を削除

### 修正
- `patterns/setup-pattern/README.md`: v1.2.0 で廃止済みの `patterns/actions-pattern/` へのデッドリンクを削除

---

## [1.2.4] - 2026-09-22

### 追加
- `templates/actions/start_init_rule.md`: セッション開始時に運用ルールを確認・共有するアクションを追加。ノールールのまま作業が始まって事故る問題への対処（`00_session_end.md` が終了時の締めくくりなら、これは開始時の入口）

### 修正
- `templates/actions/00_session_end.md`, `templates/actions/doc_letter.md`, `examples/01_example-letter.md`: 引き継ぎメッセージ内の運用ルールで、ノート作成の注意書きが「セッション終了時の申し送りフロー内でのみ実行すること」という誤った文言になっていたバグを修正し、申し送りと同じ「ユーザーが明示的に指示したときのみ実行すること」に統一
- `templates/actions/doc_letter.md`, `examples/01_example-letter.md`: コミットルールの文言が `00_session_end.md` と食い違っていた（公開/非公開でAI痕跡の有無を分ける旧文言）のを「従来のコミットログ（git log）を参考に統一する」文言に統一
- `templates/actions/help.md`, `templates/actions/README.md`: v1.2.1 で `for_branch_init.md` を `patterns/setup-pattern/docs-structure-for-branch/` へ移動済みにもかかわらず、actions の一つとして掲載され続けていた記載を削除

---

## [1.2.3] - 2026-08-22

### 修正
- `templates/actions/00_session_end.md`, `templates/actions/doc_letter.md`: 引き継ぎメッセージ内の運用ルールを改善し、「作業を進めていいですか？」と「コミットを進めていいですか？」を分けて確認するよう明文化
  - どちらも「はい！」で返ってくると区別がつかず事故りやすいため
  - コミットのタイミングは通常ユーザーが明示的に指示するという前提を明記

---

## [1.2.2] - 2026-04-18

### 修正
- `templates/actions/01_git_push.md`: チェック対象の記述をフォルダ指定（`docs/letters, docs/notes`）から `git diff --cached` 全差分に変更
  - フォルダ指定だと AI がその範囲のみを対象と解釈し、ソースコードやブランチ専用パスが抜け落ちるリスクがあったため

---

## [1.2.1] - 2026-04-17

### 変更
- `for_branch_init.md` を `docs/actions/` および `templates/actions/` から `patterns/setup-pattern/docs-structure-for-branch/` へ移動
  - ブランチ初期化は「0手順目の一回限りセットアップ」であり ongoing action ではないため
  - `setup-pattern` 配下の責務として分離することで同期コスト・重複を解消
- `for_branch_init.md` の手順を改善
  - 手順2.5 追加: TEMPLATE.md のブランチ専用ディレクトリへのコピーとパス書き換え
  - `check_my_security_prepare_level.md` を action 書き換え対象に追加
  - 元の `docs/notes/, docs/letters/, docs/tasks/` には一切触れない設計に明文化
  - main / master ブランチでは即終了するルールを強化
- `README.md` の関連パターンセクションに `docs-structure-for-branch` へのリンクを追加

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
