# My AI Collaboration Patterns

AIと効率的に協働開発するための**実践的パターン集**

## 🚀 5秒で使う

```bash
# ドキュメント構造（✅ 利用可能）
npx degit <username>/my-ai-collaboration-patterns/patterns/docs-structure/templates ./docs

# アクションパターン（✅ 利用可能）
npx degit <username>/my-ai-collaboration-patterns/patterns/actions-pattern/templates/actions ./actions

# ブランチ専用ワークスペース（✅ 利用可能）
git checkout -b feature/your-feature
npx degit <username>/my-ai-collaboration-patterns/patterns/docs-structure-for-target-branch-only/templates .
```

**Note**: `<username>` は実際のGitHubユーザー名に置き換えてください。

## 📦 パターン一覧

### [docs-structure](./patterns/docs-structure/) - ドキュメント構造
AIが理解しやすいドキュメント管理

**使用例**:
- プロジェクト開始時のドキュメント構造構築
- 申し送り・ノート・ADRの体系的管理
- AIセッション間の文脈引き継ぎ

**主な機能**:
- 階層的なドキュメント構造
- 申し送りテンプレート
- 開発ノート・ADRテンプレート
- README駆動のナビゲーション

### [actions-pattern](./patterns/actions-pattern/) - アクションパターン
繰り返しタスクを効率化し、トークン消費を約70%削減

**使用例**:
- Git操作の自動化（コミット・プッシュ）
- 知見のまとめ作成
- セッション開始時の定型作業

**主な機能**:
- 明確な指示書による一貫した実行
- トークン消費の大幅削減（約70%）
- 会話の往復を削減
- `@actions/タスク名.md` で即座に実行

**効果**:
- 会話ベース: 8,667トークン → actionsパターン: 2,667トークン

### [docs-structure-for-target-branch-only](./patterns/docs-structure-for-target-branch-only/) - ブランチ専用ワークスペース
ブランチ開発に特化した封じ込め型のドキュメント・スクリプト管理

**使用例**:
- 機能ブランチでの開発
- 実験的な機能の開発
- 長期ブランチでの開発

**主な機能**:
- ブランチ専用のdocs/（ドキュメント）
- ブランチ専用のscripts/（テスト・起動・ビルド）
- ブランチ専用のactions/（タスク自動化）
- Node.js優先のスクリプト（プラットフォーム非依存）
- ブランチ削除で全て消える

**効果**:
- mainブランチの汚染: 100% → 0%（完全分離）
- ブランチ削除の手間: 手動クリーンアップ → 自動削除

### [server-management](./patterns/server-management/) - サーバー管理
**Coming Soon**

確実なサーバー起動・停止スクリプト（今後実装予定）

### [prompt-engineering](./patterns/prompt-engineering/) - プロンプト設計
**Coming Soon**

### [testing-workflow](./patterns/testing-workflow/) - テスト戦略
**Coming Soon**

## 💡 使い方

### degit でパターン取得（推奨）

```bash
# 基本形
npx degit <username>/my-ai-collaboration-patterns/patterns/<pattern-name>/templates ./target-dir

# 例: ドキュメント構造
npx degit <username>/my-ai-collaboration-patterns/patterns/docs-structure/templates ./docs

# 例: アクションパターン
npx degit <username>/my-ai-collaboration-patterns/patterns/actions-pattern/templates/actions ./actions

# 例: ブランチ専用ワークスペース
git checkout -b feature/my-feature
npx degit <username>/my-ai-collaboration-patterns/patterns/docs-structure-for-target-branch-only/templates .
```

### Git Clone

```bash
git clone https://github.com/<username>/my-ai-collaboration-patterns.git
cp -r my-ai-collaboration-patterns/patterns/docs-structure/templates/* ./docs/
cp -r my-ai-collaboration-patterns/patterns/actions-pattern/templates/actions ./
```

### 詳細ガイド

各パターンの詳細は、パターンディレクトリ内の `README.md` と `GUIDE.md` を参照してください。

- [docs-structure パターン](./patterns/docs-structure/README.md)
- [actions-pattern パターン](./patterns/actions-pattern/README.md)
- [docs-structure-for-target-branch-only パターン](./patterns/docs-structure-for-target-branch-only/README.md)

## 🎯 特徴

- **すぐ使える**: GitHub URL 指定だけで取得
- **ワンショット指示**: GUIDE.md でAIが即座に構造を構築
- **実証済み**: このリポジトリ自身で使用（ドッグフーディング）
- **AI最適化**: AIアシスタントが理解しやすい構造
- **具体例付き**: examples/ に実際の使用例を収録

## 📖 ドキュメント

このリポジトリは `docs/` ディレクトリで自身のパターンを使用しています：

- [AI協働開発ガイド](./docs/ai-collaboration/AI_COLLABORATION_GUIDE.md)
- [開発ノート](./docs/notes/)
- [申し送り](./docs/letter/)

## 🤝 コントリビューション

新しいパターンの追加、改善提案を歓迎します！

### パターン追加の流れ
1. `patterns/your-pattern/` を作成
2. README.md, GUIDE.md, templates/, examples/ を配置
3. プルリクエストを作成

参考例:
- [docs-structure パターン](./patterns/docs-structure/)
- [actions-pattern パターン](./patterns/actions-pattern/)

## 📄 ライセンス

MIT License - 自由に使用・改変・配布できます

## 🙏 謝辞

実プロジェクトでの試行錯誤から生まれた知見を集約しています。

---

**Quick Start**:
- [docs-structure パターンを見る](./patterns/docs-structure/)
- [actions-pattern パターンを見る](./patterns/actions-pattern/)
- [docs-structure-for-target-branch-only パターンを見る](./patterns/docs-structure-for-target-branch-only/)
