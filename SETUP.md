# リポジトリセットアップ指示書（Claude Code 用）

> このファイルは、`my-ai-collaboration-patterns` リポジトリの基本構造を説明します。

**バージョン**: 3.0.0
**最終更新**: 2025-10-23

---

## 📋 目的

このリポジトリは、AIと効率的に協働開発するための**実践的パターン集**です。

### コンセプト

- **ワンショット駆動**: 外部から知見を投げ込むことでパターンが展開される
- **degit 対応**: `npx degit` で各パターンをプロジェクトに取得可能
- **即座に使える**: コピーするだけで動作するテンプレート

---

## 🏗️ 基本構造

```
my-ai-collaboration-patterns/
├── README.md                          # リポジトリ紹介
├── SETUP.md                           # このファイル
├── docs/                              # このリポジトリ自身の知見管理
│   ├── README.md
│   ├── ai-collaboration/              # AI協働開発ガイド
│   ├── development/                   # 開発ガイド
│   ├── architecture/                  # アーキテクチャ・ADR
│   ├── letter/                        # 申し送り
│   ├── notes/                         # 開発ノート
│   └── spec/                          # 仕様書
└── patterns/                          # パターン格納ディレクトリ（今後展開）
    └── .keep                          # Git管理用
```

### patterns/ ディレクトリ

外部からのワンショット指示により、以下のようなパターンが展開されます：

```
patterns/
├── docs-structure/              # ドキュメント構造パターン
│   ├── README.md
│   ├── GUIDE.md
│   ├── core/
│   ├── templates/
│   └── examples/
│
└── server-management/           # サーバー管理パターン
    ├── README.md
    ├── core/
    └── variants/
        ├── native/
        └── docker/
```

---

## 📝 セットアップ手順

### ステップ1: トップREADME.md 作成

リポジトリの紹介ページ。

**内容**:
- リポジトリの目的
- パターン一覧
- 使い方（degit コマンド例）

### ステップ2: patterns/ へのパターン追加

外部からワンショットガイドを投げ込むことで、各パターンディレクトリが作成されます。

**例**:
```
「この AI協働開発ガイド を読んで、
patterns/docs-structure/ を作成してください」
```

---

## 🎯 パターンの構造

各パターンは以下の構成を推奨：

```
patterns/your-pattern/
├── README.md          # パターン説明（概要・使い方）
├── GUIDE.md           # AIに読ませるワンショット
├── core/              # 詳細ドキュメント
├── templates/         # degit でコピーされるファイル
└── examples/          # 使用例
```

### バリエーションがある場合

```
patterns/your-pattern/
├── README.md
├── core/              # 共通知識
└── variants/
    ├── variant-a/
    │   ├── README.md
    │   ├── GUIDE.md
    │   └── templates/
    └── variant-b/
        ├── README.md
        ├── GUIDE.md
        └── templates/
```

---

## 💡 degit での使用

ユーザーは以下のコマンドでパターンを取得できます：

```bash
# 基本パターン
npx degit <username>/my-ai-collaboration-patterns/patterns/docs-structure/templates ./docs

# バリエーション付き
npx degit <username>/my-ai-collaboration-patterns/patterns/server-management/variants/native/templates ./scripts
```

---

## ⚙️ 注意事項

### プレースホルダー

実際のリポジトリでは `<username>` を実際のGitHubユーザー名に置換してください。

### Git管理

空の `patterns/` ディレクトリは `.keep` ファイルで管理されます。

---

## ✅ 作業完了チェックリスト

### 基本構造
- [x] README.md（トップ）
- [x] patterns/.keep（空ディレクトリ保持）
- [x] docs/ 構造作成（AI協働開発ガイドに従う）

### docs/ 詳細
- [x] docs/README.md（ドキュメント目次）
- [x] docs/ai-collaboration/（AI協働開発ガイド配置）
- [x] docs/development/（開発ガイド）
- [x] docs/architecture/decisions/（ADR）
- [x] docs/letter/（申し送り + TEMPLATE.md）
- [x] docs/notes/（開発ノート + TEMPLATE.md）
- [x] docs/spec/（仕様書）

---

**最終更新**: 2025-10-23
**バージョン**: 3.0.0（ワンショット駆動型に簡素化）
**作成者**: Claude Code 向けセットアップ指示書
