---
tags: [docs-structure, setup-securecheck, installer, setup-pattern, idempotency]
---

# docs-structure-and-securitycheck 統合インストーラー実装

**作成日**: 2026-07-09
**関連タスク**: [統合インストーラー設計ノート](./2026-07-09-00-00-00-docs-structure-and-securitycheck-installer-design.md)を指示書として実装

## 問題

前回セッションで `docs-structure` + `setup-securecheck` の統合インストーラーを設計したが、`setup-all.js` 本体は未実装のまま持ち越しになっていた。設計ノートの5要件を反映しつつ実装し、実際のクリーンな環境で動作確認する必要があった。

## 解決策

### 実装したファイル

- `patterns/setup-pattern/docs-structure-and-securitycheck/setup-all.js` — 統合インストーラー本体
- `patterns/setup-pattern/docs-structure-and-securitycheck/README.md` — ワンショット指示 + 構成が違う理由
- `patterns/setup-pattern/README.md` — 一覧・ディレクトリ構成図にエントリ追加

**実装場所**: `patterns/setup-pattern/docs-structure-and-securitycheck/setup-all.js`

### 設計5要件の反映

1. **`detect-version.js` ロジックの再利用**: `setup-all.js` 内に `detectHookVersion()` として同じ判定条件（`hasHusky`/`hasLintStaged`/`huskyDirExists`/`preCommitHasFullScan`/`preCommitHasStagedOnly`）を移植。v1 検出時は自動移行せず中断し、移行ガイド取得コマンドを案内する
2. **ユーザー領域 vs 固定値の区別**: `.secretlintrc.json`/`gitleaks.toml` は「無ければ作成、あれば触らない」、`simple-git-hooks.pre-commit` の値は「常に `node scripts/pre-commit.js` と一致すべき固定値」として検証し、異なれば修正（`FIXED` カテゴリ）
3. **1コマンドへの集約**: `setup-all.js` が内部で `execSync('npx degit ...')` を2回呼び、`docs-structure/templates` と `setup-securecheck/templates` を `tmp/setup-all-fetch/` に取得。人間/AI が叩くのは `degit` 1回 + `node` 1回の2行のみ
4. **独立配置**: `docs-structure-and-securitycheck/` 直下に `README.md` + `setup-all.js` のみを配置（`setup_xxxx.md` + `templates/` という既存の「構成の原則」とは意図的に異なる。理由はパターン内 README 冒頭に明記）
5. **`.logs/setup-all.log` への4カテゴリ記録**: `CREATE`/`SKIP`/`MERGE`/`FIXED` を section 単位でグルーピングし、実行のたびに**上書き**で記録

### 主なポイント

1. `runOrAbort()` 等の内部ヘルパーで `.git`/`package.json` 初期化 → テンプレート取得 → docs 配置 → secretlint/gitleaks 設定 → npm scripts → scripts 配置 → gitleaks バイナリ → simple-git-hooks → `.gitignore` の順に処理し、各ステップを `section()`/`record()` で `.logs/setup-all.log` に記録する構造にした
2. `--strict`（package.json が無ければ中断）、`--no-hooks`（pre-commit 自動化をスキップ）の2フラグを実装
3. セットアップ完了後は「`npm run secret-scan:full` を実行し、検出結果の解釈は人間が行ってください」という案内のみを出して止まる（検出結果の解釈は自動化しない、という設計方針を維持）

### クリーンな環境での動作確認

`/tmp` に使い捨てプロジェクトを作り、以下のシナリオを実地で検証した：

- 新規プロジェクトへの初回実行（`bin/gitleaks` の実ダウンロードを含め全ステップ成功）
- 同一プロジェクトへの再実行（全項目 `SKIP`）
- `--strict`（package.json 無しで中断）
- v1(husky) 検出時の中断 + 移行ガイド取得コマンドの案内
- `--no-hooks`（pre-commit 自動化のみスキップ）
- end-to-end のネガティブテスト（シークレット混入コミットが実際にブロックされる）
- `npm run security:verify` で 10/11 passed（`.logs/pre-commit.log` は初回コミット後にしか作られないため、これは仕様通り）

## 学び

- **設計ノートをそのまま指示書として渡せば実装がぶれない**: 前セッションで5要件を明文化しておいたことで、実装時に判断に迷う場面がほとんどなかった
- **クリーンな環境での実地検証は `/tmp` に使い捨てプロジェクトを作るだけで十分**: `git init` + `npm init -y` から始めて実際に `node setup-all.js` を通しで走らせることで、机上のレビューでは見えない挙動（gitleaks の実ダウンロード、pre-commit フックの実ブロックなど）を確認できた

## 今後の改善案

- 想定トークン削減効果（8〜9割減の見込み）の実測は次セッション以降に持ち越し
- 実装直後の「既存プロジェクトへの再適用」検証で見つかった追加の穴は別ノート（[docs-structure-and-securitycheck 再適用時の冪等性の穴](./2026-07-09-00-03-00-docs-structure-and-securitycheck-reapply-idempotency-holes.md)）を参照

## 関連ドキュメント

- [統合インストーラー設計ノート](./2026-07-09-00-00-00-docs-structure-and-securitycheck-installer-design.md)
- [docs-structure-and-securitycheck 再適用時の冪等性の穴](./2026-07-09-00-03-00-docs-structure-and-securitycheck-reapply-idempotency-holes.md)
- [setup-securecheck 既存プロジェクトへの再適用で見つかった2つの穴](./2026-07-08-00-00-01-setup-securecheck-reapply-idempotency-holes.md)

---

**最終更新**: 2026-07-09
**作成者**: AI (Claude) + 人間レビュー
