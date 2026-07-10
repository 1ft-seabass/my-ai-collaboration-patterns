---
tags: [setup-securecheck, gitleaks, pre-commit, security-verify, bugfix]
---

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-09
**関連タスク**: setup-securecheck v2.0.1 → v2.0.2（gitleaks検出ルール0件バグの修正）

## 問題

[調査・検証ノート](./2026-07-09-23-13-15-setup-securecheck-v2-0-1-gitleaks-zero-rules-report-verification.md) で確認した4つの問題を修正する。

## 解決策

### A1: `templates/gitleaks.toml` — 検出ルールの追加

先頭に以下を追加:

```toml
[extend]
useDefault = true
```

**実装場所**: `patterns/setup-pattern/setup-securecheck/templates/gitleaks.toml`

### A2: `templates/scripts/pre-commit.js` — secretlint/gitleaks の独立実行

secretlint の実行を try/catch で囲み、失敗しても後続の gitleaks セクションへ進むよう変更。両方の結果を `secretlintOk`/`gitleaksOk` の bool で保持し、最後に集約して exit code を決定する構造に変更した。

**実装場所**: `patterns/setup-pattern/setup-securecheck/templates/scripts/pre-commit.js`

**検証方法**: 隔離したテスト用git repoを作り、(a) secretlintのみ検出する値（`xxxxxx`を含むGitHub PAT形式のダミー値、gitleaks側はallowlistで無視）、(b) gitleaksのみ検出する値（`sk-`接頭辞を持つ16桁の16進数風ダミー値、secretlintのpreset-recommendでは未検出）の両方で、もう片方のツールが実行され続けることを確認した。

```
ケース(a): secretlint失敗 → gitleaksセクションも実行される → "❌ Pre-commit checks failed (secretlint)"
ケース(b): secretlint成功 → gitleaksが検出 → "❌ Pre-commit checks failed (gitleaks)"
```

### A3: `templates/scripts/security-verify.js` — 内容チェック強化 + 機能的カナリアテスト

- check #7（gitleaks.toml中身チェック）を「空でないこと」から「`[extend]` または `[[rules]]` を含むこと」に変更
- 新規 check #11 として「機能的カナリアテスト」を追加: `.security-verify-canary/` に合成シークレット（36桁のGitHub PAT形式のダミー値。コード内の`CANARY_SECRET`定数、allowlistのプレースホルダーに一致しない値）を書き込み、実際に `gitleaks dir` でスキャンして検出できるかを確認。検出できなければ検出ルールが無効化されていると判定
- 項目数が11→12に増えたため、`結果: X/12 passed` に変更

**実装場所**: `patterns/setup-pattern/setup-securecheck/templates/scripts/security-verify.js`

**ハマった点**: カナリアの一時ディレクトリを `process.cwd()` 基準の**絶対パス**で gitleaks に渡したところ、テスト用リポジトリを `/tmp/verifytest-repo` に置いていたために `gitleaks.toml` の allowlist `tmp/.*` に誤爆し、カナリア自体が除外されて「検出ルールが機能していない」という誤った判定になった。相対パス（`.security-verify-canary`）で渡すことで解消した（詳細は[副次的発見ノート](./2026-07-09-23-15-00-setup-securecheck-additional-discoveries-during-fix.md)）。

**検証方法**: 修正済み設定・壊れた設定（`[extend]`なし）の両方で `node scripts/security-verify.js` を実行し、check #7 と #11 がそれぞれ正しく ✅/❌ を返すことを確認した。

### A4: `setup-securecheck.md` — ネガティブテスト修正 + protect/detect 非推奨対応

- ステップ3.6.5のカナリア値を、`xxxxxx`を含む値（allowlistに一致してしまう）から、36桁のGitHub PAT形式のダミー値（allowlistに一致しない）に変更
- ステップを3.6.5-a（pre-commitフック全体でのブロック確認）と3.6.5-b（`gitleaks git --staged --config gitleaks.toml .` を単独実行してexit codeを個別確認）に分割し、secretlintだけでなくgitleaks単独の動作も検証できるようにした
- `detect --source .` → `git . `、`protect --staged` → `git --staged .` に置き換え（`templates/package.json.example`、`README.md` も同様に修正）
- Phase 0 判定テーブルの「11/11」「10/11」を「12/12」に、および「gitleaks関連のみ❌」の判定を項目数依存ではなく項目名で判断する記述に変更

**実装場所**: `patterns/setup-pattern/setup-securecheck/setup-securecheck.md`、`README.md`、`templates/package.json.example`

**検証方法**: 隔離したテスト用リポジトリでウィザードの流れを模した一連の手順（テンプレート配置→`security:verify`→ステップ3.6.5-a/b相当のコミット試行）を実行し、`❌ Pre-commit checks failed (secretlint, gitleaks)` のように両方の検出結果が明示されることを確認した。

### A5（一部）: このリポジトリ自身の `gitleaks.toml` 修正

ルートの `gitleaks.toml` にも同じ `[extend] useDefault = true` を追加。ルート設定には `tmp/.*` エントリが無かったためアンカー修正（A1追加分）は不要だった。

**実装場所**: `gitleaks.toml`（リポジトリルート）

## 学び

- secretlint/gitleaks のような「独立した2つの検出エンジン」を1つのtry/catchで直列に繋ぐと、片方の失敗がもう片方の実行機会を奪う。多重防御を謳うなら、実行と結果集約を分離する必要がある
- 静的な文字列チェック（「`[extend]`と書いてあるか」）と機能的チェック（「実際に検出できるか」）は別物。前者は後者の代用にならない（`useDefault = false` と書いても文字列チェックは通る）
- 修正のたびに隔離したテスト用リポジトリで再現実験するスタイルが今回も有効だった。特に「壊れた設定に戻して本当に❌になるか」まで確認することで、チェックロジック自体のバグ（A3のtmp/allowlist誤爆）にも気づけた

## 今後の改善案

- A5の残り（`scripts/pre-commit.js`・`scripts/security-verify.js`のテンプレート同期）
- A6（既存導入プロジェクト向けマイグレーションガイド）
- CHANGELOG.md / VERSION の 2.0.2 への更新
- B1（`docs/actions/01_git_push.md` のチェック対象コマンド修正）

## 関連ドキュメント

- [調査・検証ノート](./2026-07-09-23-13-15-setup-securecheck-v2-0-1-gitleaks-zero-rules-report-verification.md)
- [副次的発見ノート](./2026-07-09-23-15-00-setup-securecheck-additional-discoveries-during-fix.md)

---

**最終更新**: 2026-07-09
**作成者**: Claude
