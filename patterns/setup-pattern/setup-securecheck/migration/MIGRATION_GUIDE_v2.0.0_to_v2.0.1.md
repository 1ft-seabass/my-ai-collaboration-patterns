# setup-securecheck v2.0.0 → v2.0.1 移行ガイド（AI 向けウィザード指示書）

<!-- ============================================================
  このファイルは AI が読むウィザード指示書です
  ============================================================ -->

## このガイドの目的

setup-securecheck v2.0.0 を適用済みのプロジェクトを v2.0.1 に更新します。

**変更内容**:
- pre-commit の secretlint を `"**/*"`（全件）から staged ファイルのみに変更
- コミット時間: 数秒〜10分超 → 数秒に改善

**変更するファイル**: `scripts/pre-commit.js` のみ

---

## 📋 この指示書の理解チェック

作業を開始する前に、以下の手順を理解したことをチェックボックスで提示してください：

- [ ] Step 1: 現状確認（現在の pre-commit.js が v2.0.0 版であることを確認）
- [ ] Step 2: pre-commit.js を v2.0.1 版に更新
- [ ] Step 3: 動作確認

### 重要ルール
- [ ] コミットは実行しない（ユーザーが確認後にコミット）
- [ ] 各 Step でユーザー承認を待つ（勝手に進まない）

理解できましたか？ゴーサインをください。

---

## 前提条件

- setup-securecheck v2.0.0 で導入済みのプロジェクト（simple-git-hooks 構成）
- `scripts/pre-commit.js` が存在すること

---

## Step 1: 現状確認

現在の `pre-commit.js` が v2.0.0 版（全件スキャン）であることを確認します。

```bash
grep -n "secretlint" scripts/pre-commit.js
```

| 出力内容 | 状態 |
|---|---|
| `secretlint "**/*"` が含まれる | v2.0.0 版 → Step 2 で更新が必要 |
| `git diff --cached` が含まれる | v2.0.1 版 → 既に更新済み、作業不要 |

**確認が取れたら Step 2 に進みます。ユーザーに確認を求めてください。**

---

## Step 2: pre-commit.js を v2.0.1 版に更新

degit で最新テンプレートを取得し、`scripts/pre-commit.js` を上書きします。

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck/templates/scripts tmp/securecheck-v2.0.1-scripts
```

```bash
cp tmp/securecheck-v2.0.1-scripts/pre-commit.js scripts/pre-commit.js
```

**確認コマンド**:

```bash
grep -n "git diff --cached" scripts/pre-commit.js
```

**期待する結果**: `git diff --cached` が含まれている（staged のみスキャンの目印）。

**確認が取れたら Step 3 に進みます。ユーザーに確認を求めてください。**

---

## Step 3: 動作確認

### 3.1 ヘルスチェック

```bash
npm run security:verify
```

**期待する結果**: 11 項目すべて ✅（既存の設定は変更していないので構成は同じ）

### 3.2 テストコミットで速度を確認

適当なファイルを 1 行編集してステージしてからコミットしてみてください：

```bash
git add <任意のファイル>
git commit -m "test: v2.0.1 staged scan"
```

**期待する結果**:
- secretlint がステージされたファイルのみをスキャン（数秒で完了）
- gitleaks が実行される
- `.logs/pre-commit.log` にログが記録される

**テストコミットは取り消してもOKです**：

```bash
git reset HEAD~1
```

---

## 移行完了

移行が完了しました。

**変更されたファイル**:
- `scripts/pre-commit.js` — secretlint を staged ファイルのみのスキャンに変更

**変更されていないファイル**: `package.json` / `.gitignore` / `.secretlintrc.json` / `gitleaks.toml` など（変更不要）

**次の作業**:
- `git diff scripts/pre-commit.js` で変更内容を確認
- 問題なければコミット

---

## ⚠️ 注意事項

- `npm run secret-scan`（`npx secretlint "**/*"`）はリポジトリ全体のスキャンコマンドとして引き続き使えます
- pre-commit は「このコミットに入る差分だけをチェック」、`secret-scan` は「全件監査」と役割が分かれました
