# docs-structure 移行ガイド

このディレクトリには、docs-structure パターンのバージョン移行ガイドが格納されています。

---

## 現在のバージョンの確認方法

プロジェクトが使用している docs-structure のバージョンを確認する方法：

### 方法1: TEMPLATE.md の構造で判定

```bash
# v1.0.1 以前: README と TEMPLATE が分離、README に詳細なガイド
head -20 docs/templates/notes/README.md

# v1.1.0: TEMPLATE にガイドが集約、README は3-5行
head -10 docs/templates/notes/README.md
```

### 方法2: FrontMatter の有無で判定

```bash
# v1.0.1 以前: FrontMatter なし
# v1.1.0: FrontMatter あり（tags のみ）
head -5 docs/templates/notes/TEMPLATE.md
```

### 方法3: ファイル命名規則で判定

```bash
# v1.0.1 以前:
#   - notes: 0001_title.md（連番）
#   - letters: yyyy-mm-dd-hh-mm-ss.md（日時のみ）

# v1.1.0:
#   - notes: yyyy-mm-dd-hh-mm-ss-title.md
#   - letters: yyyy-mm-dd-hh-mm-ss-title.md

ls docs/notes/ docs/letters/
```

---

## 利用可能な移行ガイド

### v1.0.1 → v1.1.0

- **ガイド**: [MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md](./MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md)
- **主な変更**:
  - FrontMatter 導入（tags のみ）
  - 命名規則統一（`yyyy-mm-dd-hh-mm-ss-{title}.md`）
  - TEMPLATE への情報集約
- **対象**: v1.0.1 形式で稼働中のプロジェクト

---

## 移行の基本フロー

### Step 1: バージョン確認

上記の方法で現在のバージョンを確認

### Step 2: Phase 2（テンプレート更新）

```bash
# degit で最新の templates/ を取得
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure/templates docs/templates --force

# または手動で patterns/docs-structure/templates/ の内容をコピー
```

### Step 3: Phase 3（既存ファイル移行）

該当する移行ガイドを AI に読ませてワンショット実行

```bash
# 移行ガイドを取得（任意の場所に）
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure/migration .

# AI に MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md を読ませて実行
```

---

## 注意事項

- **Git 管理**: 移行は `git mv` を使用するため、変更履歴が保持されます
- **ロールバック**: 問題があれば `git reset --hard` で戻せます（コミット前）
- **段階的実行**: 大規模プロジェクト（100ファイル以上）の場合は段階的移行を推奨
- **バックアップ**: 心配な場合は、移行前にリポジトリ全体をコピー推奨

---

## トラブルシューティング

### Git ログが取得できない

notes/ の移行時、Git 作成日時が取得できない場合:

- 手動で日時を指定
- またはデフォルトで現在時刻を使用

### タイトル生成が困難

letters/ の移行時、タイトル生成が困難な場合:

- ファイル内の最初の見出しを使用
- それも無い場合はユーザーに確認

---

**最終更新**: 2026-02-01
