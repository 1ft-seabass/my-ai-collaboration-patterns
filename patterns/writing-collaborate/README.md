# writing-collaborate パターン

> **🤖 AIへのワンショット指示（コピペ用）**
>
> ```
> https://github.com/1ft-seabass/my-ai-collaboration-patterns/tree/main/patterns/writing-collaborate
> この仕組みを導入したいです。degit で構造をそのまま持ってきましょう。
> degit するのは配下の templates フォルダの中身です。
> また、中の各 README や TEMPLATE を案件固有のものに合わせてください。
> ```

執筆作業に特化したAI協働構造

## 📦 このパターンについて

執筆作業（ブログ記事、ハンズオン資料、ドキュメント）において、AIアシスタントが効率的に情報を探索・理解できる軽量な構造を提供します。

### 解決する問題

- **docs/ フォルダの衝突**: Honkit、mdBook、Zenn books などの静的サイトジェネレーターは `docs/` を GitHub Pages 用に使用
- **開発機能が過剰**: ブログ記事やハンズオン資料の執筆には ADR、actions、architecture、spec は不要
- **文脈の断絶**: セッション間で執筆内容が引き継がれず、毎回説明が必要

### このパターンの特徴

- **collaborate/ フォルダ**: docs/ と衝突しない名前
- **3フォルダ構成**: notes・letters・tasks のみのシンプル構成
- **執筆作業に最適化**: メモ・申し送り・タスクだけで執筆作業が回る
- **README駆動**: すべてのディレクトリにREADME.mdを配置し、AIが迷わず探索できる
- **テンプレート付き**: すぐに使える申し送り・メモのテンプレート

## 🚀 使い方

### degit で取得（推奨）

**重要**: `templates` ディレクトリを指定してください。パターン直下ではなく、`templates` 以下がプロジェクトで使用する構造です。

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/writing-collaborate/templates ./collaborate
```

### Git Clone

```bash
git clone https://github.com/1ft-seabass/my-ai-collaboration-patterns.git
cp -r my-ai-collaboration-patterns/patterns/writing-collaborate/templates/* ./collaborate/
```

### AIに読ませる

プロジェクトに配置後、セッション開始時にAIアシスタントに以下を指示：

```
「collaborate/README.md を読んで、最新の申し送りを確認してください」
```

## 📂 作成される構造

```
collaborate/
├── README.md                          # 目次・使い方
├── notes/                            # メモ・思考の断片
│   ├── README.md
│   └── TEMPLATE.md                   # メモテンプレート
├── letters/                         # 申し送り（時系列）
│   ├── README.md
│   └── TEMPLATE.md                   # 申し送りテンプレート
└── tasks/                           # タスクリスト
    ├── README.md
    └── TEMPLATE.md                   # タスクテンプレート
```

## 🎯 使用例

### セッション開始時

```
「collaborate/README.md を読んで、最新の申し送りを確認してください」
```

### セッション終了時

```
「今日の執筆内容を collaborate/letters/ に申し送りとして記録してください」
```

### アイデアをメモした時

```
「collaborate/notes/ に今回の構成案を記録してください」
```

### タスクを追加したい時

```
「collaborate/tasks/ に新しいタスクを追加してください」
```

## 📖 コアコンセプト

### 3種類のドキュメント

| 種類 | 目的 | いつ使う |
|------|------|----------|
| **申し送り** (letters) | セッション引き継ぎ | セッション終了時 |
| **メモ** (notes) | アイデア・構成案・調査結果 | 思考を整理した |
| **タスク** (tasks) | TODO管理 | 未完了作業の記録 |

### README駆動のナビゲーション

すべてのディレクトリにREADME.mdを配置することで：
- AIが迷わず目的のドキュメントを探せる
- 人間も構造を理解しやすい
- ドキュメント追加時の配置場所が明確

### 小分けの原則

- **1ファイル = 1知見**（50-150行が目安）
- **独立性を保つ**（単独で理解可能）
- **MECE原則**（漏れなく、重複なく）

## 🔄 docs-structure との使い分け

| 項目 | docs-structure | writing-collaborate |
|------|----------------|---------------------|
| **対象** | ソフトウェア開発 | 執筆作業全般 |
| **フォルダ名** | `docs/` | `collaborate/` |
| **構成** | 7フォルダ | 3フォルダ |
| **actions/** | ✅ あり | ❌ なし |
| **architecture/** | ✅ あり（ADR） | ❌ なし |
| **development/** | ✅ あり | ❌ なし |
| **spec/** | ✅ あり | ❌ なし |
| **notes/** | ✅ あり | ✅ あり |
| **letters/** | ✅ あり | ✅ あり |
| **tasks/** | ✅ あり | ✅ あり |

### どちらを使うべきか

#### writing-collaborate を使う場合

- ✅ ブログ記事の執筆
- ✅ ハンズオン資料の作成
- ✅ Zenn books、Honkit、mdBook などの執筆
- ✅ ドキュメント執筆プロジェクト
- ✅ docs/ フォルダを静的サイトジェネレーターで使用する

#### docs-structure を使う場合

- ✅ ソフトウェア開発プロジェクト
- ✅ アーキテクチャ決定の記録が必要
- ✅ 複雑な技術的意思決定がある
- ✅ actions/ による自動化が必要
- ✅ docs/ フォルダを使用しない

## 💡 運用のコツ

### セッション開始時の習慣

1. 最新の申し送りを確認
2. 関連するメモを参照
3. 作業計画を立てる

### セッション終了時の習慣

1. 申し送りを作成（TEMPLATE.md使用）
2. 完了タスク・進行中タスク・注意事項を記録
3. 次セッションの優先事項を明記

### 知見の蓄積

- **アイデア・構成案**: notes/ へ
- **調査結果**: notes/ へ
- **試行錯誤の記録**: notes/ へ

## 🎨 具体的な使用例

### Zenn books の執筆

```bash
my-zenn-book/
├── books/                    # Zenn books 本体
│   └── my-book/
│       ├── config.yaml
│       └── chapters/
├── collaborate/              # AI協働構造（このパターン）
│   ├── README.md
│   ├── notes/               # 章の構成案、調査結果
│   ├── letters/            # 執筆進捗の申し送り
│   └── tasks/              # 未完了の執筆タスク
└── README.md
```

### Honkit プロジェクト

```bash
my-honkit-docs/
├── docs/                    # Honkit 本体（GitHub Pages）
│   ├── README.md
│   ├── SUMMARY.md
│   └── chapters/
├── collaborate/             # AI協働構造（このパターン）
│   ├── README.md
│   ├── notes/
│   ├── letters/
│   └── tasks/
└── book.json
```

### ブログ記事の執筆

```bash
my-blog/
├── articles/               # 記事本体
│   ├── 2025-01-15-article-1.md
│   └── 2025-01-20-article-2.md
├── collaborate/            # AI協働構造（このパターン）
│   ├── README.md
│   ├── notes/             # ネタ、構成案
│   ├── letters/          # 執筆進捗
│   └── tasks/            # 記事TODO
└── README.md
```

## ⚡ 効果

### Before（パターン適用前）
- セッションごとに同じ説明を繰り返す
- 過去のアイデアが散らばって見つからない
- AIが情報を見つけられず質問攻め

### After（パターン適用後）
- 申し送りで即座に文脈を回復
- メモで過去のアイデアを参照
- AIが自律的に情報を探索

## 📊 メトリクス

実際のプロジェクトでの効果（参考値）：
- セッション開始時間: **10分 → 2分**（80%削減）
- 文脈説明の質問: **5-10回 → 0-1回**（90%削減）
- アイデアの再利用: **ほぼ0 → 月3-5回**

## 🙋 よくある質問

**Q: 既存プロジェクトに導入できる？**
A: 可能です。既存のメモを新しい構造に移行し、段階的に運用してください。

**Q: 小規模プロジェクトでも有効？**
A: はい。特に複数セッションにまたがる執筆では効果的です。

**Q: 複数人での執筆でも使える？**
A: はい。申し送りを「執筆者間の引き継ぎ」としても活用できます。

**Q: docs-structure から移行できる？**
A: 可能です。letters、notes、tasks フォルダを移動し、不要なフォルダを削除してください。

**Q: フォルダ名を変更できる？**
A: 可能ですが、AIへの指示時に新しい名前を伝える必要があります。

## 🔗 関連パターン

- [docs-structure](../docs-structure/) - ソフトウェア開発向けのフル機能版
- [branch-only](../branch-only/) - 単一ファイルでの超軽量版

## 📚 詳細ドキュメント

詳細な使い方やカスタマイズ方法は以下を参照：
- [GUIDE.md](./GUIDE.md) - AI向け補足ガイド（degit後に読む）

## 🛠️ カスタマイズ

このパターンは汎用的な構造ですが、プロジェクトに応じてカスタマイズ可能：

### ディレクトリの追加

```bash
# 例: 画像素材管理を追加
mkdir -p collaborate/assets
echo "# 画像・素材管理" > collaborate/assets/README.md
```

### カテゴリの追加

```bash
# 例: notes にカテゴリ追加
mkdir -p collaborate/notes/ideas
echo "# アイデア集" > collaborate/notes/ideas/README.md
```

## 📝 ライセンス

MIT License - 自由に使用・改変・配布できます

---

**関連**: [docs-structure](../docs-structure/) パターンをベースに、執筆作業向けに最適化したパターンです。
