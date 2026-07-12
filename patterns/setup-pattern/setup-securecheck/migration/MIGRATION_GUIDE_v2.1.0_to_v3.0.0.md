# setup-securecheck v2.x → v3.0.0 移行ガイド（AI 向けウィザード指示書）

<!-- ============================================================
  このファイルは AI が読むウィザード指示書です
  ============================================================ -->

## このガイドの目的

setup-securecheck v2.x（`scripts/pre-commit.js` などを `simple-git-hooks` から直接呼ぶレイアウト）を
使って導入済みのプロジェクトを v3.0.0（`.security-check/` 集約構成）に移行します。

**主な変更内容**:
- `scripts/pre-commit.js` / `scripts/security-verify.js` / `scripts/install-gitleaks.js` / `bin/gitleaks` / `.logs/` → すべて `.security-check/` 配下に集約
- `package.json` の npm scripts（`security:verify` 等、複数行）→ `scripts.security` の1行に統一。実体は `.security-check/cli.js` のサブコマンド（`verify` / `pre-commit` / `install-gitleaks` / `uninstall`）
- gitleaks が見つからない場合、警告のみでコミットを続行していた挙動（フェイルオープン）を、コミットをブロックする挙動（フェイルクローズ）に変更
- アンインストールコマンド（`node .security-check/cli.js uninstall`）を新設
- `gitleaks.toml` / `.secretlintrc.json` はユーザー編集対象の設定ファイルのため、リポジトリルートのまま変更しない

---

## 📋 この指示書の理解チェック

作業を開始する前に、以下の手順を理解したことをチェックボックスで提示してください：

- [ ] Step 1: 現状確認
- [ ] Step 2: migrate-to-v3.sh でファイル移設を実行
- [ ] Step 3: package.json を手動で更新
- [ ] Step 4: フックを再生成
- [ ] Step 5: .gitignore を更新
- [ ] Step 6: 動作確認（フェイルクローズの実地確認を含む）

### 重要ルール
- [ ] コミットは実行しない（ユーザーが確認後にコミット）
- [ ] 各 Step でユーザー承認を待つ（勝手に進まない）
- [ ] 移行後、gitleaksバイナリが `.security-check/bin/` に存在しない状態でコミットすると、フェイルクローズによりブロックされる（想定通りの挙動。install-gitleaksで解消する）

理解できましたか？ゴーサインをください。

---

## 前提条件

- setup-securecheck v2.x で導入済みのプロジェクト（`simple-git-hooks` + `scripts/pre-commit.js`）
- Node.js プロジェクト（package.json が存在する）
- git リポジトリで管理されていること

---

## Step 1: 現状確認

```bash
cat package.json | grep -A2 '"simple-git-hooks"'
ls scripts/
node -e "const fs=require('fs');['bin/gitleaks','bin/gitleaks.exe','.logs/pre-commit.log'].forEach(p=>console.log(p+':',fs.existsSync(p)?'✅ あり':'❌ なし'))"
```

`scripts/pre-commit.js` が存在し、`simple-git-hooks.pre-commit` がそれを指していることを確認してください。

**確認が取れたら Step 2 に進みます。ユーザーに確認を求めてください。**

---

## Step 2: migrate-to-v3.sh でファイル移設を実行

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck/templates tmp/securecheck-v3 --force
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck/migration tmp/securecheck-migration --force
bash tmp/securecheck-migration/migrate-to-v3.sh
```

**スクリプトが行うこと**:
- `.security-check/` を配置
- 既存の `bin/gitleaks`（または `.exe`）・`.logs/pre-commit.log` があれば `.security-check/` 配下に移設（無ければスキップ、後述の `install-gitleaks` で新規導入すればよい）
- 旧 `scripts/pre-commit.js` / `security-verify.js` / `install-gitleaks.js` / `install-gitleaks.sh` を削除（このパターンが生成した既知のファイルのみ。他のカスタムスクリプトが `scripts/` にある場合、ディレクトリ自体は残す）

実行後、以下を確認してください：

```bash
ls .security-check/
```

**期待する結果**: `cli.js` / `lib/` / `README.md` が存在する。

**確認が取れたら Step 3 に進みます。ユーザーに確認を求めてください。**

---

## Step 3: package.json を手動で更新

### 3.1 削除する項目（scripts セクション内、存在するもののみ）

```json
"security:verify": "...",
"security:verify:simple": "...",
"security:verify:testrun": "...",
"security:install-gitleaks": "...",
"secret-scan": "...",
"secret-scan:full": "...",
"gitleaks:install": "..."
```

### 3.2 追加する項目

**`scripts` セクション内**:
```json
"security": "node .security-check/cli.js"
```

**`simple-git-hooks` セクション（既存のキーを上書き）**:
```json
"simple-git-hooks": {
  "pre-commit": "node .security-check/cli.js pre-commit"
}
```

`devDependencies`（`secretlint` / `@secretlint/secretlint-rule-preset-recommend` / `simple-git-hooks`）は変更不要です。

**確認が取れたら Step 4 に進みます。ユーザーに確認を求めてください。**

---

## Step 4: フックを再生成

```bash
npx simple-git-hooks
cat .git/hooks/pre-commit
```

**期待する結果**: `.security-check/cli.js pre-commit` が含まれている。

**確認が取れたら Step 5 に進みます。ユーザーに確認を求めてください。**

---

## Step 5: .gitignore を更新

以下を削除してください（存在する場合）：

```gitignore
bin/
.logs/
```

以下を追加してください：

```gitignore
# setup-securecheck: gitleaksバイナリ・実行ログ（ローカル専用、リポジトリに含めない）
.security-check/bin/
.security-check/logs/
```

**確認が取れたら Step 6 に進みます。ユーザーに確認を求めてください。**

---

## Step 6: 動作確認

### 6.1 ヘルスチェック

```bash
node .security-check/cli.js verify
```

**期待する結果**: 15項目のチェックが実行される。gitleaksバイナリが Step 2 で移設できていれば全て ✅ のはず。移設できず未導入のままの場合は `node .security-check/cli.js install-gitleaks` を実行してください。

### 6.2 フェイルクローズの実地確認（推奨）

gitleaksが見つからない状態で本当にコミットがブロックされるか、実地で確認します（worktree等の使い捨て環境で行うこと）。

```bash
mv .security-check/bin/gitleaks .security-check/bin/gitleaks.bak
node .security-check/cli.js pre-commit
# 期待: "❌ gitleaks が見つかりません — フェイルクローズ方針によりコミットをブロックします" と exit code 1
mv .security-check/bin/gitleaks.bak .security-check/bin/gitleaks
```

### 6.3 テストコミットで pre-commit フックを確認

```bash
git add .
git commit -m "test: migrate to .security-check (v3)"
```

**期待する結果**:
- secretlint / gitleaks が実行される
- `.security-check/logs/pre-commit.log` に記録される

**テストコミットは取り消してもOKです**：

```bash
git reset HEAD~1
```

---

## 移行完了

**作成/変更されたファイル**:
- `.security-check/`（`cli.js` / `lib/` / `README.md` / `bin/` / `logs/`）
- `package.json` — `scripts.security` の1行に統一、`simple-git-hooks.pre-commit` のパス変更
- `.git/hooks/pre-commit` — simple-git-hooks で自動生成
- `.gitignore` — `.security-check/bin/` / `.security-check/logs/` に変更

**削除されたもの**:
- 旧 `scripts/pre-commit.js` / `security-verify.js` / `install-gitleaks.js` / `install-gitleaks.sh`
- 旧 `bin/gitleaks`（`.security-check/bin/` へ移設済み）
- 旧 `.logs/pre-commit.log`（`.security-check/logs/` へ移設済み）

**次の作業**:
- `git status` と `git diff` で変更内容を確認
- 問題なければコミット

---

## ⚠️ 注意事項

- `gitleaks.toml` / `.secretlintrc.json` はこの移行では一切変更しません（リポジトリルートのまま）
- 移行後は gitleaks 不在がフェイルクローズでブロックされるため、CI環境やクローン直後の環境では `node .security-check/cli.js install-gitleaks` を導入フローに必ず含めること
- このパターンを丸ごと取り除きたい場合は `node .security-check/cli.js uninstall` を使う（v1/v2レイアウトのアンインストールは対象外。先にこのガイドでv3へ移行してから使うこと）
