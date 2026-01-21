# actions-pattern の更新と他パターンへの同期ワークフロー

**作成日**: 2026-01-21
**カテゴリ**: 開発運用・保守

## 背景

このリポジトリでは、actions-pattern が「マスター」として最新の actions/ 構成を管理している。他のパターン（docs-structure、docs-structure-for-target-branch-only、writing-collaborate）は、actions-pattern から actions/ をコピーして配布している。

actions/ の構成を変更した場合、**手動で**他のパターンに同期する必要がある。

## 同期が必要なパターン

actions-pattern を更新したら、以下のパターンに同期コピーする:

1. **docs-structure**
   - コピー先: `patterns/docs-structure/templates/actions/`

2. **docs-structure-for-target-branch-only**
   - コピー先: `patterns/docs-structure-for-target-branch-only/templates/docs/actions/`

3. **writing-collaborate**
   - コピー先: `patterns/writing-collaborate/templates/actions/`

4. **このリポジトリ自身（ドッグフーディング）**
   - コピー先: `docs/actions/`

## 同期手順

### 1. actions-pattern を更新

```bash
# actions-pattern の templates/actions/ を編集
vim patterns/actions-pattern/templates/actions/新しいファイル.md
```

### 2. 他のパターンに同期

```bash
# docs-structure
cp -r patterns/actions-pattern/templates/actions/* patterns/docs-structure/templates/actions/

# docs-structure-for-target-branch-only
cp -r patterns/actions-pattern/templates/actions/* patterns/docs-structure-for-target-branch-only/templates/docs/actions/

# writing-collaborate
cp -r patterns/actions-pattern/templates/actions/* patterns/writing-collaborate/templates/actions/

# このリポジトリ自身
cp -r patterns/actions-pattern/templates/actions/* docs/actions/
```

### 3. 変更を確認

```bash
git status
git diff
```

### 4. コミット

```bash
git add patterns/*/templates/actions/ patterns/*/templates/docs/actions/ docs/actions/
git commit -m "sync: actions-pattern の変更を全パターンに反映"
```

## 注意事項

### カスタマイズされた actions/ への対応

各パターンの actions/ はテンプレートとして配布されるため、ユーザーがカスタマイズしている可能性がある。

**対応:**
- 破壊的変更（ファイル削除、大幅な構成変更）の場合は、README に移行ガイドを追加
- 新規ファイル追加の場合は、特に問題なし
- ファイル名変更の場合は、旧ファイルを削除するか明記

### README の更新

actions/ の構成を変更した場合、以下も更新する:

1. **actions-pattern/README.md**
   - 「AIへのワンショット指示」の期待する結果
   - 使用例
   - 「🔄 既存プロジェクトの更新」セクション

2. **他のパターンの README は汎用的な表現にしてあるため、更新不要**
   - 「（複数のアクションファイル.md）」という表現
   - 「詳細は actions/README.md を参照」という注記

## まとめ

- actions-pattern がマスター
- 更新したら、手動で他の3パターン + このリポジトリに同期コピー
- README は汎用的な表現にしてあるため、更新不要

## 関連ノート

- [0022_actions-pattern-refinement.md](0022_actions-pattern-refinement.md) - actions パターンのリファクタリング
