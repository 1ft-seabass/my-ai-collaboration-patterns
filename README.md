# My AI Collaboration Patterns

AIと効率的に協働開発するための**実践的パターン集**

## 🚀 5秒で使う

```bash
# ドキュメント構造
npx degit <username>/my-ai-collaboration-patterns/patterns/docs-structure/templates ./docs

# サーバー管理（Native環境 - Docker なし）
npx degit <username>/my-ai-collaboration-patterns/patterns/server-management/variants/native/templates ./scripts

# サーバー管理（Docker環境）
npx degit <username>/my-ai-collaboration-patterns/patterns/server-management/variants/docker/templates ./scripts
```

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
確実なサーバー起動・停止スクリプト

**バリエーション**:
- [Native版](./patterns/server-management/variants/native/) - Docker なし（Raspberry Pi、開発環境向け）
- [Docker版](./patterns/server-management/variants/docker/) - Docker Compose 管理

**使用例**:
- 複数サーバーの統一的な管理
- Raspberry Pi での運用
- 開発・本番環境のサーバー制御

**主な機能**:
- ポート管理・プロセス管理
- ヘルスチェック
- 一括起動・停止
- ログ管理

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

# 例: サーバー管理（Native）
npx degit <username>/my-ai-collaboration-patterns/patterns/server-management/variants/native/templates ./scripts
```

### Git Clone

```bash
git clone https://github.com/<username>/my-ai-collaboration-patterns.git
cp -r my-ai-collaboration-patterns/patterns/<pattern>/templates/* ./
```

### 詳細ガイド
[docs/usage-guide.md](./docs/usage-guide.md)

## 🎯 特徴

- **すぐ使える**: GitHub URL 指定だけで取得
- **バリエーション対応**: Docker/Native などの環境差に対応
- **関連記事充実**: ワンショットGUIDE.md + 詳細なcore/*.md
- **実証済み**: 実プロジェクトで使用されているパターン
- **AI最適化**: AIアシスタントが理解しやすい構造

## 📖 ドキュメント

- [使い方ガイド](./docs/usage-guide.md)
- [パターンの作り方](./docs/pattern-creation-guide.md)
- [コントリビューションガイド](./docs/contributing.md)

## 🤝 コントリビューション

新しいパターンの追加、改善提案を歓迎します！

### パターン追加の流れ
1. `patterns/your-pattern/` を作成
2. README.md, GUIDE.md (または variants/), core/, templates/ を配置
3. examples/ に実例を追加
4. プルリクエスト

詳細: [contributing.md](./docs/contributing.md)

## 📄 ライセンス

MIT License - 自由に使用・改変・配布できます

## 🙏 謝辞

実プロジェクトでの試行錯誤から生まれた知見を集約しています。

---

**Quick Start**: [docs-structure](./patterns/docs-structure/) → [server-management](./patterns/server-management/)
