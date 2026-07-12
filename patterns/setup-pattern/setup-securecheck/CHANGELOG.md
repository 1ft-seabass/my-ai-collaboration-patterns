# Changelog

## [3.0.0] - 2026-07-12

### 変更（破壊的）

- **`.security-check/` への構造集約**
  - `scripts/pre-commit.js` / `scripts/security-verify.js` / `scripts/install-gitleaks.js` / `bin/gitleaks` / `.logs/` を、プロジェクトルート直下の `.security-check/` フォルダ1つに集約（`.husky/`・`.github/`と同様、通常は編集しない「ツール領域」として扱う）
  - `gitleaks.toml` / `.secretlintrc.json` はユーザーが直接編集する設定ファイルのため、集約対象から除外しリポジトリルートに残した
  - 背景: gitleaksの有無判定が `pre-commit.js` と `security-verify.js` に別々に（別基準で）実装されており、この「接点の分散」自体が「gitleaksが導入されていないのに気づかれない」状態を生む土壌になっていた。判定ロジックを `.security-check/lib/environment.js` に一本化し、両者が同じ結果を返すようにした

- **`cli.js` 単一エントリポイントの新設**
  - `package.json` の npm scripts を `security:verify` / `security:verify:simple` / `security:verify:testrun` / `security:install-gitleaks` / `secret-scan` / `secret-scan:full` の6行から `"security": "node .security-check/cli.js"` の1行に統一
  - サブコマンド: `verify [--simple|--test-run]` / `pre-commit` / `install-gitleaks` / `uninstall [--yes]`

- **gitleaks不在時のフェイルクローズ化**
  - 従来、gitleaksバイナリが見つからない場合は警告を出すだけでコミットを続行していた（フェイルオープン）。これは「secretlintのみで守られている」半端な状態が気づかれないまま運用されるリスクがあるため、コミットをブロックする挙動（フェイルクローズ）に変更
  - 中途半端な状態を許容するオプトイン設定は用意しない方針とした（「全部入れる」か `uninstall` で「全部外す」かの二択）

- **アンインストールコマンドの新設**
  - `node .security-check/cli.js uninstall` を新設。`.security-check/`・package.jsonの該当エントリ・git hookを除去する。デフォルトはドライラン、`--yes`で実行
  - `gitleaks.toml` / `.secretlintrc.json` は自動削除しない（ユーザー編集対象のため）
  - v1/v2構成のアンインストールは対象外（先にv3へ移行してから使う）

- **`verify` のヘルスチェック項目数を14→15に変更**
  - `.security-check/` ディレクトリそのものの存在チェックを追加
  - 既存14項目のパス表記・メッセージを新構造に合わせて更新

### 追加

- **v2→v3マイグレーションガイド** (`migration/MIGRATION_GUIDE_v2.1.0_to_v3.0.0.md`, `migration/migrate-to-v3.sh`)
  - `version-detect/scripts/detect-version.js` に v3検出・v2旧レイアウト検出を追加し、該当ガイドへ誘導する

### 背景

ユーザーから「協業者に半端な検出体制で参加してもらうリスク」の相談を受け、設計を再検討。詳細は `docs/notes/2026-07-12-10-15-49-setup-securecheck-v3-restructuring-plan.md` を参照。

## [2.1.0] - 2026-07-12

### 追加

- **毎コミット自動カナリア自己検証**
  - `pre-commit.js`（テンプレート＋このリポジトリ自身のデプロイ済みコピー両方）に、検出ルールが今も生きているかを毎コミット自動で（人間が意識せずとも）証明する仕組みを追加
  - gitleaks: 合成シークレットを git index にのみ blob として注入し（作業ツリーには一切書かない）、既存の `--staged` スキャン1回に `--report-format json --report-path` を追加してカナリアと実ファイルの検出結果をファイル単位で区別。追加のプロセス起動コストなし
  - secretlint: ファイルパスしか受け付けないため、cwd 配下に一時ファイルを書いて既存のスキャン対象リストに混ぜ込み、`--format json` でファイル単位に判定
  - カナリアが検出できなかった場合（検出ルールが機能していない状態）はコミットをブロックする（フェイルクローズ）。ユーザーの実ステージ内容とカナリアのパス名が偶然衝突した場合のみ自己検証をスキップし、実コミットはブロックしない
  - `process.exit()` を要所で直接呼ぶ既存構造をやめ、`try/catch/finally` を1回だけ通してから最後に単一の `process.exit()` にまとめることで、例外発生時もカナリアの後片付け（index からの除去・一時ファイルの削除）を保証
  - 結果は `.logs/pre-commit.log` の新フィールド `autoCanary: { gitleaks, secretlint }`（各 `ok` / `failed` / `cleanup-failed` / `skipped`）に記録

- **`security-verify.js` check#14「毎コミット自動カナリア自己検証の実行痕跡」を追加（13項目 → 14項目）**
  - `.logs/pre-commit.log` の直近エントリの `autoCanary` フィールドを確認し、自己検証が実際に機能していたかを事実に基づいて判定する（check#13「ネガティブテスト実行痕跡」と同じ設計方針）
  - check#13（Step 3.6.5 の手動ネガティブテストの実行痕跡）は役割が異なるため維持。手動テストはいつでも即座に実行できる検証手段として、自動検証は毎コミットの構造的な保証として、それぞれ独立した価値を持つと判断した

## [2.0.3] - 2026-07-10

### 修正

- **git worktree 構成での pre-commit フック検出の誤検知を修正**
  - `security-verify.js` の check#3（存在）・check#8（内容）が `.git/hooks/pre-commit` を決め打ちパスで参照しており、worktree では `.git` がgitdirポインタファイルになるため、フックが正しく導入・動作していても常に❌判定になっていた
  - `git rev-parse --git-path hooks/pre-commit` で実パスを解決するよう修正（hooks は全 worktree で共有される実体を指すため、mainでもworktreeでも正しく検出できる）
  - 同じ決め打ちパスが `docs-structure-and-securitycheck/setup-all.js` の自動インストーラーにもあったため合わせて修正（SKIP/CREATEログ表示のみに影響、実害はなし）

- **`setup-all.js`（自動インストーラー）が worktree ガード式を無言で上書きする問題を修正**
  - `simple-git-hooks.pre-commit` の値が `"node scripts/pre-commit.js"` と完全一致しないと問答無用で上書きしていたため、複数 worktree で hooks を共有し一部の worktree にしか `scripts/pre-commit.js` が無い構成で使う存在ガード式（`if [ -f scripts/pre-commit.js ]; then ... fi`）を意図的に使っているプロジェクトに対して再実行すると、ガードが剥がされ未導入側の worktree でコミットが失敗するようになっていた
  - `security-verify.js` の check#8 と同じ基準（`pre-commit.js` を呼んでおり `|| true` 等の抑制が無ければ良し）による実質判定に変更

- **`setup-securecheck.md` ステップ3.3にworktreeガード式の許容条件を明記**
  - 「`pre-commit` の値が完全一致するか確認し、異なれば修正する」という既存の判断基準が、複数 worktree 構成での意図的なガード式を一律「不具合」として扱ってしまうケースに対応する注記を追加

- **README.md に残っていた古いヘルスチェック項目数（12/12・12項目）を13に修正**
  - v2.0.2 で check#13 を追加した際に同期が漏れていた

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

- **gitleaks 呼び出しに `--redact` を追加し検出値の漏洩経路を防止**
  - secretlint はデフォルトでマスクされるが、gitleaks は `--redact` を明示しないと検出値がそのまま標準出力に出ることが判明
  - `pre-commit.js`・`security-verify.js`（機能的カナリアテスト・testrun）・`setup-securecheck.md` の手動コマンド・`package.json.example` の全gitleaks呼び出しに追加
  - `setup-securecheck.md` のネガティブテストに「確認結果は要約行のみ報告し、生出力を貼り付けない」注意書きを追加

### 追加

- **既存導入プロジェクト向けの安全な再適用（A6）**
  - Phase 0 に「既存導入かつ検出ルール0件バグに該当する場合」の分岐を追加。`gitleaks.toml` が未カスタマイズか診断し、カスタマイズ済みの場合は独自設定を保持したまま `[extend]` 追加と `tmp/.*` アンカー化のみを行う決定論的パッチスクリプト（`templates/scripts/patch-gitleaks-toml.js`、新規）を案内する
  - 独立したマイグレーションガイド一式ではなく、既存のワンショット指示（README）の再利用＋Phase 0分岐という形に設計（詳細は `docs/notes/2026-07-10-05-27-29-negative-test-verification-design.md`）

- **ネガティブテスト実行痕跡の検証（ヘルスチェック 12項目 → 13項目）**
  - `pre-commit.js` が `.test-secret-canary`（ステップ3.6.5のネガティブテスト用ファイル）のステージを検知した場合、実行ログに通常のコミットとは別の `type: "canary"` エントリを記録するよう変更
  - `security-verify.js` に新規 check#13「ネガティブテスト実行痕跡」を追加。集計数字ではなく、ネガティブテストが実際に実行されブロックに成功した記録の有無で判定する

- **husky/lint-staged（v1構成）の先行検知**
  - README共通の「新規/既存プロジェクト共通」ワンショット指示は `version-detect/` を経由せず直接 `security-verify.js` を呼ぶため、v1(husky)構成のプロジェクトが素通りし、Phase 1の新規導入フローが既存のhusky設定に重ねてsimple-git-hooksを導入してしまうリスクがあった
  - `security-verify.js`（ヘルスチェック本体）に `version-detect/scripts/detect-version.js` と同一の判定ロジックを統合し、該当時は最初に警告を表示するよう変更

- **導入ガイド自身の既知の誤検知を抑制**
  - `setup-securecheck.md`「パターンB: 値を明確なダミーに変更」のBefore例（`sk-`接頭辞のダミー値）に `gitleaks:allow secretlint-disable-line` を追加し、このリポジトリ自身の`security:verify:testrun`での既知の誤検知を解消（リネーム前の古いコミットに残る同一箇所は履歴書き換えが必要なコストに見合わないため対象外とした）

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
