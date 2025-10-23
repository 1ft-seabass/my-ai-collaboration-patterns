# My AI Collaboration Patterns

AIと効率的に協働開発するための**実践的パターン集**

## 🚀 5秒で使う

```bash
# ドキュメント構造（✅ 利用可能）
npx degit <username>/my-ai-collaboration-patterns/patterns/docs-structure/templates ./docs
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
```

### Git Clone

```bash
git clone https://github.com/<username>/my-ai-collaboration-patterns.git
cp -r my-ai-collaboration-patterns/patterns/docs-structure/templates/* ./docs/
```

### 詳細ガイド

各パターンの詳細は、パターンディレクトリ内の `README.md` と `GUIDE.md` を参照してください。

- [docs-structure パターン](./patterns/docs-structure/README.md)

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

参考例: [docs-structure パターン](./patterns/docs-structure/)

## 📄 ライセンス

MIT License - 自由に使用・改変・配布できます

## 🙏 謝辞

実プロジェクトでの試行錯誤から生まれた知見を集約しています。

---

**Quick Start**: [docs-structure パターンを見る](./patterns/docs-structure/)
