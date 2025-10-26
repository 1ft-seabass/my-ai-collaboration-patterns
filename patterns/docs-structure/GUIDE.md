# AI協働開発向けドキュメント構造 - 補足ガイド

> **対象**: AIアシスタント（degit後に読む）
> **目的**: 配置されたドキュメント構造の意図を理解する

## 📖 このガイドについて

このガイドは、degit で `docs/` 構造を配置した後に読むべき補足資料です。
構造の哲学と意図を理解することで、より効果的に活用できます。

## 🏗️ 配置された構造

```
docs/
├── README.md                           # ドキュメント目次
├── actions/                            # タスク自動化指示書
│   ├── README.md
│   ├── git_commit_and_push.md
│   ├── current_create_knowledge.md
│   ├── current_create_letter.md
│   └── simple_start_from_latest_letter.md
├── ai-collaboration/                   # AI協働開発ガイド
│   ├── README.md
│   └── AI_COLLABORATION_GUIDE.md
├── development/                        # 開発ガイド
│   ├── README.md
│   └── best-practices/
│       └── README.md
├── architecture/                       # アーキテクチャ設計
│   ├── README.md
│   └── decisions/                     # ADR
│       └── README.md
├── letter/                            # 申し送り
│   ├── README.md
│   └── TEMPLATE.md
├── notes/                             # 開発ノート
│   ├── README.md
│   └── TEMPLATE.md
└── spec/                              # 仕様書
    └── README.md
```

## 🎯 コアコンセプト

### 1. actions - タスク自動化指示書

繰り返し実行するタスクを指示書として保存し、`@actions/ファイル名.md` で呼び出すことで効率化します。

**提供されるアクション:**
- `git_commit_and_push.md` - 進捗のコミットとプッシュ
- `current_create_knowledge.md` - 知見のまとめ作成
- `current_create_letter.md` - 申し送りの作成（セッション終了時）
- `simple_start_from_latest_letter.md` - セッション開始（申し送りから）

**効果:**
- トークン削減: 約70%（実測値）
- 時間短縮: 確認の往復がない
- 一貫性: 毎回同じ品質

### 2. 3種類のドキュメント

| 種類 | 目的 | 作成タイミング | 命名規則 |
|------|------|----------------|----------|
| **申し送り** (letter) | セッション引き継ぎ | セッション終了時 | `YYYY-MM-DD-HH-MM-SS.md` |
| **開発ノート** (notes) | 試行錯誤の記録 | 難しい問題を解決した時 | `01_タイトル.md`（連番） |
| **ADR** (decisions) | 意思決定記録 | 重要なアーキテクチャ選択時 | `XXXX-タイトル.md` |

### 3. README駆動のナビゲーション

すべてのディレクトリにREADME.mdを配置することで：
- AIが迷わず目的のドキュメントを探せる
- 構造が自己説明的になる
- 新しいドキュメントの配置場所が明確

### 4. 小分けの原則

- **1ファイル = 1知見**（50-150行が目安）
- 独立性を保つ（単独で理解可能）
- MECE原則（漏れなく、重複なく）

## 🚀 運用開始

### セッション開始時

```
「docs/README.md を読んで、最新の申し送りを確認してください」
```

または actions を使用：

```
@actions/simple_start_from_latest_letter.md
```

### セッション終了時

```
「今日の作業を docs/letter/ に申し送りとして記録してください」
```

または actions を使用：

```
@actions/current_create_letter.md
```

### 技術的問題を解決した時

```
「今回の試行錯誤を docs/notes/ に記録してください」
```

### 重要な決定をした時

```
「この決定を docs/architecture/decisions/ にADRとして記録してください」
```

## 🔧 カスタマイズ

このプロジェクト固有のニーズに合わせてカスタマイズしてください：

### ディレクトリ追加

```bash
# 例: APIドキュメントを追加
mkdir -p docs/api
echo "# API ドキュメント" > docs/api/README.md
```

### README・TEMPLATE のカスタマイズ

各 README.md や TEMPLATE.md をこのプロジェクト固有の内容に書き換えてください：

- `docs/README.md` - プロジェクト名、リンク先を調整
- `letter/TEMPLATE.md` - プロジェクト固有のセクション追加
- `notes/TEMPLATE.md` - プロジェクト固有のフォーマット調整
- 各ディレクトリの `README.md` - プロジェクト固有の説明に更新

## ✅ 確認チェックリスト

配置後、以下を確認してください：

- [ ] `docs/` ディレクトリが作成された
- [ ] すべてのサブディレクトリに `README.md` が存在する
- [ ] `ai-collaboration/AI_COLLABORATION_GUIDE.md` が存在する
- [ ] `actions/` に4つのアクションファイルが存在する
- [ ] `letter/TEMPLATE.md` と `notes/TEMPLATE.md` が存在する
- [ ] 各 README.md をプロジェクト固有の内容に更新した

## 🎯 期待される効果

このドキュメント構造を導入することで：

- ✅ セッション開始時間が短縮（10分 → 2分）
- ✅ AIへの文脈説明が不要に（質問5-10回 → 0-1回）
- ✅ 過去の知見を再利用可能（月0回 → 3-5回）
- ✅ 意思決定の理由が明確に記録される
- ✅ チーム間の引き継ぎがスムーズに

## 📚 さらに詳しく

- [README.md](./README.md) - このパターンの詳細説明（人間向け）
- [examples/](./examples/) - 実際の使用例
- [ai-collaboration/AI_COLLABORATION_GUIDE.md](./templates/ai-collaboration/AI_COLLABORATION_GUIDE.md) - AI協働開発の詳細ガイド

---

**次のステップ**: `docs/ai-collaboration/AI_COLLABORATION_GUIDE.md` を読んで、このプロジェクトの開発スタイルを理解してください
