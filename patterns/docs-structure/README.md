# docs-structure パターン

> **🤖 AIへのワンショット指示（コピペ用）**
>
> ```
> https://github.com/1ft-seabass/my-ai-collaboration-patterns/tree/main/patterns/docs-structure
> この仕組みを導入したいです。degit で構造をそのまま持ってきましょう。
> degit するのは配下の templates フォルダの中身です。
> また、中の各 README や TEMPLATE を案件固有のものに合わせてください。
> ```

AIが理解しやすいドキュメント管理構造

## 📦 このパターンについて

AI協働開発において、AIアシスタントが効率的に情報を探索・理解できるドキュメント構造を提供します。

### 解決する問題

- **情報の散在**: ドキュメントがあちこちに分散し、AIが見つけられない
- **文脈の断絶**: セッション間で作業内容が引き継がれず、毎回説明が必要
- **構造の不統一**: プロジェクトごとに構造が異なり、AIが迷う

### このパターンの特徴

- **README駆動**: すべてのディレクトリにREADME.mdを配置し、AIが迷わず探索できる
- **階層的な知見管理**: 申し送り・開発ノート・ADRを明確に分離
- **テンプレート付き**: すぐに使える申し送り・ノートのテンプレート
- **AI最適化**: 3-4層の浅い階層、統一された命名規則

## 🚀 使い方

### degit で取得（推奨）

**重要**: `templates` ディレクトリを指定してください。パターン直下ではなく、`templates` 以下がプロジェクトで使用するドキュメント構造です。

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure/templates ./docs
```

### Git Clone

```bash
git clone https://github.com/1ft-seabass/my-ai-collaboration-patterns.git
cp -r my-ai-collaboration-patterns/patterns/docs-structure/templates/* ./docs/
```

### AIに読ませる

プロジェクトに配置後、セッション開始時にAIアシスタントに以下を指示：

```
「docs/ai-collaboration/AI_COLLABORATION_GUIDE.md を読んで、
このプロジェクトの開発スタイルを理解してください」
```

## 📂 作成される構造

```
docs/
├── README.md                           # ドキュメント目次
├── actions/                            # タスク自動化指示書
│   ├── README.md
│   ├── git_commit_and_push.md         # コミット&プッシュ
│   ├── current_create_knowledge.md    # 知見まとめ作成
│   └── simple_start_from_latest_letter.md  # セッション開始
├── ai-collaboration/                   # AI協働開発ガイド
│   ├── README.md
│   └── AI_COLLABORATION_GUIDE.md      # v1.3.0 ワンショットガイド
├── development/                        # 開発ガイド
│   ├── README.md
│   └── best-practices/                # ベストプラクティス集
│       └── README.md
├── architecture/                       # アーキテクチャ設計
│   ├── README.md
│   └── decisions/                     # ADR（意思決定記録）
│       └── README.md
├── letters/                           # 申し送り（時系列）
│   ├── README.md
│   └── TEMPLATE.md                    # 申し送りテンプレート
├── notes/                             # 開発ノート（試行錯誤）
│   ├── README.md
│   └── TEMPLATE.md                    # ノートテンプレート
└── spec/                              # 仕様書
    └── README.md
```

## 🎯 使用例

### セッション開始時

```
「docs/README.md を読んで、最新の申し送りを確認してください」
```

### セッション終了時

```
「今日の作業内容を docs/letters/ に申し送りとして記録してください」
```

### 技術的な問題を解決した時

```
「docs/notes/ に今回の試行錯誤を記録してください」
```

### 重要なアーキテクチャ決定をした時

```
「docs/architecture/decisions/ にADRを作成してください」
```

## 📖 コアコンセプト

### actions - タスク自動化指示書

繰り返し実行するタスクを指示書として保存し、`@actions/ファイル名.md` で呼び出すことで、AIが自動的にタスクを実行します。

**提供されるアクション:**
- `git_commit_and_push.md` - 進捗のコミットとプッシュ
- `current_create_knowledge.md` - 知見のまとめ作成
- `simple_start_from_latest_letter.md` - セッション開始（申し送りから）

**効果:**
- **トークン削減**: 約70%（実測値）
- **時間短縮**: 確認の往復がない
- **一貫性**: 毎回同じ品質

### 3種類のドキュメント

| 種類 | 目的 | いつ使う |
|------|------|----------|
| **申し送り** (letters) | セッション引き継ぎ | セッション終了時 |
| **開発ノート** (notes) | 試行錯誤の記録 | 難しい問題を解決した |
| **ADR** (decisions) | 意思決定記録 | 重要なアーキテクチャ選択 |

### README駆動のナビゲーション

すべてのディレクトリにREADME.mdを配置することで：
- AIが迷わず目的のドキュメントを探せる
- 人間も構造を理解しやすい
- ドキュメント追加時の配置場所が明確

### 小分けの原則

- **1ファイル = 1知見**（50-150行が目安）
- **独立性を保つ**（単独で理解可能）
- **MECE原則**（漏れなく、重複なく）

## 💡 運用のコツ

### セッション開始時の習慣

1. 最新の申し送りを確認
2. 関連する開発ノート・ADRを参照
3. 作業計画を立てる

### セッション終了時の習慣

1. 申し送りを作成（TEMPLATE.md使用）
2. 完了タスク・進行中タスク・注意事項を記録
3. 次セッションの優先事項を明記

### 知見の蓄積

- **3回以上使う知見**: ドキュメント化
- **試行錯誤の記録**: notes/ へ
- **重要な決定**: ADR へ

## 🔗 関連パターン

- [server-management](../server-management/) - サーバー管理スクリプト（このドキュメント構造で管理可能）
- [prompt-engineering](../prompt-engineering/) - プロンプト設計（Coming Soon）

## 📚 詳細ドキュメント

詳細な使い方やカスタマイズ方法は以下を参照：
- [GUIDE.md](./GUIDE.md) - AI向け補足ガイド（degit後に読む）
- [examples/](./examples/) - 具体的な使用例

## 🛠️ カスタマイズ

このパターンは汎用的な構造ですが、プロジェクトに応じてカスタマイズ可能：

### ディレクトリの追加

```bash
# 例: APIドキュメントを追加
mkdir -p docs/api
echo "# API ドキュメント" > docs/api/README.md
```

### カテゴリの追加

```bash
# 例: best-practices にカテゴリ追加
mkdir -p docs/development/best-practices/frontend
echo "# フロントエンド ベストプラクティス" > docs/development/best-practices/frontend/README.md
```

## ⚡ 効果

### Before（パターン適用前）
- セッションごとに同じ説明を繰り返す
- 過去の決定理由が分からず再検討
- AIが情報を見つけられず質問攻め

### After（パターン適用後）
- 申し送りで即座に文脈を回復
- ADR・ノートで過去の知見を参照
- AIが自律的に情報を探索

## 📊 メトリクス

実際のプロジェクトでの効果（参考値）：
- セッション開始時間: **10分 → 2分**（80%削減）
- 文脈説明の質問: **5-10回 → 0-1回**（90%削減）
- 知見の再利用: **ほぼ0 → 月3-5回**

## 🙋 よくある質問

**Q: 既存プロジェクトに導入できる？**
A: 可能です。既存のドキュメントを新しい構造に移行し、段階的に運用してください。

**Q: 小規模プロジェクトでも有効？**
A: はい。特に複数セッションにまたがる開発では効果的です。

**Q: チーム開発でも使える？**
A: はい。申し送りを「開発者間の引き継ぎ」としても活用できます。

**Q: テンプレートは必須？**
A: 推奨ですが任意です。構造の一貫性がAIの理解を助けます。

## 📝 ライセンス

MIT License - 自由に使用・改変・配布できます

---

**このパターンの実例**: このリポジトリ自身が `docs/` でこのパターンを使用しています（ドッグフーディング）
