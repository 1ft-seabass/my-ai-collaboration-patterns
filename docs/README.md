# ドキュメント目次

このディレクトリには、`my-ai-collaboration-patterns` リポジトリの開発・運用に関するドキュメントが整理されています。

## 📂 ディレクトリ構成

### [ai-collaboration/](./ai-collaboration/) - AI協働開発ガイド
AIアシスタントと効率的に協働開発するための汎用ルール・ガイドラインを格納しています。

- AI協働開発ガイド（ワンショット版）v1.3.0
- 基本原則、ドキュメント戦略、申し送りメカニズム等

### [development/](./development/) - 開発ガイド
このプロジェクト固有の開発手順、ベストプラクティスを格納しています。

- [best-practices/](./development/best-practices/) - ベストプラクティス集

### [architecture/](./architecture/) - アーキテクチャ設計
システムアーキテクチャに関するドキュメントを格納しています。

- [decisions/](./architecture/decisions/) - ADR（Architecture Decision Records）

### [letter/](./letter/) - 申し送り
セッション間の引き継ぎ、作業状況の記録を時系列で格納しています。

- **命名規則**: `YYYY-MM-DD-HH-MM-SS.md`
- **テンプレート**: [TEMPLATE.md](./letter/TEMPLATE.md)

### [tasks/](./tasks/) - タスク管理
セッション跨ぎのタスクを管理しています。申し送りのサブツールです。

- **命名規則**: `TASK-0001.md`（4桁連番）
- **テンプレート**: [TEMPLATE.md](./tasks/TEMPLATE.md)
- **関係**: 申し送りが主役、タスクは補助

### [notes/](./notes/) - 開発ノート
技術的な試行錯誤、問題解決の記録を格納しています。

- **命名規則**: `XX_タイトル.md`（連番付き）
- **テンプレート**: [TEMPLATE.md](./notes/TEMPLATE.md)

### [spec/](./spec/) - 仕様書
機能仕様、API仕様などを格納しています。

### [actions/](./actions/) - タスク自動化指示書
繰り返し実行するタスクの明確な指示書を格納しています。

- **使い方**: `@actions/ファイル名.md` でAIに読み込ませる
- **効果**: トークン消費を約70%削減
- **例**:
  - `git_commit_and_push.md` - 段階的なコミット・プッシュ
  - `current_create_knowledge.md` - 知見のまとめ作成
  - `simple_start_from_latest_letter.md` - 申し送りからセッション開始

## 🤖 AIへの指示例

### セッション開始時
```
「docs/README.md を読んで、最新の申し送りを確認してください」
```

### AI協働開発ガイドを読ませる
```
「docs/ai-collaboration/ のガイドを読んで、
このプロジェクトの開発スタイルを理解してください」
```

### 申し送り作成
```
「今日の作業内容を docs/letter/ に申し送りとして記録してください」
```

### actionsの活用（推奨）
```
# セッション開始時
@actions/simple_start_from_latest_letter.md

# 知見をまとめたいとき
@actions/current_create_knowledge.md

# 作業完了時
@actions/git_commit_and_push.md
```

## 📝 ドキュメント管理の原則

1. **README駆動**: すべてのディレクトリに README.md を配置
2. **階層を浅く**: 3〜4層まで
3. **小分けの原則**: 1ファイル = 1知見（50-150行が目安）
4. **命名規則の統一**: kebab-case、連番（必要に応じて）

## 🔗 関連リンク

- [トップREADME](../README.md) - リポジトリ概要
- [SETUP.md](../SETUP.md) - セットアップ指示書
