# シークレットスキャン導入ガイド

AI 生成ドキュメント（letters/notes）を含むプロジェクトでの secretlint + gitleaks 導入手順。

段階的に導入し、状況に応じてどこで止めるかを判断する。基本的には、Phase 3（フル版）または Phase 4（個人用）推奨。

## 背景

- AI がドキュメントを書く際、動作確認時の認証情報が混入するリスクがある
- `docs/notes` に経緯を残す運用では、curl例やAPI設定メモに本物が紛れやすい
- プライベートリポジトリでも「見えにくい」だけで「安全」ではない

## ツール構成

| ツール | 役割 | 得意領域 |
|--------|------|----------|
| secretlint | メイン | クラウドサービス特化、Node.js親和、精密検出 |
| gitleaks | 補助 | 高速、entropy検出、git履歴スキャン |
| husky | git hooks 管理 | npm で hooks を共有可能に（Phase 3/4） |
| lint-staged | staged ファイル限定実行 | 差分だけ高速チェック（Phase 3/4） |

## どこまで導入するかの判断基準

| 状況 | 推奨 |
|------|------|
| 個人開発 | Phase 3（フル版）または Phase 4（個人用） |
| チーム全員で強制 | Phase 3（フル版） |
| 自分だけ使いたい、他の人には任意 | **Phase 4（個人用）** |
| ピュアなコミット保持（ライトな状態） | Phase 2（ライト版） |

---

# Phase 1: 初動スキャン（必須）

まず現状を把握する。いきなり自動化せず、何が検出されるか確認。

## 1.1 secretlint インストール

```bash
npm install -D secretlint @secretlint/secretlint-rule-preset-recommend
```

`.secretlintrc.json` を作成:

```json
{
  "rules": [
    {
      "id": "@secretlint/secretlint-rule-preset-recommend"
    }
  ]
}
```

## 1.2 secretlint で初回スキャン

```bash
npx secretlint "**/*"
```

→ ユーザーに結果を報告し、方針検討

## 1.3 gitleaks インストール

```bash
# macOS
brew install gitleaks

# Windows (Scoop)
scoop install gitleaks

# Windows (Chocolatey)
choco install gitleaks

# Go
go install github.com/gitleaks/gitleaks/v8@latest

# バイナリ直接（Windows / Linux）
# https://github.com/gitleaks/gitleaks/releases
# Windows: gitleaks_X.X.X_windows_x64.zip
```

## 1.4 gitleaks で初回スキャン

```bash
gitleaks detect --source . -v
```

→ ユーザーに結果を報告し、方針検討

## 1.5 検出時の判断基準

| 状況 | 対応 |
|------|------|
| 本物のシークレット | **即座に無効化（トークン再発行）** → ファイル修正 |
| プレースホルダー（YOUR_API_KEY等） | allowlist に追加 |
| サンプル/ダミー値 | allowlist または値を明確なダミーに変更 |
| false positive | allowlist に追加 |

**重要**: ファイル修正より先にトークン側を無効化する。ファイルを直しても履歴に残っている。

## 1.6 allowlist 設定

`.secretlintrc.json`:

```json
{
  "rules": [
    {
      "id": "@secretlint/secretlint-rule-preset-recommend"
    }
  ],
  "ignores": [
    {
      "comments": ["テンプレートファイルは除外"],
      "patterns": ["docs/actions/**", "**/TEMPLATE.md"]
    }
  ]
}
```

`.gitleaksignore`（プロジェクトルート）:

```
# false positive のファイル:行 を指定
docs/actions/example_api_usage.md:3
```

## 1.7 方針決定

| 結果 | 方針 |
|------|------|
| 軽微 or なし | 現環境で続行 → Phase 2 へ |
| 広範囲に漏洩 | Git リポジトリやり直しも検討 |

---

# Phase 2: 手動運用（ライト版）

npm scripts で手動実行できる状態。package.json への影響は devDependencies のみ。

**ここで止めてもOK。ピュアなコミットを保持したい場合はここまで。**

## 2.1 npm scripts 追加

`package.json`:

```json
{
  "scripts": {
    "secret-scan": "secretlint \"**/*\"",
    "secret-scan:full": "secretlint \"**/*\" && gitleaks detect --source . -v"
  }
}
```

## 2.2 手動実行用シェルスクリプト（オプション）

`scripts/secret-scan.sh` を作成:

```bash
#!/bin/bash
set -e

echo "=== secretlint ==="
npx secretlint "**/*"

echo ""
echo "=== gitleaks ==="
gitleaks detect --source . -v

echo ""
echo "✅ All checks passed"
```

```bash
chmod +x scripts/secret-scan.sh
```

## 2.3 運用

```bash
# コミット前に手動で実行
npm run secret-scan

# または
./scripts/secret-scan.sh
```

## Phase 2 完了時点の状態

- ✅ secretlint + gitleaks インストール済み
- ✅ 手動でスキャン可能
- ✅ package.json は devDependencies のみ追加
- ❌ pre-commit 強制なし（忘れたらスルー）

---

# Phase 3: pre-commit 強制（フル版）

husky + lint-staged で全コミットを自動チェック。

**注意**: package.json に `prepare` スクリプトが追加され、他の開発者にも伝播する。

## Windows 環境の注意点

`.husky/pre-commit` は bash スクリプトのため:

| 環境 | 動作 |
|------|------|
| Git Bash 経由 | ✅ 動く |
| VSCode ターミナル (Git Bash) | ✅ 動く |
| PowerShell / cmd 直接 | ⚠️ 動かない可能性 |

Git for Windows を入れていれば Git Bash が付属するので、通常は問題なし。

### 安全策: Node.js で書く（オプション）

PowerShell / cmd でも確実に動かしたい場合:

`scripts/pre-commit.js` を作成:

```javascript
const { execSync } = require('child_process');
try {
  execSync('npx lint-staged', { stdio: 'inherit' });
  execSync('npx gitleaks protect --staged', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}
```

`.husky/pre-commit` を編集:

```bash
node scripts/pre-commit.js
```

## 3.1 husky + lint-staged インストール

```bash
npm install -D husky lint-staged
npx husky init
```

## 3.2 pre-commit フック設定

`.husky/pre-commit` を編集:

```bash
npx lint-staged
npx gitleaks protect --staged
```

## 3.3 lint-staged 設定

`package.json` に追加:

```json
{
  "lint-staged": {
    "*": ["secretlint"]
  }
}
```

## 3.4 動作確認

```bash
# 適当なファイルを変更して
git add .
git commit -m "test"
# → secretlint と gitleaks が自動実行される
```

## Phase 3 完了時点の状態

- ✅ 全コミットが自動チェックされる
- ✅ 検出されたらコミット失敗
- ⚠️ package.json に `prepare: husky` が追加される
- ⚠️ 他の開発者も npm install 時に自動適用

---

# Phase 4: 個人用セットアップ（自分だけ強制、他は任意）

自分は pre-commit 強制を使いたいが、他の人には影響させたくない場合。

**Phase 3 との違い**: `prepare` スクリプトを使わず、`husky:install` で手動有効化にする。

## 設計判断

| 項目 | Phase 3 | Phase 4 |
|------|---------|---------|
| `package.json` の `prepare` | `"prepare": "husky"` | なし |
| 他の人が `npm install` | 自動で husky 有効化 | husky 有効化されない |
| pre-commit フック | 全員に強制 | 有効化した人のみ |

**Phase 4 を選ぶ理由**:
- 個人プロジェクトで自分用に使いたい
- チームにはまだ導入提案していない
- 試験的に導入して様子を見たい

## 4.1 husky + lint-staged インストール

```bash
npm install -D husky lint-staged
```

## 4.2 package.json 設定（prepare を使わない）

`package.json`:

```json
{
  "scripts": {
    "husky:install": "husky",
    "secret-scan": "secretlint \"**/*\"",
    "secret-scan:full": "secretlint \"**/*\" && gitleaks detect --source . -v"
  },
  "lint-staged": {
    "*": ["secretlint"]
  }
}
```

**ポイント**: `"prepare": "husky"` ではなく `"husky:install": "husky"` にする。

## 4.3 husky を手動で有効化（自分だけ）

```bash
# husky ディレクトリを初期化
npm run husky:install
```

## 4.4 pre-commit フック作成

`.husky/pre-commit` を作成:

```bash
#!/bin/bash

# secretlint (via lint-staged)
npx lint-staged

# gitleaks (binary with fallback)
if [ -x "./bin/gitleaks" ]; then
  ./bin/gitleaks protect --staged --config gitleaks.toml
elif command -v gitleaks &> /dev/null; then
  gitleaks protect --staged --config gitleaks.toml
else
  echo "⚠️  gitleaks not found. Run: npm run gitleaks:install"
  exit 1
fi
```

実行権限を付与:

```bash
chmod +x .husky/pre-commit
```

## 4.5 動作確認

```bash
echo "# Test" > test.md
git add test.md
git commit -m "test"
# → secretlint + gitleaks が自動実行される
```

## Phase 4 完了時点の状態

**導入した人（あなた）**:
- ✅ `.husky/` フォルダがある
- ✅ pre-commit フックが動く
- ✅ コミット時に自動チェックされる

**他の人が `git clone` & `npm install` したとき**:
- ✅ husky は自動セットアップされない
- ✅ pre-commit フックは動かない
- ✅ 通常通りコミットできる

## 4.6 他の人も使いたくなったら

README やチーム内で共有する手順:

```bash
# 1. gitleaks バイナリをインストール（Docker環境の場合）
npm run gitleaks:install

# 2. husky を手動で有効化
npm run husky:install

# 3. pre-commit フックに実行権限を付与
chmod +x .husky/pre-commit

# 4. 動作確認
echo "# Test" > test.md
git add test.md
git commit -m "test"
# → secretlint + gitleaks が自動実行される
```

## Phase 4 → Phase 3 への移行

チーム全員で使うことが決まったら、`prepare` スクリプトを追加するだけ:

```json
{
  "scripts": {
    "prepare": "husky",
    "husky:install": "husky"
  }
}
```

これで以降は `npm install` 時に全員自動適用される。

---

# Docker 環境での注意点

Docker / Dev Container 環境では、gitleaks がイメージ再構築時に消失する問題がある。

## 問題

| ツール | インストール方法 | Docker再構築時 |
|--------|-----------------|----------------|
| secretlint | npm パッケージ | ✅ `npm install` で自動復元 |
| gitleaks | システムバイナリ | ❌ 消える |

## 解決策: bin/ にバイナリを配置

gitleaks を `bin/gitleaks` に配置し、インストールスクリプトで管理する。

### 手順1: インストールスクリプト作成

`scripts/install-gitleaks.sh`:

```bash
#!/bin/bash
set -e

GITLEAKS_VERSION="8.30.0"
GITLEAKS_BIN="./bin/gitleaks"

echo "🔍 Checking gitleaks installation..."

if [ -x "$GITLEAKS_BIN" ]; then
  echo "✅ gitleaks is already installed"
  exit 0
fi

echo "📥 Downloading gitleaks v${GITLEAKS_VERSION}..."
mkdir -p bin
wget -q --show-progress \
  "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz" \
  -O /tmp/gitleaks.tar.gz

echo "📦 Extracting..."
tar -xzf /tmp/gitleaks.tar.gz -C /tmp gitleaks
mv /tmp/gitleaks "$GITLEAKS_BIN"
chmod +x "$GITLEAKS_BIN"
rm /tmp/gitleaks.tar.gz

echo "✅ gitleaks installed: $($GITLEAKS_BIN version)"
```

### 手順2: npm script 追加

`package.json`:

```json
{
  "scripts": {
    "gitleaks:install": "bash scripts/install-gitleaks.sh",
    "secret-scan": "secretlint \"**/*\"",
    "secret-scan:full": "secretlint \"**/*\" && ./bin/gitleaks detect --source . --config gitleaks.toml -v"
  }
}
```

### 手順3: pre-commit フック修正

`.husky/pre-commit`:

```bash
#!/bin/bash

# secretlint (npm package)
npx lint-staged

# gitleaks (binary with fallback)
if [ -x "./bin/gitleaks" ]; then
  ./bin/gitleaks protect --staged --config gitleaks.toml
elif command -v gitleaks &> /dev/null; then
  gitleaks protect --staged --config gitleaks.toml
else
  echo "⚠️  gitleaks not found. Run: npm run gitleaks:install"
  exit 1
fi
```

### 手順4: .gitignore に追加

```gitignore
# gitleaks binary (large binary file)
bin/gitleaks
```

### 手順5: gitleaks.toml 作成

```toml
title = "Gitleaks config"

[allowlist]
paths = [
  '''node_modules/.*''',
  '''dist/.*''',
]

regexes = [
  '''YOUR_TOKEN_HERE''',
  '''your_api_key_here''',
]
```

## Docker 環境での運用フロー

```
初回セットアップ:
  npm install
  npm run gitleaks:install

開発中:
  git commit → secretlint + gitleaks 自動実行

Docker 再構築後:
  npm install            # secretlint 復元
  npm run gitleaks:install  # gitleaks 復元
```

---

# 検出時の対応フロー

## pre-commit で止まったとき（Phase 3/4）

```bash
git commit -m "add feature"
# 🚨 secretlint found issues...

# 1. 該当ファイルを確認・修正
# 2. 再度 add & commit
git add -A
git commit -m "add feature"
```

## 直前コミットに入ってしまった場合

```bash
# コミット取り消し（変更は残る）
git reset --soft HEAD~1

# 修正して再コミット
git add -A
git commit -m "add feature"
```

## git履歴に残ってしまった場合（要注意）

```bash
# 履歴から完全削除（破壊的操作）
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all

# または BFG Repo-Cleaner（より高速）
bfg --delete-files "filename"
```

**判断**: 軽微なら履歴改変、広範囲ならリポジトリ立ち上げ直しも選択肢。docs/notes に経緯があれば Git ログ消失のダメージは限定的。

---

# よくある検出パターン

| パターン | 例 | 対処 |
|---------|-----|------|
| Slack token | `xoxb-`, `xoxp-` | 即無効化、再発行 |
| AWS | `AKIA...` | 即無効化、IAMで再発行 |
| GitHub | `ghp_`, `gho_` | 即無効化、再発行 |
| OpenAI | `sk-...` | 即無効化、再発行 |
| JWT | `eyJ...` | 用途確認、必要なら再発行 |
| 高entropy文字列 | ランダムな32文字以上 | 本物か確認 |
| .env.example 混入 | 本物の接続文字列 | 重点チェック対象 |

---

# 段階的導入の方針（AI 向けまとめ）

こちらを、段階的に導入していきます。

1. secretlint インストールして `npx secretlint "**/*"` して初回チェック
2. ユーザーに報告しつつ方針検討
3. gitleaks インストールして `gitleaks detect --source . -v` して初回チェック
4. ユーザーに報告しつつ方針検討
5. npm scripts 追加（Phase 2 完了 = ライト版）
6. **ユーザーに確認**: Phase 3（全員強制）か Phase 4（個人用）か？
7. Phase 3 の場合: `prepare: husky` で全員に伝播
8. Phase 4 の場合: `husky:install` で手動有効化、他の人には任意
9. **Docker 環境の場合**: gitleaks を bin/ に配置、インストールスクリプト作成

### 追加検討事項

- 検出されたシークレットの即時無効化（トークン再発行）をユーザーに促す
- allowlist / ignore 設定をユーザーと相談して決める
- AI への指示テンプレート（docs/actions）にシークレット注意事項を追記するか確認
- .env.example がある場合、本物混入がないかの重点チェック
- Docker 環境では gitleaks 消失対策が必要

---

# まとめ

1. **Phase 1 で現状把握**（いきなり自動化しない）
2. **本物は即無効化**、ファイル修正より先にトークン側を止める
3. **Phase 2 で止めてもOK**（ピュアなコミット保持）
4. **Phase 3 は伝播する**ことを理解した上で導入
5. **Phase 4 は自分だけ**、他の人には任意で入れさせる
6. **Docker 環境では gitleaks を bin/ に配置**して永続化
7. **検出 = 防げた、という成功体験として捉える**
8. **最悪リポジトリ立ち上げ直しでも notes があればなんとかなる**
