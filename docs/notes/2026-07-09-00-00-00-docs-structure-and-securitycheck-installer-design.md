---
tags: [docs-structure, setup-securecheck, installer, design, setup-pattern]
---

# docs-structure-and-securitycheck 統合インストーラー設計

**作成日**: 2026-07-09
**関連タスク**: docs-structure + setup-securecheck の統合インストーラー化

## 背景・目的

`docs-structure` と `setup-securecheck` はそれぞれ以下の理由からかなり成熟しており、コーディングエージェントを介さず人間が直接実行できるレベルに達している。

- `docs-structure`: 本質的に `npx degit` 一発で完結するため、AI を介する意味がほぼない
- `setup-securecheck`: もともと「確実に動く層（Node.jsスクリプト・テンプレート）」と「揺れる層（AIウィザード案内）」を分離する四層構造の思想で作られており、手順書自体がコマンド・判断基準表・次のステップの3点セットで書かれているため、AI なしでも人間が読み解ける

一方で、2つのパターンを毎回コーディングエージェントに個別依頼するのはトークン消費や手間がかさむ。そこで、「配線・セットアップ」にあたる機械的な部分は**インストーラー型で自動化**し、「本物のシークレットかどうかの判断」など**人間の意思決定が必要な部分だけ従来通りのチェック層（Markdown手順書）として残す**、2層構造の統合パターンを設計した。

外部で作成した原案をベースに、既存リポジトリの実装と照らし合わせてレビューし、5つの論点を反映して最終設計とした。

## レビューで見つかった論点と解決

### 論点1: `version-detect/scripts/detect-version.js` の再利用

原案のエラーハンドリング表にあった「既存フック（huskyなど）検出 → 警告・移行ガイド誘導」は、すでに `patterns/setup-pattern/setup-securecheck/version-detect/scripts/detect-version.js` として実装済み（`hasHusky` / `hasLintStaged` / `.husky` 検出 → v1/v2.0.0/v2.0.1/unknown 判定）。

**決定**: `setup-all.js` の Step 0 でこの検出ロジックをゼロから再実装せず、既存スクリプトの判定関数を移植・再利用する。二重実装によるロジックのズレを防ぐ。

### 論点2: 「ユーザー領域の設定」と「常に一致すべき固定値」の区別

[前回の一連の修正](./2026-07-08-00-00-01-setup-securecheck-reapply-idempotency-holes.md)で得た教訓を反映。対象によって扱いを分ける：

| 対象 | 性質 | 扱い |
|---|---|---|
| `.secretlintrc.json` の `ignores` / `gitleaks.toml` の `allowlist` | ユーザーが正当にカスタマイズする領域 | 存在すれば触らない（スキップ） |
| npm scripts のキー自体 | 自由記述だが追加は安全 | 既存キー尊重でマージ |
| `simple-git-hooks.pre-commit` の値 | **常に `node scripts/pre-commit.js` と完全一致すべき固定値** | **既存値が異なれば検証して修正する** |

コードによる自動化はここでこそ価値を発揮する。AI ウィザードの文言修正では「毎回正しく判断する」ことしか担保できなかったが、コードなら**毎回確実に強制できる**。これが握りつぶしバグ再発を構造的に防ぐ核心。

### 論点3: README のワンショット指示を1コマンドに統合

原案は「degit を2回 → node 実行」という3手構成だったが、これは `docs-structure-for-branch` で先日「2ステップ→1ステップ」に整理したのと同じ穴。

**決定**: `setup-all.js` 自身が `execSync('npx degit ...')` で `docs-structure/templates` と `setup-securecheck/templates` を内部的に取得する。人間/AI が叩くコマンドは以下の1つに集約：

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/docs-structure-and-securitycheck ./tmp/setup-all
node ./tmp/setup-all/setup-all.js
```

### 論点4: README 内パス表記の破綻を修正

原案の `node ./tmp/security-setup/../setup-all.js` は `./tmp/setup-all.js` に潰れてしまい、`setup-all.js` の実際の配置場所が未確定だった。論点3の1コマンド化と合わせて解消。`setup-all.js` は独立フォルダ `docs-structure-and-securitycheck/` に置き、そこから内部的に他2パターンを degit で取得する構成に整理。

### 論点5: 実行ログ `.logs/setup-all.log` の追加

人間が確認しやすいよう、実行結果をログファイルに残す設計を追加。

- **配置**: `.logs/setup-all.log`（`setup-securecheck` の `pre-commit.js` がすでに `.logs/` を使い `.gitignore` 登録済みのため相乗り）
- **形式**: プレーンテキスト、実行のたびに**上書き**（累積履歴ではなく「直近1回の完全なスナップショット」）
- **内容**: `CREATE` / `SKIP` / `MERGE` / `FIXED` の4カテゴリで記録し、特に `FIXED`（既存値が期待値と異なったため修正した）を独立カテゴリとして明示する

```
[docs-structure]
  CREATE  docs/notes, docs/letters, docs/tasks, docs/actions

[secretlint / gitleaks 設定]
  SKIP    .secretlintrc.json（既存を尊重、変更なし）
  CREATE  gitleaks.toml

[simple-git-hooks]
  FIXED   package.json simple-git-hooks.pre-commit が "... || true" だったため
          "node scripts/pre-commit.js" に修正しました
```

`FIXED` を分けることで「なかったから作った」「あったからそのまま」「あったけど間違っていたから直した」を人間が一目で区別できる。

## 配置場所と構成原則からの差分

`patterns/setup-pattern/` 配下（`docs-structure-for-branch` / `setup-securecheck` と並列）に `docs-structure-and-securitycheck/` を新設する。

ただし `patterns/setup-pattern/README.md` に明記された「構成の原則」（`README.md` + `setup_xxxx.md` + `templates/`）とは意図的に異なる構成にする：

```
docs-structure-and-securitycheck/
├── README.md      # ワンショット指示 + 全体像
├── setup-all.js   # 統合インストーラー
└── CHANGELOG.md    # 任意
```

`setup_xxxx.md`（手順書）と `templates/` を持たず、既存の `setup-securecheck.md` をチェック層としてそのまま参照させる（二重管理によるバージョンズレを防ぐため）。この差分の理由は新パターンの README 冒頭に明記する。実装後は `patterns/setup-pattern/README.md` の「利用可能なセットアップガイド」一覧にもエントリを追加する。

## 全体設計

```
setup-all.js
  ├─ docs-structure: 全自動（判断不要なので）
  └─ setup-securecheck:
        ├─ Phase 1-2 の「配置・依存関係・スクリプト設置」→ 全自動
        ├─ Phase 3 の「pre-commit 自動化」→ 全自動（フラグでON/OFF）
        └─ スキャン結果の解釈・判断 → 従来通り人間が手動（自動化しない）
```

### 自動化する部分（インストーラー層）

| ステップ | 元の Phase | 冪等性の担保方法 |
|---|---|---|
| docs/ 配置 | docs-structure全体 | `docs/notes` 等が存在すればスキップ |
| `.secretlintrc.json` / `gitleaks.toml` 配置 | 1.1 | ファイルが無い時だけコピー（あれば触らない） |
| secretlint インストール | 1.2 | `npm ls` で存在確認してから install |
| gitleaks インストール | 1.4 | `install-gitleaks.js` が元々冪等 |
| npm scripts 追記 | 2.1 | 既存キー尊重でマージ |
| scripts/*.js 配置 | 2.2 | ファイルが無い時だけコピー |
| simple-git-hooks 導入・pre-commit設定 | 3.1〜3.4 | **値を検証し、期待値と異なれば修正**（論点2） |
| `.gitignore` 追記 | 3.5 | 行単位の重複チェック |

### Step 0: 前提条件の自動整備

- `.git` が無ければ `git init`
- `package.json` が無ければ `npm init -y`（`--strict` 指定時は中断）
- 既存フック検出は `detect-version.js` のロジックを再利用（論点1）
- 全ての処理を `.logs/setup-all.log` に記録（論点5）

### 自動化しない部分（チェック層）

| ステップ | 理由 |
|---|---|
| secretlint / gitleaks 初回スキャン結果の解釈 | 本物のシークレットかプレースホルダーか、判断が要る |
| 検出時の対応（無効化・allowlist追加・履歴削除） | 人間の意思決定そのもの |

インストーラーは最後に「セットアップ完了。次は `npm run secret-scan:full` を実行し、検出があれば `setup-securecheck.md` の判断表を見て対応してください」という導線だけ出して止まる。

## 想定トークン削減効果（概算・未実測）

- Before: Phase 0〜3 だけで最低でも10数ターンの往復
- After: AI の仕事は実質「degit 1回 → `node setup-all.js` 1回 → 出力サマリーを読む」の2〜3手
- 検出0件のクリーンなケースで体感8〜9割減、判断が必要なケースでも6〜7割減程度を見込む（実装後に実測して検証する）

## 今後の改善案

- 実装は本ノートを指示書として別のコーディングエージェントに委譲する
- 実装後、`patterns/setup-pattern/README.md` の一覧・ディレクトリ構成図を更新する
- トークン削減効果を実測し、概算との差分を記録する

## 関連ドキュメント

- [setup-pattern README](../../patterns/setup-pattern/README.md)
- [docs-structure-for-branch 発動プロンプト整理](./2026-06-15-00-00-00-docs-structure-for-branch-activation-redesign.md)
- [setup-securecheck 既存プロジェクト再適用時の冪等性の穴](./2026-07-08-00-00-01-setup-securecheck-reapply-idempotency-holes.md)
- [setup-securecheck version-detect](../../patterns/setup-pattern/setup-securecheck/version-detect/)

---

**最終更新**: 2026-07-09
**作成者**: AI (Claude) + 人間レビュー
