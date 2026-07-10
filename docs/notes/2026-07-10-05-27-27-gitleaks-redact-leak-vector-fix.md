---
tags: [setup-securecheck, gitleaks, security, redact, leak-vector]
---

# gitleaks --redact 漏洩経路の発見と修正 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-10
**関連タスク**: ネガティブテスト検証プロトコル強化の設計会話（詳細は [[2026-07-10-05-27-29-negative-test-verification-design]]）から派生した独立修正

## 問題

「ネガティブテストの結果を人間が必ず目視で確認する運用にしてはどうか」という設計会話の中で、ユーザーから「検出された文言そのままをログ・報告に出すと、それ自体が別の漏洩になるのでは」という指摘があった。実際に確認したところ、secretlintとgitleaksで安全側のデフォルトが逆だった。

## 調査結果

- **secretlint**: `--help`で確認すると `--no-maskSecrets   disable masking of secret values; secrets are masked by default.` とある。**デフォルトでマスクされる**（安全側デフォルト）。このパターンのどの呼び出しも`--no-maskSecrets`を渡していないため、secretlint側は元々安全だった。
- **gitleaks**: `--redact uint[=100]  redact secrets from logs and stdout` というオプションが存在するが、**明示的に渡さない限り無効**（危険側デフォルト）。このパターンの全gitleaks呼び出しが`--redact`を渡していなかった:
  - `templates/scripts/pre-commit.js`（実コミット時に`stdio: 'inherit'`で検出値が直接ターミナルに出る）
  - `templates/scripts/security-verify.js`（機能的カナリアテスト、`--test-run`のフルスキャン結果表示）
  - `setup-securecheck.md`の手動コマンド4箇所（Phase 1.5初回スキャン、`secret-scan:full`、ネガティブテスト3.6.5-b）
  - `templates/package.json.example`

## 実害の確認

修正前に`npm run security:verify:testrun`を実行し、`Finding:`/`Secret:`欄に検出値がそのまま表示されることを確認した。`--redact`追加後は同じテストで`Secret: REDACTED`と表示されることを確認した。

副次的な観察として、gitleaksの出力には`Author`/`Email`（コミットした本人の実名・メールアドレス）がそのまま表示される。`--redact`は`Secret`/`Finding`欄のみが対象でこの点はスコープ外。実害は無いと判断し、今回は対応せず記録のみ。

## 解決策

以下7ファイルの全gitleaks呼び出しに`--redact`を追加した:

- `patterns/setup-pattern/setup-securecheck/templates/scripts/pre-commit.js`
- `patterns/setup-pattern/setup-securecheck/templates/scripts/security-verify.js`（カナリアテスト・testrunの両方）
- `patterns/setup-pattern/setup-securecheck/setup-securecheck.md`（Phase1.5・secret-scan:full・ネガティブテスト3.6.5-b、計4箇所）
- `patterns/setup-pattern/setup-securecheck/templates/package.json.example`
- `scripts/pre-commit.js`（このリポジトリ自身）
- `scripts/security-verify.js`（このリポジトリ自身）
- `package.json`（このリポジトリ自身）

併せて`setup-securecheck.md`のネガティブテスト（3.6.5）に、「確認結果をAIに報告する際は要約行のみとし、生出力を貼り付けない」という注意書きを追加した（`--redact`があってもテスト用カナリア以外の値が混入するリスクを避けるため）。

### 副次的発見: リポジトリ自身のpackage.jsonの同期漏れ

このリポジトリ自身の`package.json`の`secret-scan:full`が、前セッションのA4（`detect`/`protect`非推奨対応）の対象から漏れており、旧式の`./bin/gitleaks detect --source . -v`（`--config gitleaks.toml`指定なし）のままだった。今回`git . --config gitleaks.toml --redact`に統一した。

## 検証

```bash
npm run security:verify
# 12/12 passed

npm run security:verify:testrun
# 既知の合成シークレット検出時、Secret: REDACTED と表示されることを確認

npm run secret-scan:full
# secretlint のマスク表示（*****）を確認
```

## 学び

- 「ツールが検出できるか」だけでなく「検出結果の出力自体が新しい漏洩経路にならないか」も確認が必要
- ツールによってマスクのデフォルト挙動が逆（secretlintは安全側デフォルト、gitleaksは危険側デフォルト）なため、個別に`--help`で確認する必要がある
- 「AIに証拠を見せる/貼ってもらう」運用を設計する際は、その証拠自体に何が含まれるかを先に確認しないと、検証の仕組みが新たな漏洩経路になりかねない

## 関連ドキュメント

- [ネガティブテスト検証プロトコル強化の設計会話](./2026-07-10-05-27-29-negative-test-verification-design.md)
- [gitleaks検出ルール0件バグ修正 実装ノート](./2026-07-09-23-14-00-setup-securecheck-v2-0-2-gitleaks-fixes-implementation.md)

---

**最終更新**: 2026-07-10
**作成者**: AI (Claude) + 人間レビュー
