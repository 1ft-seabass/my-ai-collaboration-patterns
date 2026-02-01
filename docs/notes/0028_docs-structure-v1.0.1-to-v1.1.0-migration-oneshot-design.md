# docs-structure v1.0.1 → v1.1.0 移行ワンショット設計

**作成日**: 2026-02-01
**関連タスク**: docs-structure v1.1.0 改修 Phase 3

## 背景

Phase 2（テンプレート更新）完了後、既存ファイルを v1.1.0 仕様に移行する必要がある。
このノートでは、汎用的なワンショット指示書の設計を記録する。

### Phase 3 の目的

- **notes**: 連番形式 `NNNN_*.md` → 日時+タイトル形式 `yyyy-mm-dd-hh-mm-ss-title.md`
- **letters**: 日時のみ形式 → 日時+タイトル形式
- **FrontMatter 追加**: `tags` フィールドを既存ファイルに追加

### 重要な設計方針

1. **汎用性**: 特定リポジトリのファイル数を含めない（動的検出）
2. **ワンショット実行**: AI が1セッションで完了できる指示
3. **承認フロー**: 移行計画をユーザーに提示して承認を得る
4. **Phase 2 との整合性**: HTML コメント、Step 構造、トークン削減

---

## migration/ ディレクトリ構成

```
patterns/docs-structure/migration/
├── README.md                              (移行ガイド索引)
└── MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md   (AI向けワンショット指示書)
```

### ファイル役割

**migration/README.md**:
- 移行ガイドの索引（将来的に複数のガイドが並存）
- 現在のバージョンの確認方法
- どのガイドを使うべきかの判定ロジック

**MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md**:
- AI が読んで実行する完全な指示書
- Step-by-Step の実行手順
- エラー処理とロールバック方法

---

## MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md 詳細設計

### 構成

```markdown
# docs-structure v1.0.1 → v1.1.0 移行ガイド（AI 向けワンショット指示書）

<!-- ============================================================
  このファイルは AI が読むワンショット指示書です
  ============================================================ -->

## このガイドの目的
## 前提条件
## Step 1: 移行対象ファイルの検出と分析
## Step 2: 移行計画の生成と提示
## Step 3: 移行の実行
## Step 4: 移行後の確認
## 注意事項
```

### Step 1: 移行対象ファイルの検出と分析

#### 1.1 notes/ の分析

**検出パターン**: `docs/notes/[0-9]{4}_*.md`

**実行コマンド**:
```bash
find docs/notes -name '[0-9][0-9][0-9][0-9]_*.md' | sort
```

**各ファイルについて取得する情報**:

1. **Git 作成日時**:
   ```bash
   git log --format="%ai" --diff-filter=A -- docs/notes/NNNN_title.md | head -1
   ```
   - 出力例: `2025-10-23 14:32:10 +0900`
   - これを `yyyy-mm-dd-hh-mm-ss` 形式に変換

2. **既存タイトル**: ファイル名から `NNNN_` を除いた部分（`.md` も除く）

3. **tags**: ファイル内容を読んで推測（3-5個推奨）
   - 技術キーワード、トピック、パターン名など
   - 既存の他ノートの tags も参考にして統一感を保つ

#### 1.2 letters/ の分析

**検出パターン**: `docs/letters/[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}.md`
（日時のみでタイトルがないファイル）

**実行コマンド**:
```bash
find docs/letters -name '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9].md' | sort
```

**各ファイルについて取得する情報**:

1. **タイムスタンプ**: ファイル名から抽出（そのまま維持）

2. **タイトル生成**: ファイル内容を読んで生成
   - セッションの主要テーマを抽出
   - 30文字以内目安
   - ケバブケース推奨（例: `actions-pattern-refactoring`）

3. **tags**: ファイル内容から推測（3-5個推奨）

### Step 2: 移行計画の生成と提示

#### 2.1 移行計画フォーマット

以下の形式でチェックボックス付き移行計画を生成し、ユーザーに提示する:

```markdown
## 📋 移行計画

### notes/ 移行対象
- [ ] NNNN_original-title.md
      → yyyy-mm-dd-hh-mm-ss-original-title.md
      tags: [tag1, tag2, tag3]
      (Git作成日時: yyyy-mm-dd hh:mm:ss +timezone)

- [ ] ...

### letters/ 移行対象
- [ ] yyyy-mm-dd-hh-mm-ss.md
      → yyyy-mm-dd-hh-mm-ss-generated-title.md
      tags: [tag1, tag2]
      (生成タイトル: 内容から抽出)

- [ ] ...

---

**移行ファイル数**: notes N件、letters M件
**確認事項**:
- タイトルは適切ですか？
- tags は内容を反映していますか？
- タイムスタンプに誤りはありませんか？

この計画で移行を実行しますか？ [y/N]
```

#### 2.2 ユーザー承認待ち

- 移行計画を提示後、ユーザーの承認を待つ
- 修正が必要な場合は対話的に調整

### Step 3: 移行の実行

#### 3.1 実行手順（1ファイルずつ）

承認後、以下を **各ファイルについて順番に** 実行:

**3.1.1 FrontMatter の追加**

ファイルの先頭に FrontMatter を追加:

```yaml
---
tags: [tag1, tag2, tag3]
---

```

**注意**:
- 既存の1行目（タイトル行）の前に挿入
- 空行を1行入れる

**3.1.2 ファイル名変更**

```bash
git mv docs/notes/NNNN_title.md docs/notes/yyyy-mm-dd-hh-mm-ss-title.md
```

または

```bash
git mv docs/letters/yyyy-mm-dd-hh-mm-ss.md docs/letters/yyyy-mm-dd-hh-mm-ss-title.md
```

**3.1.3 進捗表示**

```
✅ 0001_degit-understanding.md → 2025-10-23-14-32-10-degit-understanding.md
✅ 0002_actions-exploration.md → 2025-10-24-09-15-22-actions-exploration.md
...
```

#### 3.2 エラー処理

**Git ログが取得できない場合**（notes）:
- ユーザーに手動で日時を指定してもらう
- デフォルトで現在時刻を提案

**タイトル生成が困難な場合**（letters）:
- ファイル内の最初の見出しを使用
- それも無い場合はユーザーに確認

### Step 4: 移行後の確認

#### 4.1 確認コマンド

```bash
# 旧形式のファイルが残っていないか確認
find docs/notes -name '[0-9][0-9][0-9][0-9]_*.md'
find docs/letters -name '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9].md'

# 新形式のファイルを確認
ls docs/notes/
ls docs/letters/
```

#### 4.2 Git 状態確認

```bash
git status
git diff --cached
```

### 注意事項

#### ⚠️ 重要
- **Git 管理**: 移行は git mv を使用するため、変更履歴が保持される
- **ロールバック**: 問題があれば `git reset --hard` で戻せる（コミット前）
- **FrontMatter の tags のみ**: `created` は追加しない（ファイル名と重複）
- **タイムスタンプの時差**: UTC/JST 混在は許容

#### 💡 Tips
- 大量ファイル（50件以上）の場合は10件ずつ承認を分割推奨
- tags は後から追加・修正可能（完璧を求めない）
- タイトルは30文字を大幅に超えない（可読性）

---

## migration/README.md 詳細設計

### 構成

```markdown
# docs-structure 移行ガイド

## 現在のバージョンの確認方法
## 利用可能な移行ガイド
## 移行の基本フロー
## 注意事項
```

### 現在のバージョンの確認方法

プロジェクトが使用している docs-structure のバージョンを確認する方法：

#### 方法1: TEMPLATE.md の構造で判定

```bash
# v1.0.1 以前: README と TEMPLATE が分離
ls docs/templates/notes/README.md docs/templates/notes/TEMPLATE.md

# v1.1.0: TEMPLATE にガイドが集約、README は3-5行
head -10 docs/templates/notes/README.md
```

#### 方法2: FrontMatter の有無で判定

```bash
# v1.0.1 以前: FrontMatter なし
# v1.1.0: FrontMatter あり（tags のみ）
head -5 docs/templates/notes/TEMPLATE.md
```

#### 方法3: ファイル命名規則で判定

```bash
# v1.0.1 以前:
#   - notes: 0001_title.md（連番）
#   - letters: yyyy-mm-dd-hh-mm-ss.md（日時のみ）

# v1.1.0:
#   - notes: yyyy-mm-dd-hh-mm-ss-title.md
#   - letters: yyyy-mm-dd-hh-mm-ss-title.md
ls docs/notes/ docs/letters/
```

### 利用可能な移行ガイド

#### v1.0.1 → v1.1.0
- **ガイド**: [MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md](./MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md)
- **主な変更**:
  - FrontMatter 導入（tags のみ）
  - 命名規則統一（`yyyy-mm-dd-hh-mm-ss-{title}.md`）
  - TEMPLATE への情報集約
- **対象**: v1.0.1 形式で稼働中のプロジェクト

### 移行の基本フロー

#### Step 1: バージョン確認
上記の方法で現在のバージョンを確認

#### Step 2: Phase 2（テンプレート更新）
```bash
# degit で最新の templates/ を取得
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure/templates docs/templates --force

# または手動で patterns/docs-structure/templates/ の内容をコピー
```

#### Step 3: Phase 3（既存ファイル移行）
該当する移行ガイドを AI に読ませてワンショット実行

### 注意事項

- **Git 管理**: 移行は git mv を使用するため、変更履歴が保持されます
- **ロールバック**: 問題があれば `git reset --hard` で戻せます（コミット前）
- **段階的実行**: 大規模プロジェクト（100ファイル以上）の場合は段階的移行を推奨
- **バックアップ**: 心配な場合は、移行前にリポジトリ全体をコピー推奨

---

## 設計のポイント

### 1. 汎用性の確保

**特定リポジトリのファイル数を含めない**:
- ❌ 悪い例: `notes/ (26ファイル)` → 特定リポジトリ固有
- ✅ 良い例: `notes/ 移行対象` → 動的に検出

**検出ロジックとフォーマットを記述**:
- パターンマッチング（`find` コマンド）
- 各ファイルについて取得する情報のロジック
- 出力フォーマットの例示

### 2. Phase 2 構想との整合性

**HTML コメント**:
```markdown
<!-- ============================================================
  このファイルは AI が読むワンショット指示書です
  ============================================================ -->
```

**Step 構造**:
- Step 1 → Step 2 → Step 3 → Step 4
- 明確な実行順序

**トークン削減**:
- 1ファイルで完結（MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md）
- README は索引のみ

### 3. 将来の拡張性

**バージョン特化命名**:
- `MIGRATION_GUIDE_v{from}_to_{to}.md`
- 例: `MIGRATION_GUIDE_v1.1.0_to_v2.0.0.md`（将来）

**複数の移行ガイドが並存可能**:
```
migration/
├── README.md
├── MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md
└── MIGRATION_GUIDE_v1.1.0_to_v2.0.0.md  (将来)
```

**migration/README.md で索引管理**:
- どのガイドを使うべきかの判定ロジック
- バージョン確認方法

### 4. AI とのワークフロー親和性

**ブランチを切らない前提**:
- AI は基本的にブランチを切らずに作業する
- `git mv` で履歴を保持
- コミット前なら `git reset --hard` でロールバック

**承認フロー**:
- 移行計画を提示してユーザーが承認
- 修正が必要な場合は対話的に調整

---

## まとめ

### Phase 3 ワンショット構想の完成

**成果物**:
1. `patterns/docs-structure/migration/README.md` の完全な仕様
2. `patterns/docs-structure/migration/MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md` の完全な仕様

**特徴**:
- どのリポジトリでも使える汎用性
- AI が1セッションで完了できる明確な指示
- Phase 2 構想との整合性
- 将来のバージョンアップに対応

**次のステップ**:
- Phase 2 完了後、このノートを参照して実際の migration/ ファイルを作成
- ワンショット実行で既存ファイルを移行

---

## 関連ドキュメント

- [0027: docs-structure v1.0.1 → v1.1.0 改修計画](./0027_docs-structure-v1.0.1-to-v1.1.0-refactoring-plan.md) - Phase 2 の詳細設計
- [0026: docs-structure 改善の壁打ち](./0026_docs-structure-improvement-brainstorm.md) - 改善案の初期検討

---

**最終更新**: 2026-02-01
**作成者**: Claude Sonnet 4.5 (with 1ft-seabass)
