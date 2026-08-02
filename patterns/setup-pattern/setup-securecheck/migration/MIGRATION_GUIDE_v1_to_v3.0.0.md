# setup-securecheck v1 → v3.0.0 移行ガイド（AI 向けウィザード指示書）

<!-- ============================================================
  このファイルは AI が読むウィザード指示書です
  ============================================================ -->

## このガイドの目的

setup-securecheck v1（husky + lint-staged）を使って導入済みのプロジェクトを、
v2.x を経由せず直接 v3.0.0（`.security-check/` 集約構成）へ移行します。

**v2 を経由しない理由**: v2.x 向けのスクリプトテンプレート（`scripts/pre-commit.js` 等）は
v3.0.0 のリポジトリ構造集約時に `templates/scripts/` から削除されており、
v1→v2.0.1 の中間移行はもう実行できません。v1 からは直接 v3.0.0 へ移行してください。

**主な変更内容**:
- husky + lint-staged → simple-git-hooks（package.json だけで完結）
- `scripts/pre-commit.js` 等の中間レイアウトを経由せず、`.security-check/` 集約構成（`cli.js` + `lib/`）を直接導入
- gitleaks が見つからない場合、コミットをブロックする挙動（フェイルクローズ）
- `gitleaks.toml` / `.secretlintrc.json` はユーザー編集対象の設定ファイルとしてリポジトリルートに配置

---

## 📋 この指示書の理解チェック

作業を開始する前に、以下の手順を理解したことをチェックボックスで提示してください：

- [ ] Step 1: 現状確認（スキャンツールの状態確認を含む）
- [ ] Step 2: package.json から husky 関連スクリプトを手動削除（`prepare` 含む、npm操作の前に）
- [ ] Step 3: migrate-to-v3-from-v1.sh でパッケージ入替・ファイル配置を実行
- [ ] Step 4: package.json を手動で更新（simple-git-hooks 設定・scripts.security）
- [ ] Step 5: フックを再生成
- [ ] Step 6: .gitignore を更新
- [ ] Step 7: 動作確認（フェイルクローズの実地確認を含む）

### 重要ルール
- [ ] コミットは実行しない（ユーザーが確認後にコミット）
- [ ] 各 Step でユーザー承認を待つ（勝手に進まない）
- [ ] Step 2 は Step 3 より必ず先に行う。`"prepare": "husky"` を残したまま npm install/uninstall を実行すると、prepare スクリプトが自動再実行され、直後に削除した `.husky/` が再生成される

理解できましたか？ゴーサインをください。

---

## 前提条件

- setup-securecheck v1 で導入済みのプロジェクト（husky + lint-staged）
- Node.js プロジェクト（package.json が存在する）
- git リポジトリで管理されていること

---

## Step 1: 現状確認

### 1.1 現在の依存パッケージを確認

```bash
cat package.json | grep -E '"husky|lint-staged|simple-git-hooks'
```

husky と lint-staged が存在することを確認してください。

### 1.2 .husky/ ディレクトリを確認

```bash
ls .husky/
```

.husky/pre-commit が存在することを確認してください。

### 1.3 スキャンツールの状態確認

```bash
npx secretlint --version
```

```bash
node -e "const fs=require('fs');['bin/gitleaks','bin/gitleaks.exe'].forEach(p=>console.log(p+':',fs.existsSync(p)?'✅ あり':'❌ なし'))"
```

| 状態 | 意味 |
|---|---|
| secretlint ✅ | npm install 済み、問題なし |
| secretlint ❌ | `npm install` が必要（devDependencies に含まれているはず） |
| gitleaks ❌ | gitignore 管理のためクローン直後は正常。Step 7 で `install-gitleaks` を実行する |

**確認が取れたら Step 2 に進みます。ユーザーに確認を求めてください。**

---

## Step 2: package.json から husky 関連スクリプトを手動削除

**Step 3 で npm install/uninstall を実行する前に、必ずこの Step を終わらせてください。**
`"prepare": "husky"` が残ったまま npm 操作を行うと、prepare スクリプトが自動的に
再実行され、Step 3 で削除したはずの `.husky/` が再生成されてしまいます。

### 2.1 husky 関連の scripts を洗い出す

```bash
grep -n '"prepare"\|husky' package.json
```

### 2.2 削除する項目

`scripts` セクションから、以下のような husky 関連エントリを削除してください（実際のキー名はプロジェクトによって異なるので 2.1 の結果に従うこと）：

```json
"prepare": "husky",
```
```json
"husky:install": "husky",
```

### 2.3 lint-staged 設定を削除

```json
"lint-staged": {
  "*": ["secretlint"]
},
```

**確認が取れたら Step 3 に進みます。ユーザーに確認を求めてください。**

---

## Step 3: migrate-to-v3-from-v1.sh でパッケージ入替・ファイル配置を実行

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck/templates tmp/securecheck-v3 --force
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck/migration tmp/securecheck-migration --force
bash tmp/securecheck-migration/migrate-to-v3-from-v1.sh
```

**スクリプトが行うこと**:
- `npm uninstall husky lint-staged`
- `npm install -D simple-git-hooks`
- `.husky/` ディレクトリを削除
- `.security-check/` を配置

実行後、以下を確認してください：

```bash
cat package.json | grep -E '"husky|lint-staged|simple-git-hooks'
ls .security-check/
```

**期待する結果**: husky と lint-staged が消え、simple-git-hooks が追加されている。`.security-check/` に `cli.js` / `lib/` / `README.md` が存在する。

**確認が取れたら Step 4 に進みます。ユーザーに確認を求めてください。**

---

## Step 4: package.json を手動で更新

**`scripts` セクション内**:
```json
"security": "node .security-check/cli.js",
"postinstall": "npx simple-git-hooks"
```

**`simple-git-hooks` セクション（トップレベル）**:
```json
"simple-git-hooks": {
  "pre-commit": "node .security-check/cli.js pre-commit"
},
```

**確認が取れたら Step 5 に進みます。ユーザーに確認を求めてください。**

---

## Step 5: フックを再生成

```bash
npx simple-git-hooks
cat .git/hooks/pre-commit
```

**期待する結果**: `.security-check/cli.js pre-commit` が含まれている。

**確認が取れたら Step 6 に進みます。ユーザーに確認を求めてください。**

---

## Step 6: .gitignore を更新

以下を削除してください（存在する場合）：

```gitignore
# Phase 4（個人用）の場合のみ以下を追加:
# .husky/
```

以下を追加してください：

```gitignore
# setup-securecheck: gitleaksバイナリ・実行ログ（ローカル専用、リポジトリに含めない）
.security-check/bin/
.security-check/logs/
```

**確認が取れたら Step 7 に進みます。ユーザーに確認を求めてください。**

---

## Step 7: 動作確認

### 7.1 ヘルスチェック

```bash
node .security-check/cli.js verify
```

**期待する結果**: 15項目のチェックが実行される。gitleaksバイナリが未導入の場合は `node .security-check/cli.js install-gitleaks` を実行してください。

### 7.2 フェイルクローズの実地確認（推奨）

gitleaksが見つからない状態で本当にコミットがブロックされるか、実地で確認します（worktree等の使い捨て環境で行うこと）。

```bash
mv .security-check/bin/gitleaks .security-check/bin/gitleaks.bak
node .security-check/cli.js pre-commit
# 期待: "❌ gitleaks が見つかりません — フェイルクローズ方針によりコミットをブロックします" と exit code 1
mv .security-check/bin/gitleaks.bak .security-check/bin/gitleaks
```

### 7.3 テストコミットで pre-commit フックを確認

```bash
git add .
git commit -m "test: migrate v1 to .security-check (v3)"
```

**期待する結果**:
- secretlint が実行される
- gitleaks が実行される
- `.security-check/logs/pre-commit.log` が作成される

**テストコミットは取り消してもOKです**：

```bash
git reset HEAD~1
```

### 7.4 ログ確認

```bash
cat .security-check/logs/pre-commit.log
```

**期待する結果**: JSONL 形式で実行ログが記録されている。

---

## 移行完了

**作成/変更されたファイル**:
- `.security-check/`（`cli.js` / `lib/` / `README.md`）
- `package.json` — `scripts.security` 追加、`simple-git-hooks.pre-commit` 追加、husky/lint-staged関連スクリプト削除
- `.git/hooks/pre-commit` — simple-git-hooks で自動生成
- `.gitignore` — `.security-check/bin/` / `.security-check/logs/` 追加

**削除されたもの**:
- `node_modules` 内の husky / lint-staged
- `.husky/` ディレクトリ

**次の作業**:
- `git status` と `git diff` で変更内容を確認
- 問題なければコミット

---

## ⚠️ 注意事項

- `package.json` の `simple-git-hooks` セクションを変更した場合は `npx simple-git-hooks` を再実行すること
- `postinstall` が設定されていれば `npm install` 後に全員の hooks が自動で有効化される
- 移行前の `.husky/pre-commit` の内容は削除されるので、カスタマイズがある場合は事前にメモしておくこと
- 移行後は gitleaks 不在がフェイルクローズでブロックされるため、CI環境やクローン直後の環境では `node .security-check/cli.js install-gitleaks` を導入フローに必ず含めること
- このパターンを丸ごと取り除きたい場合は `node .security-check/cli.js uninstall` を使う
