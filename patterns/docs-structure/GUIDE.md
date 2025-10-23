# AI協働開発向けドキュメント構造 - 作成ガイド

> **対象**: AIアシスタント（Claude Code等）
> **目的**: プロジェクトにAI可読なドキュメント構造を作成する
> **所要時間**: 約5分

## 🎯 このガイドの使い方

このガイドを読んだAIアシスタントは、プロジェクトに以下の構造を作成してください：

```
docs/
├── README.md
├── ai-collaboration/
│   ├── README.md
│   └── AI_COLLABORATION_GUIDE.md
├── development/
│   ├── README.md
│   └── best-practices/
│       └── README.md
├── architecture/
│   ├── README.md
│   └── decisions/
│       └── README.md
├── letter/
│   ├── README.md
│   └── TEMPLATE.md
├── notes/
│   ├── README.md
│   └── TEMPLATE.md
└── spec/
    └── README.md
```

## 📋 作成手順

### ステップ1: ディレクトリ作成

```bash
mkdir -p docs/{ai-collaboration,development/best-practices,architecture/decisions,letter,notes,spec}
```

### ステップ2: 各ファイルを作成

degit で取得した場合はすべてのファイルが含まれていますが、ゼロから作成する場合は以下を参考にしてください。

#### `docs/README.md`

```markdown
# ドキュメント目次

このディレクトリには、プロジェクトの開発・運用に関するドキュメントが整理されています。

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

### [notes/](./notes/) - 開発ノート
技術的な試行錯誤、問題解決の記録を格納しています。

- **命名規則**: `XX_タイトル.md`（連番付き）
- **テンプレート**: [TEMPLATE.md](./notes/TEMPLATE.md)

### [spec/](./spec/) - 仕様書
機能仕様、API仕様などを格納しています。

## 🤖 AIへの指示例

### セッション開始時
\`\`\`
「docs/README.md を読んで、最新の申し送りを確認してください」
\`\`\`

### AI協働開発ガイドを読ませる
\`\`\`
「docs/ai-collaboration/ のガイドを読んで、
このプロジェクトの開発スタイルを理解してください」
\`\`\`

### 申し送り作成
\`\`\`
「今日の作業内容を docs/letter/ に申し送りとして記録してください」
\`\`\`

## 📝 ドキュメント管理の原則

1. **README駆動**: すべてのディレクトリに README.md を配置
2. **階層を浅く**: 3〜4層まで
3. **小分けの原則**: 1ファイル = 1知見（50-150行が目安）
4. **命名規則の統一**: kebab-case、連番（必要に応じて）

## 🔗 関連リンク

- [トップREADME](../README.md) - リポジトリ概要
```

#### その他のファイル

`ai-collaboration/AI_COLLABORATION_GUIDE.md` は templates/ ディレクトリに含まれています。

各カテゴリの README.md も templates/ に含まれています。

申し送りテンプレート (`letter/TEMPLATE.md`) と開発ノートテンプレート (`notes/TEMPLATE.md`) も同様です。

### ステップ3: degit でテンプレートを取得（推奨）

ゼロから作成する代わりに、以下のコマンドでテンプレートを取得できます：

```bash
npx degit <username>/my-ai-collaboration-patterns/patterns/docs-structure/templates ./docs
```

このコマンドで、すべての必要なファイルが一度に配置されます。

## 🎓 AIアシスタントへの指示

ドキュメント構造を作成した後、プロジェクトを開始する際には以下をAIに指示してください：

```
「docs/ai-collaboration/AI_COLLABORATION_GUIDE.md を読んで、
このプロジェクトの開発スタイルを理解してください」
```

## 📖 主要コンセプト

### 3種類のドキュメント

1. **申し送り** (`letter/`)
   - **目的**: セッション間の引き継ぎ
   - **作成タイミング**: セッション終了時
   - **命名**: `YYYY-MM-DD-HH-MM-SS.md`

2. **開発ノート** (`notes/`)
   - **目的**: 試行錯誤の記録
   - **作成タイミング**: 難しい問題を解決した時
   - **命名**: `01_タイトル.md`（連番付き）

3. **ADR** (`architecture/decisions/`)
   - **目的**: 重要な意思決定の記録
   - **作成タイミング**: アーキテクチャ上の重要な選択をした時
   - **命名**: `XXXX-タイトル.md`

### README駆動のナビゲーション

すべてのディレクトリにREADME.mdを配置することで：
- AIが迷わず目的のドキュメントを探せる
- 構造が自己説明的になる
- 新しいドキュメントの配置場所が明確

### 小分けの原則

- **1ファイル = 1知見**（50-150行）
- 独立性を保つ（単独で理解可能）
- MECE原則（漏れなく、重複なく）

## 🚀 運用開始

### セッション開始時

```
「docs/README.md を読んで、最新の申し送りを確認してください」
```

### セッション終了時

```
「今日の作業を docs/letter/ に申し送りとして記録してください。
テンプレートは docs/letter/TEMPLATE.md を使用してください」
```

### 技術的問題を解決した時

```
「今回の試行錯誤を docs/notes/ に記録してください。
テンプレートは docs/notes/TEMPLATE.md を使用してください」
```

### 重要な決定をした時

```
「この決定を docs/architecture/decisions/ にADRとして記録してください」
```

## ✅ 作成確認チェックリスト

作成後、以下を確認してください：

- [ ] `docs/` ディレクトリが作成された
- [ ] すべてのサブディレクトリに `README.md` が存在する
- [ ] `ai-collaboration/AI_COLLABORATION_GUIDE.md` が存在する
- [ ] `letter/TEMPLATE.md` が存在する
- [ ] `notes/TEMPLATE.md` が存在する
- [ ] AIに `docs/ai-collaboration/AI_COLLABORATION_GUIDE.md` を読ませた

## 🎯 期待される効果

このドキュメント構造を導入することで：

- ✅ セッション開始時間が短縮（10分 → 2分）
- ✅ AIへの文脈説明が不要に（質問5-10回 → 0-1回）
- ✅ 過去の知見を再利用可能（月0回 → 3-5回）
- ✅ 意思決定の理由が明確に記録される
- ✅ チーム間の引き継ぎがスムーズに

## 🔧 カスタマイズ

プロジェクトに応じて以下のカスタマイズが可能：

### ディレクトリ追加

```bash
# 例: APIドキュメントを追加
mkdir -p docs/api
echo "# API ドキュメント" > docs/api/README.md
```

### カテゴリ追加

```bash
# 例: フロントエンドのベストプラクティス
mkdir -p docs/development/best-practices/frontend
echo "# フロントエンド ベストプラクティス" > docs/development/best-practices/frontend/README.md
```

## 📚 さらに学ぶ

- [AI協働開発ガイド](./templates/ai-collaboration/AI_COLLABORATION_GUIDE.md) - 詳細なガイドライン
- [README.md](./README.md) - このパターンの詳細説明
- [examples/](./examples/) - 実際の使用例

---

**作成完了後**: セッション開始時に必ず最新の申し送りを確認し、AIに文脈を共有してください
