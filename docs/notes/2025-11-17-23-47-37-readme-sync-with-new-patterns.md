---
tags: [documentation, readme, pattern, sync]
---

# /README.md の最新パターンへの同期

**日付**: 2025-11-01
**カテゴリ**: ドキュメント管理
**関連パターン**: writing-collaborate, docs-structure, actions-pattern, docs-structure-for-target-branch-only

## 🎯 課題

新しいパターン（`writing-collaborate`）を追加したが、リポジトリ最上部の `/README.md` に反映されていなかった。

## 💡 解決策

`/README.md` を以下の箇所で更新：

### 1. 5秒で使うセクション

クイックスタート用のコマンド例を追加：

```bash
# 執筆作業向け（✅ 利用可能）
npx degit <username>/my-ai-collaboration-patterns/patterns/writing-collaborate/templates ./collaborate
```

### 2. パターン一覧セクション

新パターンの詳細説明を追加：

```markdown
### [writing-collaborate](./patterns/writing-collaborate/) - 執筆作業向けAI協働
執筆作業（ブログ、ハンズオン、ドキュメント）に特化した軽量AI協働構造

**使用例**:
- ブログ記事の執筆
- ハンズオン資料の作成
- Zenn books、Honkit、mdBook などの執筆
- docs/ フォルダを静的サイトジェネレーターで使用するプロジェクト

**主な機能**:
- collaborate/ フォルダ（docs/ と衝突しない）
- 3フォルダ構成（notes・letters・tasks のみ）
- 執筆作業に最適化された軽量構造
- README駆動のナビゲーション

**効果**:
- セッション開始時間: 10分 → 2分（80%削減）
- 文脈説明の質問: 5-10回 → 0-1回（90%削減）
```

### 3. 詳細ガイドセクション

リンクリストに追加：

```markdown
- [writing-collaborate パターン](./patterns/writing-collaborate/README.md)
```

### 4. Quick Startセクション

最下部のリンクリストに追加：

```markdown
- [writing-collaborate パターンを見る](./patterns/writing-collaborate/)
```

## 🎓 学んだこと

### パターン追加時の必須チェックリスト

新しいパターンを追加したら、`/README.md` の以下4箇所を更新する：

1. ✅ **5秒で使う** - クイックスタートコマンド
2. ✅ **パターン一覧** - 詳細説明（使用例・主な機能・効果）
3. ✅ **詳細ガイド** - パターンREADMEへのリンク
4. ✅ **Quick Start** - パターンディレクトリへのリンク

### パターン説明の統一フォーマット

各パターンの説明は以下の構造で統一：

```markdown
### [パターン名](./patterns/xxx/) - 一行説明
簡潔な説明文（1-2行）

**使用例**:
- 箇条書き
- ...

**主な機能**:
- 箇条書き
- ...

**効果**:
- 数値で示す改善効果
- ...
```

## 📊 影響範囲

- **変更ファイル**: `/README.md`
- **追加箇所**: 4箇所
- **変更行数**: 約20行

## 🔗 関連ノート

- [10_writing-collaborate-pattern-creation.md](./10_writing-collaborate-pattern-creation.md) - writing-collaborateパターンの作成経緯
- [05_pattern-docs-standard-structure.md](./05_pattern-docs-standard-structure.md) - パターンドキュメント構造

## 📝 今後の運用

新しいパターン追加時は、このノートをチェックリストとして使用する。
