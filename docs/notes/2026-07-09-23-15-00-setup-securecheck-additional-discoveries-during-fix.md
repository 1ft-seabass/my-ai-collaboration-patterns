---
tags: [setup-securecheck, gitleaks, idempotency, actions, silent-failure]
---

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-09
**関連タスク**: setup-securecheck v2.0.2 修正、docs/actions 運用

## 問題

[修正実装ノート](./2026-07-09-23-14-00-setup-securecheck-v2-0-2-gitleaks-fixes-implementation.md) の作業中、ユーザーから提示された4つの問題とは別に、3件の独立した問題が見つかった。前回セッション（`docs-structure-and-securitycheck`）でも「新規導入は大丈夫、で満足せず既存の壊れた状態への再適用を検証する」パターンで2つの穴が見つかっており、今回も同じスタイルで追加の穴が見つかった形になる。

## 発見1: `gitleaks.toml` allowlist の `tmp/.*` が未アンカーで誤爆する

### 経緯

A3（security-verify.jsの機能的カナリアテスト）を実装した際、修正済みの `gitleaks.toml`（`[extend]`あり）でテストしたにもかかわらず、カナリアテストが「検出されなかった」と報告する現象が発生した。

### 原因

カナリアの一時ディレクトリを `path.join(process.cwd(), '.security-verify-canary')` という**絶対パス**でgitleaksに渡していたところ、テスト用の隔離リポジトリを `/tmp/verifytest-repo` に置いていたため、絶対パス文字列 `/tmp/verifytest-repo/.security-verify-canary/canary.env` が `gitleaks.toml` の allowlist regex `'''tmp/.*'''`（アンカー無し）に部分一致し、ファイルごと除外されていた（scanned ~0 bytes）。

さらに検証したところ、この正規表現は絶対パスに限らず、**相対パスであっても "tmp/" という部分文字列を含むディレクトリ名なら何でもマッチしてしまう**ことが判明した（例: `src/mytmp/secret.env` も誤って除外される）。実際に git repo を作って確認:

```
[allowlist] paths = ['''tmp/.*''']  # 未アンカー
→ tmp/should-be-excluded.env: 除外される（意図通り）
→ src/mytmp/should-be-detected.env: 除外される（意図しない誤爆）
```

### 対応

`'''tmp/.*'''` を `'''^tmp/.*'''` にアンカーし、リポジトリルート直下の `tmp/` のみを対象にするよう修正した。修正後、同じ2ファイルで `tmp/` は除外・`src/mytmp/` は検出される（`RuleID: github-pat`）ことを確認した。

**実装場所**: `patterns/setup-pattern/setup-securecheck/templates/gitleaks.toml`

**注意**: `node_modules/.*`・`dist/.*`・`.git/.*` は意図的に未アンカーのまま残した。これらはモノレポ構成で複数階層に出現しうるディレクトリであり、`tmp/.*` とは事情が異なる（`tmp/security-setup/` というウィザード専用の単一トップレベルディレクトリを指すためだけに存在するのが `tmp/.*` エントリ）。

**実害の範囲**: このリポジトリ自体のパス（`/home/node/workspace/...`）は該当しないため影響なし。ただしCI/CDランナーやDockerコンテナで作業ディレクトリが `/tmp/...` 配下になる環境では、この allowlist がプロジェクト全体を誤って除外する可能性があった。

## 発見2: `docs/actions/01_git_push.md` のチェック対象コマンドが実運用とズレている

### 経緯

ユーザーから「プッシュ前に新しいセッションでAIによる手動チェックをかけている（`01_git_push.md`）が、これがあれば実害はマシだったか」という質問を受け、指示書の内容を確認した。

### 原因

`01_git_push.md` は `git diff --cached` を対象にドキュメント類の機密情報をチェックする指示書。しかし、このプロジェクトの実際のフロー（`docs/actions/git_commit.md`）は「**コミットのみで完了、プッシュはせず**」と明記されており、コミット済み・ステージ無しの状態でセッションが終わる。`01_git_push.md` が想定する「別セッションでプッシュ前に確認する」タイミングでは、ステージには何も無く `git diff --cached` は必ず空になる。

このリポジトリで実際に確認:
```
git diff --cached --stat → 空
git log origin/main..HEAD → 318e057 が push 待ちで1件存在
```

つまり `01_git_push.md` を実行しても、pushしようとしている実体（未pushコミット）を一度も見ないまま「✅ セキュリティチェック完了。プッシュ安全。」と報告してしまう構造になっていた。

ユーザーへの確認の結果、実際の運用では毎回AIが指示書の記述を字面通りには実行せず、`git log origin/main..HEAD` 等で実際にpush対象となる未pushコミットを見て確認していたため、**実害は出ていなかった**（記述と実態がズレていただけ）ことが判明した。

### 対応

未着手（B1として次回対応予定）。対象コマンドを `git diff --cached` から、未pushコミットの差分（`git diff @{u}...HEAD` 相当、upstream未設定時のフォールバックを明記）に変更する必要がある。

## 発見3: このリポジトリ自身の `scripts/pre-commit.js`・`scripts/security-verify.js` がテンプレートより古いバージョンのまま

### 経緯

A5でこのリポジトリ自身の `gitleaks.toml` を修正した後、実際にこのリポジトリのpre-commitフックが機能するか確認するため `scripts/` 配下を確認したところ、テンプレート（`patterns/setup-pattern/setup-securecheck/templates/scripts/`）と大きく乖離した古いバージョンだったことが判明した。

### 原因

`diff` で比較した結果:
- `scripts/pre-commit.js`: staged ファイルのみのスキャン・チャンク分割が無く、`npx secretlint "**/*"` で全ファイルを毎回スキャンする実装。かつ今回直したA2のバグ（secretlint失敗でgitleaksが実行されない）と非推奨コマンド（`protect --staged`）をそのまま抱えていた
- `scripts/security-verify.js`: A3で強化した中身チェック・機能的カナリアテストが無い、旧来の「空でないか」のみの弱いチェックのまま

つまり `gitleaks.toml` の設定だけ直しても、このリポジトリの実際のpre-commitフックは「secretlintが何か検出したらgitleaksは実行されない」という穴を抱えたままだった。

### 対応

ユーザーとの確認の上、`patterns/setup-pattern/setup-securecheck/templates/scripts/pre-commit.js` と `security-verify.js` を、このリポジトリの `scripts/` に上書きコピーした（構文チェックのみ実施、このリポジトリでの実地動作確認は次セッションに持ち越し）。

なお `scripts/install-gitleaks.js` もテンプレートと差分があった（Windows展開方式: PowerShell依存 → `adm-zip`）が、これはセキュリティバグではなく実装方式の改善のため、今回のスコープ外として着手していない。

## 学び

- 「バグを直した」の対象を、テンプレート（配布物）だけでなく「このリポジトリ自身がそのテンプレートで実際に運用している成果物」まで広げて確認する習慣が、今回も新たな穴を2つ（発見1・発見3）掘り出した
- allowlist/除外ルールの正規表現は、アンカーの有無で「意図した1箇所だけを除外する」と「たまたま部分文字列が一致した無関係な場所も除外する」の差が生まれる。除外ルールを書くときは常に「このパターンは他に何にマッチしうるか」を確認する
- 指示書（`docs/actions/*.md`）に書かれた具体的なコマンドは、実際の運用フロー（他の指示書との組み合わせ）と整合しているかを別途検証しないと、コマンドの文字面だけでは気づけない不整合が生まれる。今回は「AIが実際には柔軟に対応していたため実害が無かった」が、記述通りに機械的に実行されていたら空振りするところだった

## 関連ドキュメント

- [調査・検証ノート](./2026-07-09-23-13-15-setup-securecheck-v2-0-1-gitleaks-zero-rules-report-verification.md)
- [修正実装ノート](./2026-07-09-23-14-00-setup-securecheck-v2-0-2-gitleaks-fixes-implementation.md)

---

**最終更新**: 2026-07-09
**作成者**: Claude
