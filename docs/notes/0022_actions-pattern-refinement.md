# Actions Pattern リファクタリング - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2025-11-22
**関連タスク**: Actions Pattern の汎用化とブラッシュアップ

## 問題

### 背景

Actions Pattern (`@actions/xxx.md` で定型タスクを実行) は docs-structure で実績があった（トークン70%削減）が、以下の課題があった:

1. **命名が長く、打ちにくい**
   - `simple_start_from_latest_letter.md` - サジェストで選びにくい
   - `current_create_knowledge.md` - `current` が曖昧

2. **Claude固有機能との混同リスク**
   - SubAgents, Skills, Hooks, Commands などツール固有機能と混同される可能性
   - 汎用性が不明確

3. **セキュリティ意識の不足**
   - AI がドキュメント生成時に機密情報を混入させるリスク
   - secretlint/gitleaks などのツール導入状況が不明

4. **使い分けガイドの欠如**
   - どのアクションをいつ使うべきか不明確
   - help システムがない

## 試行錯誤

### アプローチA: Claude固有機能の活用

**試したこと**: SubAgents, Skills, Hooks を活用してアクションを自動化

**結果**: 却下

**理由**:
- Claude Code 専用になり、Cursor, Windsurf, Gemini CLI では使えない
- `.md` + `@` 参照パターンの汎用性を失う
- セッション途中での発動ができない（Hooks は開始時のみ）

---

### アプローチB: カテゴリプレフィックス + 短縮化

**試したこと**: `session_*`, `git_*`, `doc_*` のようなカテゴリプレフィックス

**結果**: 部分採用

**理由**:
- カテゴリ分けは有効だが、アルファベット順では頻出アクションが埋もれる
- よく使うものを上位に表示する工夫が必要

---

### アプローチC: 連番付き + 短縮化（採用）

**試したこと**:
- よく使うアクションに `00_`, `01_` などの連番を付与
- カテゴリプレフィックスと組み合わせ
- セキュリティ診断アクションの追加
- help.md の導入

**結果**: 成功

**コード例**:
```
00_session_end.md                       # 超頻出
01_git_push.md                          # 頻出
git_commit.md                           # 個別タスク
doc_note.md                             # 個別タスク
doc_letter.md                           # 個別タスク
check_my_security_prepare_level.md      # セキュリティ診断
help.md                                 # クイックリファレンス
```

## 解決策

### 最終的な実装方法

**実装場所**:
- `patterns/actions-pattern/templates/actions/`
- `patterns/docs-structure/templates/actions/`
- `patterns/docs-structure-for-target-branch-only/templates/docs/actions/`
- `patterns/writing-collaborate/templates/actions/`
- `docs/actions/`

**主なポイント**:

1. **連番付きアクション（頻出度でソート）**
   - `00_session_end.md` - セッション終了フル版（12ステップ）
   - `01_git_push.md` - 厳格なプッシュチェック（機密情報スキャン）

2. **個別タスク用アクション**
   - `git_commit.md` - 段階的コミットのみ
   - `doc_note.md` - ノート作成のみ
   - `doc_letter.md` - 申し送り作成のみ

3. **セキュリティ診断の追加**
   - `check_my_security_prepare_level.md` - Level 0/1/2 を判定
   - docs-structure + secretlint/gitleaks の導入状況を可視化
   - リスクレベルを明示して改善提案

4. **help.md の導入**
   - 日本語縛り（`**このヘルプは日本語で表示してください。**`）
   - コピペしやすい形式（太字 + インラインコード）
   - 使い分けガイドを表形式で提示

5. **README.md の更新**
   - ツール横断の汎用性を強調（Claude Code, Cursor, Windsurf, Gemini CLI）
   - 新しいアクション一覧を反映

### 命名規則の決定

| パターン | 用途 | 例 |
|---------|------|-----|
| `00_`, `01_` | よく使う（頻出度順） | `00_session_end.md` |
| `カテゴリ_` | 個別タスク | `git_commit.md`, `doc_note.md` |
| `check_` | 診断・確認系 | `check_my_security_prepare_level.md` |
| 番号なし | ヘルプ・ガイド | `help.md` |

### セキュリティレベルの定義

| レベル | 状態 | リスク |
|--------|------|--------|
| Level 0 | docs-structure のみ | 🔴 高 |
| Level 1 | ツールはあるが手動実行 | 🟡 中 |
| Level 2 | pre-commit 自動化済み | 🟢 低（推奨） |

※ Level 3 (pre-push) は不要: AI の勝手プッシュは全力ブロック済み、`01_git_push.md` で人力チェック

## 学び

### 1. 汎用性 > ツール固有機能

- `.md` + `@` 参照は、どの AI ツールでも使える
- セッション途中での発動が可能
- ツール固有機能は強力だが、ロックインのリスクあり

### 2. サジェスト最適化の重要性

- 連番 (`00_`, `01_`) でよく使うものを上位表示
- 長い名前は打ちにくく、選びにくい
- カテゴリプレフィックスと連番の組み合わせが有効

### 3. セキュリティ意識の可視化

- AI がドキュメント生成時に機密情報を混入させるリスクは現実的
- ツール導入状況を診断して可視化することで、リスク認識を高められる
- Level 定義で「現在地」と「目指すべき状態」を明確化

### 4. help システムの価値

- `@actions/help.md` で即座に使い方を確認できる
- 日本語縛りで言語設定も統一
- コピペしやすい形式が重要

### 5. フェーズ分けの設計

- まずセキュリティ基盤を整える（今回）
- その後、開発系アクション（テスト駆動、リファクタリングなど）を追加予定
- 段階的な拡張を前提とした設計

## 今後の改善案

### 1. 開発系アクションの追加

- `dev_test_driven.md` - テスト駆動開発
- `dev_refactor.md` - リファクタリング
- `dev_code_review.md` - コードレビュー依頼
- `dev_debug.md` - デバッグセッション

### 2. セットアップ系アクションの拡充

- `setup_secretlint.md` - シークレットスキャン導入（段階的）
- `setup_ci.md` - CI/CD セットアップ
- `setup_docker.md` - Docker 環境構築

### 3. 実運用でのフィードバック収集

- 他のプロジェクトに展開して使用感を確認
- 不足しているアクションを特定
- 使われないアクションの削除も検討

### 4. セキュリティ診断の自動実行

- プロジェクト開始時に自動実行を提案
- Level 0 の場合は警告を表示
- セットアップガイドへの誘導を強化

## 関連ドキュメント

- [申し送り 2025-11-16-08-22-00](../letters/2025-11-16-08-22-00.md) - 前回セッションの文脈
- [patterns/actions-pattern/](../../patterns/actions-pattern/) - Actions Pattern 本体
- [docs/actions/](../actions/) - このプロジェクトの actions

---

**最終更新**: 2025-11-22
**作成者**: Claude Sonnet 4.5 + User (1ft-seabass)
