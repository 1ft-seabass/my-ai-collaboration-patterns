---
tags: [task-management, docs-structure, pattern, workflow]
---

# タスク管理システムの導入 - 開発記録

**作成日**: 2025-10-29
**関連タスク**: パターンテンプレートの機能拡張

## 背景

申し送りシステムが既に導入されているパターンに対して、セッション跨ぎのタスクを管理する仕組みを追加する必要があった。

### 動機

- セッション跨ぎの未完了タスクの可視化が必要
- 申し送りだけでは「次にやること」の管理が弱い
- 優先度付きのタスク管理が欲しい
- 思いついたアイデアや将来の計画を記録する場所が欲しい

### 設計思想

- **申し送りが主役、タスクは補助** - タスクシステムは申し送りのサブツールとして位置づける
- タスクは必ずしも申し送りから生まれない（思いついたアイデアもOK）
- TASK-0001形式（4桁連番、1000個対応）
- ファイル内ステータス管理（Open/Progress/Done/Cancelled）

## 実装内容

### 対象パターン

2つのAI協調パターンに導入：

1. **docs-structure** (メインブランチ用AI協調)
   - パス: `patterns/docs-structure/templates/`

2. **docs-structure-for-target-branch-only** (ブランチ専用AI協調)
   - パス: `patterns/docs-structure-for-target-branch-only/templates/docs/`

### 作成したファイル

各パターンに以下を追加：

#### 1. `tasks/README.md`
- タスク管理システムの説明
- 申し送りとタスクの関係性
- パターンA（申し送りから生まれたタスク）とパターンB（思いついた計画）の説明
- 検索コマンド集（Open/Progress/Done/High優先度などの検索）
- Open Tasks / Progress Tasks テーブル
- タスク作成方法
- タスク作成の基準
- 状態と優先度の定義

#### 2. `tasks/TEMPLATE.md`
- TASK-0XXX形式のテンプレート
- メタデータ（作成日、状態、優先度、推定時間）
- 概要、背景・理由
- 確認項目・チェックリスト
- 関連ドキュメント（申し送り/ノート/思いついた/技術ノート）
- 作業ログ
- 完了条件
- 完了時の記入欄

### 更新したファイル

#### 1. `letter/README.md`
目的セクションに以下を追加：
```markdown
**申し送りとタスクの関係**: セッション跨ぎのタスクは [タスク管理システム](../tasks/README.md) で管理します。申し送りが主役、タスクは補助ツールです。
```

#### 2. `README.md` (ドキュメント目次)
ディレクトリ構成に `tasks/` セクションを追加：
```markdown
### [tasks/](./tasks/) - タスク管理
セッション跨ぎのタスクを管理しています。申し送りのサブツールです。

- **命名規則**: `TASK-0001.md`（4桁連番）
- **テンプレート**: [TEMPLATE.md](./tasks/TEMPLATE.md)
- **関係**: 申し送りが主役、タスクは補助
```

## 実装手順

### 1. docs-structure パターン

```bash
# ディレクトリ作成
mkdir -p patterns/docs-structure/templates/tasks

# ファイル作成
- tasks/README.md
- tasks/TEMPLATE.md

# 既存ファイル更新
- letter/README.md（目的セクションに追記）
- README.md（ディレクトリ構成に追加）
```

### 2. docs-structure-for-target-branch-only パターン

```bash
# ディレクトリ作成
mkdir -p patterns/docs-structure-for-target-branch-only/templates/docs/tasks

# ファイル作成
- docs/tasks/README.md
- docs/tasks/TEMPLATE.md

# 既存ファイル更新
- docs/letters/README.md（目的セクションに追記）
- docs/README.md（ディレクトリ構成に追加）
```

## 導入元資料

Note 83「タスク管理システム導入ガイド（簡易版）」を参考に実装。

この資料には以下が含まれていた：
- タスク管理システムの概要
- 申し送りとの関係性
- セットアップ手順
- README.mdとTEMPLATE.mdの完全なテンプレート
- 検索コマンド集
- 使い方とベストプラクティス

## 完了確認

### 作成されたファイル構造

```
patterns/docs-structure/templates/
└── tasks/
    ├── README.md      ✅
    └── TEMPLATE.md    ✅

patterns/docs-structure-for-target-branch-only/templates/docs/
└── tasks/
    ├── README.md      ✅
    └── TEMPLATE.md    ✅
```

### 更新されたファイル

- `patterns/docs-structure/templates/letter/README.md` ✅
- `patterns/docs-structure/templates/README.md` ✅
- `patterns/docs-structure-for-target-branch-only/templates/docs/letters/README.md` ✅
- `patterns/docs-structure-for-target-branch-only/templates/docs/README.md` ✅

## 特徴

### タスク番号の設計
- **TASK-0001形式**: 4桁連番で1000個のタスクに対応
- ファイル名でソート可能

### 状態管理
- **Open**: 未着手
- **Progress**: 作業中
- **Done**: 完了
- **Cancelled**: キャンセル（理由を記載）

### 優先度管理
- **High** 🔴: 最優先、ブロッカー、緊急
- **Medium** 🟡: 通常の優先度
- **Low** 🟢: オプション、低優先度

### 検索コマンド
grepベースの検索コマンドを提供：
- 状態別検索（Open/Progress/Done）
- 優先度別検索（High/Medium/Low）
- 状態一覧表示

### タスクの生まれ方
1. **申し送りから**: セッション終了時に「次にやること」をタスク化
2. **思いついたアイデア**: ノート読んだり、コード見たりして思いついた計画

## 学び

### 設計のポイント

1. **申し送り中心の設計**
   - タスクは申し送りの補助ツールという位置づけが明確
   - これにより、タスクシステムが肥大化するのを防ぐ

2. **柔軟な起源**
   - タスクは必ずしも申し送りから生まれなくてもOK
   - 思いついたアイデアもタスク化できる自由度

3. **シンプルな管理**
   - ファイルベースの管理（データベース不要）
   - grepで検索可能
   - README.mdのテーブルは参考情報、各ファイルが正

4. **作成基準の明確化**
   - セッション跨ぎそうな作業（1時間以上）
   - 5-10分で終わる単純作業はタスク化しない

### パターン間の一貫性

両方のパターンで同じタスク管理システムを導入することで：
- ユーザーが切り替えても違和感なく使える
- メンテナンス時の変更を両方に反映しやすい

## 今後の期待

このタスク管理システムにより、以下が改善されることが期待される：

1. **セッション跨ぎの継続性向上**
   - 未完了タスクが明確になる
   - 次のセッションで何をすべきか分かりやすい

2. **長期的な計画の管理**
   - 思いついたアイデアを記録できる
   - Phase 3実装などの将来タスクも管理可能

3. **優先度管理**
   - 緊急度・重要度に応じたタスク管理
   - High優先度タスクの可視化

4. **AI協調の効率化**
   - AIが次のセッションで何をすべきか理解しやすい
   - タスクファイルを読むだけで文脈を理解できる

## 関連ドキュメント

- Note 83: タスク管理システム導入ガイド（簡易版）- 導入元資料（別プロジェクト）
- [patterns/docs-structure/templates/tasks/README.md](../../patterns/docs-structure/templates/tasks/README.md)
- [patterns/docs-structure-for-target-branch-only/templates/docs/tasks/README.md](../../patterns/docs-structure-for-target-branch-only/templates/docs/tasks/README.md)

---

**最終更新**: 2025-10-29
**作成者**: AI (Claude)
