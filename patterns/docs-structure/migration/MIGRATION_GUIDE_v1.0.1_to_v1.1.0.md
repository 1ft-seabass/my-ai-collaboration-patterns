# docs-structure v1.0.1 → v1.1.0 移行ガイド（AI 向けワンショット指示書）

<!-- ============================================================
  このファイルは AI が読むワンショット指示書です
  ============================================================ -->

## このガイドの目的

既存の docs-structure v1.0.1 形式のファイルを v1.1.0 形式に移行します。

**主な変更内容**:
- **notes**: `0001_title.md` → `yyyy-mm-dd-hh-mm-ss-title.md`
- **letters**: `yyyy-mm-dd-hh-mm-ss.md` → `yyyy-mm-dd-hh-mm-ss-title.md`
- **FrontMatter 追加**: `tags` フィールドを全ファイルに追加

---

## 前提条件

- Phase 2（テンプレート更新）が完了していること
- Git リポジトリで管理されていること
- コミット前の状態（いつでもロールバック可能）

---

## Step 1: 移行対象ファイルの検出と分析

### 1.1 notes/ の分析

**検出コマンド**:
```bash
find docs/notes -name '[0-9][0-9][0-9][0-9]_*.md' | sort
```

**各ファイルについて取得する情報**:

#### 1.1.1 Git 作成日時

```bash
git log --format="%ai" --diff-filter=A -- docs/notes/NNNN_title.md | head -1
```

**出力例**: `2025-10-23 14:32:10 +0900`

**変換方法**: `yyyy-mm-dd-hh-mm-ss` 形式に変換
- 例: `2025-10-23 14:32:10 +0900` → `2025-10-23-14-32-10`

#### 1.1.2 連番ファイルの時間ずらし処理

**問題**: 同じ Git 作成日時のファイル群では、タイムスタンプが重複する

**例**:
```bash
# Git ログの結果
0001_degit-understanding.md         → 2025-11-17 23:47:27 +0900
0002_pattern-structure-design.md    → 2025-11-17 23:47:27 +0900 (同じ！)
0003_repository-dogfooding.md       → 2025-11-17 23:47:27 +0900 (同じ！)
```

このままだと、すべて `2025-11-17-23-47-27-` で始まるファイル名になり、時系列が失われる。

**解決方法**: 連番順に1秒ずつ加算してファイル名の一意性を保証

```bash
# 時間調整後
0001_degit-understanding.md         → 2025-11-17-23-47-27-degit-understanding.md      (+0秒)
0002_pattern-structure-design.md    → 2025-11-17-23-47-28-pattern-structure-design.md (+1秒)
0003_repository-dogfooding.md       → 2025-11-17-23-47-29-repository-dogfooding.md    (+2秒)
```

**実装方針**:
1. 同じ Git 作成日時のファイルをグループ化
2. グループ内で連番順にソート
3. 基準時刻から順に +0秒、+1秒、+2秒... と加算

**実装例**:
```bash
# 同一Git時刻のグループを処理
base_timestamp="2025-11-17 23:47:27 +0900"
offset=0

for file in $(同じGit時刻のファイル群を連番順); do
    # offset 秒を加算
    adjusted_time=$(date -d "$base_timestamp + $offset seconds" +"%Y-%m-%d-%H-%M-%S")
    echo "$file → $adjusted_time-title.md"
    offset=$((offset + 1))
done
```

**メリット**:
- ファイル名の一意性が保証される
- 連番の順序（作成順序）がタイムスタンプに反映される
- `ls` でソートしても正しい順序になる

#### 1.1.3 既存タイトル

ファイル名から `NNNN_` を除いた部分（`.md` も除く）

- 例: `0001_degit-understanding.md` → `degit-understanding`

#### 1.1.4 tags の推測

ファイル内容を読んで 3-5 個の tags を推測:
- 技術キーワード（例: degit, npm, git）
- トピック（例: template, documentation）
- パターン名（例: docs-structure, actions-pattern）

**推測方法**:
1. ファイル内容を読む
2. 主要なキーワードを抽出
3. 既存の他ノートの tags も参考にして統一感を保つ

---

### 1.2 letters/ の分析

**検出コマンド**:
```bash
find docs/letters -name '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9].md' | sort
```

**各ファイルについて取得する情報**:

#### 1.2.1 タイムスタンプ

ファイル名から抽出（そのまま維持）

- 例: `2026-02-01-14-00-00.md` → `2026-02-01-14-00-00`

#### 1.2.2 タイトル生成

ファイル内容を読んで生成:
- セッションの主要テーマを抽出
- 30文字以内目安
- ケバブケース推奨（例: `phase2-implementation-complete`）

**生成方法**:
1. ファイル内容を読む
2. 最初の見出し（`# 申し送り（...）`）を参照
3. または「完了」「次にやること」セクションから主要テーマを抽出
4. 短くわかりやすいタイトルに変換

#### 1.2.3 tags の推測

ファイル内容から 3-5 個の tags を推測（notes と同様）

---

## Step 2: 移行計画の生成と提示

### 2.1 移行計画フォーマット

以下の形式でチェックボックス付き移行計画を生成し、ユーザーに提示する:

```markdown
## 📋 移行計画

### notes/ 移行対象（N件）

- [ ] 0001_degit-understanding.md
      → 2025-11-17-23-47-27-degit-understanding.md
      tags: [degit, npm, template]
      (Git作成日時: 2025-11-17 23:47:27 +0900 / 時間調整: +0秒)

- [ ] 0002_pattern-structure-design.md
      → 2025-11-17-23-47-28-pattern-structure-design.md
      tags: [pattern, design, structure]
      (Git作成日時: 2025-11-17 23:47:27 +0900 / 時間調整: +1秒)

- [ ] 0003_repository-dogfooding.md
      → 2025-11-17-23-47-29-repository-dogfooding.md
      tags: [dogfooding, repository, best-practice]
      (Git作成日時: 2025-11-17 23:47:27 +0900 / 時間調整: +2秒)

（...全てのファイルをリスト...）

---

### letters/ 移行対象（M件）

- [ ] 2026-02-01-14-00-00.md
      → 2026-02-01-14-00-00-phase2-implementation-complete.md
      tags: [docs-structure, phase2, v1.1.0]
      (生成タイトル: phase2-implementation-complete)

（...全てのファイルをリスト...）

---

**移行ファイル数**: notes N件、letters M件

**確認事項**:
- タイトルは適切ですか？
- tags は内容を反映していますか？
- タイムスタンプに誤りはありませんか？
- 同一Git時刻のファイル群は連番順に時間調整されていますか？（+0秒、+1秒、+2秒...）

この計画で移行を実行しますか？ [y/N]
```

### 2.2 ユーザー承認待ち

**重要**: 移行計画を提示後、**ユーザーの承認を待つ**

- 修正が必要な場合は対話的に調整
- ユーザーが承認するまで Step 3 に進まない

---

## Step 3: 移行の実行

承認後、以下を **各ファイルについて順番に** 実行:

### 3.1 実行手順（1ファイルずつ）

#### 3.1.1 ファイル内容を読み取る

```bash
cat docs/notes/0001_degit-understanding.md
```

#### 3.1.2 FrontMatter を追加

ファイルの先頭に FrontMatter を追加:

```yaml
---
tags: [tag1, tag2, tag3]
---

```

**注意**:
- 既存の1行目（タイトル行 `# ...`）の前に挿入
- FrontMatter の後に空行を1行入れる
- `created` フィールドは追加しない（ファイル名と重複）

#### 3.1.3 ファイル名変更

**notes/ の場合**:
```bash
git mv docs/notes/0001_degit-understanding.md docs/notes/2025-10-23-14-32-10-degit-understanding.md
```

**letters/ の場合**:
```bash
git mv docs/letters/2026-02-01-14-00-00.md docs/letters/2026-02-01-14-00-00-phase2-implementation-complete.md
```

**重要**: `git mv` を使用することで変更履歴が保持される

#### 3.1.4 進捗表示

各ファイル処理後に進捗を表示:

```
✅ 0001_degit-understanding.md → 2025-10-23-14-32-10-degit-understanding.md
✅ 0002_actions-exploration.md → 2025-10-24-09-15-22-actions-exploration.md
...
```

---

### 3.2 エラー処理

#### Git ログが取得できない場合（notes）

以下の順で対処:

1. ユーザーに手動で日時を指定してもらう
2. デフォルトで現在時刻を提案（`date +"%Y-%m-%d-%H-%M-%S"`）

#### タイトル生成が困難な場合（letters）

以下の順で対処:

1. ファイル内の最初の見出しを使用
2. それも無い場合はユーザーに確認
3. デフォルトで `session-handover` などの汎用タイトルを提案

---

## Step 4: 移行後の確認

### 4.1 確認コマンド

#### 旧形式のファイルが残っていないか確認

```bash
# notes/ の旧形式
find docs/notes -name '[0-9][0-9][0-9][0-9]_*.md'

# letters/ の旧形式
find docs/letters -name '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9].md'
```

**期待結果**: 何も出力されない（旧形式が存在しない）

#### 新形式のファイルを確認

```bash
ls docs/notes/
ls docs/letters/
```

**期待結果**: 全てが `yyyy-mm-dd-hh-mm-ss-title.md` 形式

---

### 4.2 Git 状態確認

```bash
git status
git diff --cached
```

**確認項目**:
- renamed（名前変更）として認識されているか
- FrontMatter が正しく追加されているか
- 意図しない変更が含まれていないか

---

### 4.3 サンプルファイルの内容確認

いくつかのファイルをランダムに選んで内容を確認:

```bash
head -10 docs/notes/yyyy-mm-dd-hh-mm-ss-title.md
head -10 docs/letters/yyyy-mm-dd-hh-mm-ss-title.md
```

**確認項目**:
- FrontMatter が正しく追加されているか
- tags が適切か
- 既存の内容が壊れていないか

---

## 注意事項

### ⚠️ 重要

- **Git 管理**: 移行は `git mv` を使用するため、変更履歴が保持される
- **ロールバック**: 問題があれば `git reset --hard` で戻せる（コミット前）
- **FrontMatter の tags のみ**: `created` は追加しない（ファイル名と重複）
- **タイムスタンプの時差**: UTC/JST 混在は許容（Git ログの日時をそのまま使用）
- **コミットは別途**: この移行ガイドはコミットを実行しない（ユーザーが確認後にコミット）

---

### 💡 Tips

- **大量ファイル（50件以上）の場合**: 10件ずつ承認を分割推奨
- **tags は後から修正可能**: 完璧を求めない（後で調整できる）
- **タイトルは30文字を大幅に超えない**: 可読性のため
- **処理時間の見積もり**: 1ファイルあたり数秒〜10秒程度

---

### 🔄 ロールバック方法

移行途中または移行後に問題が発生した場合:

```bash
# 全ての変更を破棄（コミット前）
git reset --hard

# ステージングエリアのみクリア（変更は保持）
git reset
```

**注意**: コミット後はロールバックが複雑になるため、必ずコミット前に確認

---

## 実行例

### 小規模プロジェクト（10ファイル以下）

1. Step 1 で全ファイルを検出
2. Step 2 で全ファイルの移行計画を提示
3. ユーザー承認後、Step 3 で一括実行
4. Step 4 で確認

### 中規模プロジェクト（10-50ファイル）

1. Step 1 で全ファイルを検出
2. Step 2 で全ファイルの移行計画を提示
3. ユーザー承認後、Step 3 で一括実行
4. Step 4 で確認

### 大規模プロジェクト（50ファイル以上）

1. Step 1 で全ファイルを検出
2. Step 2 で10件ずつ移行計画を提示
3. ユーザー承認後、Step 3 で10件ずつ実行
4. 10件ごとに Step 4 で確認
5. 全ファイル完了まで繰り返し

---

## 移行完了後のチェックリスト

- [ ] 旧形式のファイルが残っていない
- [ ] 新形式のファイル名が正しい
- [ ] FrontMatter が全ファイルに追加されている
- [ ] tags が適切に設定されている
- [ ] Git 履歴が保持されている（`git log --follow` で確認）
- [ ] 意図しない変更が含まれていない（`git diff --cached` で確認）
- [ ] サンプルファイルの内容が壊れていない

---

**作成日**: 2026-02-01
**対象バージョン**: v1.0.1 → v1.1.0
**最終更新**: 2026-02-01
