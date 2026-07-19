# docs-structure-and-securitycheck - 統合インストーラー

`docs-structure` と `setup-securecheck` を1回の `node` 実行でまとめて導入する統合インストーラー

---

## ⚠️ このパターンだけ構成が違う理由

`patterns/setup-pattern/README.md` の「構成の原則」（`README.md` + `setup_xxxx.md` + `templates/`）とは異なり、このパターンは **`README.md` + `setup-all.js` のみ** で構成されています。

- `docs-structure` は `npx degit` 一発で完結する内容のため、そもそも AI が手順書を読んで案内する必要がない
- `setup-securecheck` は「配置・依存関係・スクリプト設置」のような機械的な部分と、「検出されたシークレットが本物かどうかの判断」のような人間の意思決定が必要な部分に分かれている。前者はコード化でき、後者はコード化すべきではない
- そこで、機械的な部分だけを `setup-all.js` に切り出して自動化した。人間の判断が必要な部分（検出結果の解釈）は、従来通り [`setup-securecheck.md`](../setup-securecheck/setup-securecheck.md) をそのままチェック層として参照する（手順書を二重管理してバージョンズレを起こさないため）

つまりこのパターンは `docs-structure` / `setup-securecheck` を置き換えるものではなく、両者の「配線」部分だけを自動化する薄いラッパーです。

---

## 🚀 ワンショット導入

> **🤖 AIへのワンショット指示（コピペ用）**
>
> ```
> https://github.com/1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/docs-structure-and-securitycheck
> このパターンを使って docs-structure + setup-securecheck をまとめて導入したいです。
>
> npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/docs-structure-and-securitycheck ./tmp/setup-all
> node ./tmp/setup-all/setup-all.js
> ```

`setup-all.js` は実行時に内部で `docs-structure/templates` と `setup-securecheck/templates` を追加で `degit` 取得するため、人間/AI が叩くコマンドはこの2行だけで完結します。

### フラグ

| フラグ | 効果 |
|---|---|
| `--strict` | `package.json` が無い場合に `npm init -y` せず中断する |
| `--no-hooks` | pre-commit 自動化（simple-git-hooks 導入）をスキップする |

```bash
node ./tmp/setup-all/setup-all.js --no-hooks
```

---

## 🎯 自動化する部分・しない部分

### 自動化する部分（`setup-all.js` が担当）

| ステップ | 冪等性の担保方法 |
|---|---|
| `.git` / `package.json` の初期化 | 無ければ作成、あれば触らない |
| 既存フック（husky等・旧`scripts/`レイアウト）検出 | `.security-check/lib/environment.js` の`detectLegacyV1`/`detectLegacyV2`と同じ判定ロジック。v1（husky/lint-staged）・v2（`.security-check/`移行前の旧`scripts/`レイアウト）のどちらを検出した場合も自動移行せず中断し、移行ガイド取得コマンドを案内する（`bin/gitleaks`やログの移設を伴うv2→v3移行は自動化のリスクが高いため、既存の`MIGRATION_GUIDE_v2.1.0_to_v3.0.0.md`/`migrate-to-v3.sh`に委ねる） |
| `docs/` 配置 | ファイル単位で差分コピー（既存ファイルは触らない）。ディレクトリの存在だけでは判定しない（中断されたセットアップの再実行でも不足分を補完できるようにするため） |
| `.secretlintrc.json` / `gitleaks.toml` 配置 | ファイルが無い時だけコピー（あれば触らない＝ユーザー領域を尊重） |
| secretlint / simple-git-hooks インストール | 依存関係の有無を確認してからインストール |
| `.security-check/`（`cli.js` + `lib/*.js` + `README.md`）配置 | `docs/`と同じくファイル単位の差分コピー。中断された再実行でも不足分だけ補完する |
| gitleaks バイナリ | 存在チェックだけで済ませず `.security-check/bin/gitleaks version` で動作確認。壊れていれば `node .security-check/cli.js install-gitleaks` の自己修復（再インストール）を必ず呼び出す |
| npm scripts 追記 | 既存キーを尊重してマージ（`scripts.security: "node .security-check/cli.js"` の1行のみ） |
| `simple-git-hooks.pre-commit` の値 | **常に `.security-check/cli.js` を指す値として検証し、異なれば修正する**（`node .security-check/cli.js pre-commit`） |
| `.gitignore` 追記 | 行単位で重複チェックしてから追記（`.security-check/bin/`, `.security-check/logs/`） |

### 自動化しない部分（人間の判断が必要）

| 対象 | 理由 |
|---|---|
| secretlint / gitleaks の初回スキャン結果の解釈 | 本物のシークレットかプレースホルダーか、判断が必要 |
| 検出時の対応（無効化・allowlist追加・履歴削除） | 人間の意思決定そのもの |

`setup-all.js` はセットアップ完了後、「`npm run security -- verify --test-run` を実行し、検出があれば `setup-securecheck.md` の判断表を見て対応してください」という案内だけを出して止まります。

---

## 📋 実行ログ

`.security-check/logs/setup-all.log` に実行結果が **上書き** で記録されます（累積履歴ではなく直近1回のスナップショット）。`.security-check/logs/` は`.gitignore`で除外されるローカル専用ディレクトリのため、`setup-securecheck`本体の実行ログ（`pre-commit.log`）と同じ場所に置くことで誤コミットを防いでいます。

```
[docs-structure]
  SKIP    docs/notes, docs/letters, docs/tasks, docs/actions（既に存在・不足ファイルなし）

[secretlint / gitleaks 設定]
  SKIP    .secretlintrc.json（既に存在）
  CREATE  gitleaks.toml

[simple-git-hooks]
  FIXED   package.json simple-git-hooks.pre-commit が "node .security-check/cli.js pre-commit || true" だったため "node .security-check/cli.js pre-commit" に修正しました
```

4カテゴリの意味：

| カテゴリ | 意味 |
|---|---|
| `CREATE` | 存在しなかったので新規作成した |
| `SKIP` | 既に存在したのでそのまま何もしなかった |
| `MERGE` | 既存の設定に新しいキー・行を追加した |
| `FIXED` | 既存の値が期待値と異なっていたため修正した |

`FIXED` を独立カテゴリにしているのは、「AI ウィザードの文言修正では既存の壊れた値（`|| true` による exit code 握りつぶし等）を温存してしまう」問題をコードで確実に潰すためです。

---

## 🔗 関連パターン

- [docs-structure](../../docs-structure/) - ドキュメント構造パターン（本体）
- [setup-securecheck](../setup-securecheck/) - セキュリティチェック導入ガイド（チェック層はこちらを参照）
- [setup-securecheck/version-detect](../setup-securecheck/version-detect/) - 既存フックのバージョン検出ロジック（`setup-all.js` が再利用）

---

## 📝 ライセンス

MIT License - 自由に使用・改変・配布できます
