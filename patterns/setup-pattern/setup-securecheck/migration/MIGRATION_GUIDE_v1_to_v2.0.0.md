# setup-securecheck v1 → v2.0.0 移行ガイド（AI 向けウィザード指示書）

<!-- ============================================================
  このファイルは AI が読むウィザード指示書です
  ============================================================ -->

## このガイドの目的

setup-securecheck v1（husky + lint-staged）を使って導入済みのプロジェクトを
v2.0.0（simple-git-hooks）構成に移行します。

**主な変更内容**:
- husky + lint-staged → simple-git-hooks（package.json だけで完結）
- pre-commit.js に実行ログ出力を追加（.logs/pre-commit.log）
- .gitignore に .logs/ を追加

---

## 📋 この指示書の理解チェック

作業を開始する前に、以下の手順を理解したことをチェックボックスで提示してください：

- [ ] Step 1: 現状確認（スキャンツールの状態確認を含む）
- [ ] Step 2: migrate-to-v2.sh でパッケージ変更を実行
- [ ] Step 3: package.json を手動で更新
- [ ] Step 4: スクリプトファイルを新バージョンに置き換え
- [ ] Step 4.5: スキャンツールの確認・インストール
- [ ] Step 5: .gitignore を更新
- [ ] Step 6: 動作確認

### 重要ルール
- [ ] コミットは実行しない（ユーザーが確認後にコミット）
- [ ] 各 Step でユーザー承認を待つ（勝手に進まない）

理解できましたか？ゴーサインをください。

---

## 前提条件

- setup-securecheck v1 で導入済みのプロジェクト（husky + lint-staged）
- Node.js プロジェクト（package.json が存在する）
- git リポジトリで管理されていること

---

## Step 1: 現状確認

現在の設定を確認します。

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
| gitleaks ❌ | gitignore 管理のためクローン直後は正常。Step 4.5 でインストール |

**確認が取れたら Step 2 に進みます。ユーザーに確認を求めてください。**

---

## Step 2: migrate-to-v2.sh でパッケージ変更を実行

シェルスクリプトで機械的な変更を自動実行します。

```bash
bash tmp/securecheck-migration/migrate-to-v2.sh
```

**スクリプトが行うこと**:
- `npm uninstall husky lint-staged`
- `npm install -D simple-git-hooks`
- `.husky/` ディレクトリを削除

実行後、以下を確認してください：

```bash
cat package.json | grep -E '"husky|lint-staged|simple-git-hooks'
```

**期待する結果**: husky と lint-staged が消え、simple-git-hooks が追加されている。

**確認が取れたら Step 3 に進みます。ユーザーに確認を求めてください。**

---

## Step 3: package.json を手動で更新

スクリプトでは変更できない package.json の構造を更新します。

### 3.1 削除する項目

以下を `package.json` から削除してください：

```json
"lint-staged": {
  "*": ["secretlint"]
},
```

```json
"husky:install": "husky"
```

（scripts セクション内にある場合）

### 3.2 追加する項目

以下を `package.json` に追加してください：

**`simple-git-hooks` セクション（トップレベル）**:
```json
"simple-git-hooks": {
  "pre-commit": "node scripts/pre-commit.js"
},
```

**`scripts` セクション内に `postinstall` を追加**:
```json
"postinstall": "npx simple-git-hooks"
```

### 3.3 フックを有効化

```bash
npx simple-git-hooks
```

**確認コマンド**:

```bash
cat .git/hooks/pre-commit
```

**期待する結果**: `node scripts/pre-commit.js` が含まれている。

**確認が取れたら Step 4 に進みます。ユーザーに確認を求めてください。**

---

## Step 4: スクリプトファイルを新バージョンに置き換え

新しい `pre-commit.js`（ログ出力機能付き）と `security-verify.js`（ログ確認機能付き）に更新します。

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck/templates/scripts ./tmp/securecheck-v2-scripts
```

```bash
cp tmp/securecheck-v2-scripts/pre-commit.js scripts/
cp tmp/securecheck-v2-scripts/security-verify.js scripts/
```

**確認コマンド**:

```bash
head -10 scripts/pre-commit.js
```

**期待する結果**: `writeLog` という関数が含まれている（ログ機能の目印）。

**確認が取れたら Step 4.5 に進みます。ユーザーに確認を求めてください。**

---

## Step 4.5: スキャンツールの確認・インストール

クローンしたての環境では secretlint が未インストール、gitleaks バイナリが存在しない場合があります。
いずれも冪等なので、既にインストール済みの場合は自動スキップされます。

### secretlint のインストール

```bash
npm install -D secretlint @secretlint/secretlint-rule-preset-recommend
```

### gitleaks バイナリのインストール

```bash
node scripts/install-gitleaks.js
```

`bin/gitleaks`（Windows は `bin/gitleaks.exe`）が既にある場合はスキップされます。

### インストール後の確認

```bash
npx secretlint --version
```

```bash
node -e "const fs=require('fs');['bin/gitleaks','bin/gitleaks.exe'].forEach(p=>console.log(p+':',fs.existsSync(p)?'✅ あり':'❌ なし'))"
```

**両方 ✅ になったら Step 5 に進みます。ユーザーに確認を求めてください。**

---

## Step 5: .gitignore を更新

`.logs/` を `.gitignore` に追加します。

既存の `.gitignore` に以下を追加してください：

```gitignore
# pre-commit 実行ログ（ローカル専用）
.logs/
```

また、以下は不要になったので削除してください（存在する場合）：

```gitignore
# Phase 4（個人用）の場合のみ以下を追加:
# .husky/
```

**確認が取れたら Step 6 に進みます。ユーザーに確認を求めてください。**

---

## Step 6: 動作確認

### 6.1 ヘルスチェック

```bash
npm run security:verify
```

**期待する結果**: 11 項目のチェックが実行される。
- `.git/hooks/pre-commit` ✅
- `simple-git-hooks 設定` ✅

### 6.2 テストコミットで pre-commit フックを確認

```bash
git add .
git commit -m "test: migrate to simple-git-hooks"
```

**期待する結果**:
- secretlint が実行される
- gitleaks が実行される
- `.logs/pre-commit.log` が作成される

**テストコミットは取り消してもOKです**：

```bash
git reset HEAD~1
```

### 6.3 ログ確認

```bash
cat .logs/pre-commit.log
```

**期待する結果**: JSONL 形式で実行ログが記録されている。

---

## 移行完了

移行が完了しました。

**作成/変更されたファイル**:
- `scripts/pre-commit.js` - ログ機能追加
- `scripts/security-verify.js` - ログ確認機能追加
- `package.json` - simple-git-hooks 設定追加
- `.git/hooks/pre-commit` - simple-git-hooks で自動生成
- `.gitignore` - .logs/ 追加

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
