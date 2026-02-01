---
tags: [naming, refactoring, letters, consistency]
---

# letter → letters への命名変更 - 開発記録

**作成日**: 2025-11-01
**関連タスク**: ドキュメント構造の整合性向上

## 問題

docs-structureパターンとdocs-structure-for-target-branch-onlyパターンにおいて、申し送りディレクトリ名が `letter/` となっていたが、以下の問題があった：

1. **単数形の違和感**: 他のディレクトリ（notes, tasks, decisions）は複数の項目を格納するため、単数形の `letter` は不自然
2. **自然言語の観点**: 「複数の申し送りを格納する場所」という意味では `letters` の方が自然
3. **一貫性の欠如**: 複数のドキュメントを格納するディレクトリとして、複数形の方が直感的

## 試行錯誤

### アプローチA: そのまま維持
**検討内容**: `letter` は「申し送り」という抽象概念を表すため単数形でも可

**結果**: 却下

**理由**:
- ディレクトリ内には複数の申し送りファイルが格納される
- notes, decisions と同様に複数形の方が一貫性がある
- ユーザーから複数形への変更要望があった

---

### アプローチB: letters に変更（採用）
**実施内容**:
1. ディレクトリ名を `letter/` → `letters/` に変更
2. 両パターンで変更を適用
3. すべてのドキュメント内の参照を更新

**結果**: 成功

**変更範囲**:
- パターンREADME.md（2ファイル）
- templates/README.md（2ファイル）
- templates/ai-collaboration/（4ファイル）
- templates/actions/（3ファイル）
- templates/tasks/TEMPLATE.md（2ファイル）
- templates/notes/（2ファイル）
- templates/development/best-practices/README.md（2ファイル）

## 解決策

### 実装方法

1. **ディレクトリ名の変更**
```bash
# docs-structure パターン
mv patterns/docs-structure/templates/letter patterns/docs-structure/templates/letters

# docs-structure-for-target-branch-only パターン
mv patterns/docs-structure-for-target-branch-only/templates/docs/letter \
   patterns/docs-structure-for-target-branch-only/templates/docs/letters
```

2. **ドキュメント内の参照を一括置換**
```bash
# letter/ → letters/ への置換
find patterns/docs-structure* -name "*.md" -exec sed -i 's|letter/|letters/|g' {} \;

# ディレクトリ構造図の修正
sed -i 's|│   └── letter/|│   └── letters/|g' AI_COLLABORATION_GUIDE.md
```

3. **Git での記録**
```bash
git add -A
git commit -m "refactor: rename letter to letters..."
git push
```

### 影響範囲

**変更されたファイル**: 23ファイル
- renamed: 4ファイル（README.md, TEMPLATE.md × 2パターン）
- modified: 19ファイル（各種ドキュメントの参照先更新）

**ユーザーへの影響**:
- 既存プロジェクトでこのパターンを使用している場合は、`letter/` → `letters/` への移行が必要
- degit で新規取得する場合は自動的に新しい構造になる

## 学び

### 1. 命名の一貫性の重要性
- ディレクトリ名は「格納される内容の性質」を反映すべき
- 複数の項目を格納する場合は複数形が自然
- 早期のフィードバックで改善できた

### 2. 一括変更の効率性
- `sed` や `find` を使った一括置換で効率的に対応
- Git の `rename` 検出により、履歴が保持される
- すべてのドキュメントの整合性を保つことが重要

### 3. パターンの拡張性
- 2つのパターンで同時に変更が必要だったが、構造が統一されていたため容易に対応できた
- テンプレートベースの設計の利点

## 今後の改善案

1. **命名規則ガイドの明確化**: パターン設計時に命名規則を明示
2. **自動テストの導入**: リンク切れチェックなどの自動検証
3. **移行ガイドの提供**: 既存ユーザー向けの移行手順を文書化

## 関連ドキュメント
- [Note 09](./09_notes-4digit-numbering-change.md) - notes 4桁連番への変更
- [Note 05](./05_pattern-docs-standard-structure.md) - パターン文書標準構造
- [申し送りテンプレート](../letters/TEMPLATE.md)

---

**最終更新**: 2025-11-01
**作成者**: Claude & User
