# 開発ノート

技術的な試行錯誤、問題解決の記録を格納しています。

## 📄 ノート一覧

### 0001. [degit の挙動理解](./0001_degit-understanding.md)
degit とは何か、どう使うべきか。ファイルコピーツールとしての本質を理解。

### 0002. [パターン構造の設計](./0002_pattern-structure-design.md)
ワンショット指示とファイル構造の関係。GUIDE.md と templates/ の役割。

### 0003. [ドッグフーディング実践](./0003_repository-dogfooding.md)
このリポジトリ自身に docs/ を作成し、AI協働開発ガイドに従う実践記録。

### 0004. [パターン抽出プロセス](./0004_pattern-extraction-process.md)
docs/ 構造を patterns/docs-structure/ として抽出・パッケージ化する過程の記録。

### 0005. [パターン文書標準構造](./0005_pattern-docs-standard-structure.md)
パターン文書の標準構造を定義。README、GUIDE、examples の役割分担を明確化。

### 0006. [ガイド簡略化の原則](./0006_guide-simplification-principles.md)
AI向けガイドを簡潔に保つための原則。本質だけを残し、実装詳細はコードに委ねる。

### 0007. [タスク管理システム統合](./0007_task-system-integration.md)
申し送りを主役としたタスク管理システムの統合。セッション跨ぎタスクの運用方法。

### 0008. [letter → letters への変更](./0008_letters-naming-change.md)
申し送りディレクトリを letter/ から letters/ に変更した経緯と実装詳細。複数形への統一。

### 0009. [notes 4桁連番への変更](./0009_notes-4digit-numbering-change.md)
開発ノートの連番を2桁から4桁に変更。スケーラビリティ向上とtasksとの一貫性確保。

### 0010. [writing-collaborate パターンの作成](./0010_writing-collaborate-pattern-creation.md)
執筆作業に特化した軽量版パターンの作成。docs-structure をベースに、フォルダ名変更と3フォルダ構成へ簡素化。

### 0011. [README 同期と新パターン展開](./0011_readme-sync-with-new-patterns.md)
各パターンの README を同期し、新しいパターンへの展開を実施。

### 0012. [degit 指示の混乱回避](./0012_degit-instruction-anti-confusion.md)
degit 指示における混乱を回避するための改善策。

### 0013. [早すぎるプロジェクト固有カスタマイズを避ける](./0013_avoid-premature-project-specific-customization.md)
プロジェクト固有のカスタマイズを早い段階で行うことによる問題と対策。

### 0014. [申し送りファイルパス通知機能](./0014_letter-filepath-notification.md)
申し送り作成時にファイルパスを通知する機能の導入。

### 0015. [既存プロジェクトに申し送りファイルパス通知機能を追加](./0015_add-letter-filepath-notification-to-existing-projects.md)
すでに申し送りテンプレートを使っているプロジェクトへのファイルパス通知機能追加ガイド。

### 0016. [申し送りテンプレート改善](./0016_letter-template-improvement.md)
申し送りテンプレートの改善に関する記録。

### 0017. [フルスペック申し送りテンプレート適用](./0017_apply-fullspec-letter-template.md)
文脈保持機能を強化したフルスペック版申し送りテンプレートの適用指示書。

### 0018. [申し送り運用改善：次セッション用定型文の導入](./0018_handoff-workflow-improvement-with-session-prompt.md)
申し送り時に次セッション用の定型文を提示する運用改善。

### 0019. [申し送りメッセージフォーマットのMarkdown見出しバグ修正](./0019_fix-handoff-message-markdown-heading-bug.md)
申し送りメッセージ内の運用ルールがMarkdown見出しとして誤認識される問題の修正。

### 0020. [notes 連番の一貫性改善](./0020_notes-numbering-consistency-improvement.md)
開発ノートの連番表記を完全に4桁に統一した改善記録。

### 0021. [申し送り検証プロトコルの導入](./0021_verification-protocol-for-handoff.md)
申し送りの完了状態を次セッションで自動検証するプロトコルの導入。

### 0025. [setup-pattern の導入](./0025_setup-pattern-introduction.md)
セキュリティチェックなど技術導入の段階的セットアップガイド集。session_end.md が無視される問題への対応。

## 📝 テンプレート

[TEMPLATE.md](./TEMPLATE.md) を使用してください。

## 📂 命名規則

```
XXXX_タイトル.md

例:
0001_degit-behavior-understanding.md
0002_pattern-repository-design.md
```

- **連番**: 4桁（0001, 0002, ...）
- **タイトル**: kebab-case

## 🎯 いつ使うか

- ✅ 難しい問題を解決した
- ✅ 複数の方法を試行錯誤した
- ✅ 技術的発見があった
- ✅ 将来同じ問題に遭遇する可能性がある

## 📖 構造

```markdown
# タイトル - 開発記録

## 問題
何が問題だったか

## 試行錯誤
### アプローチA
試したこと → 結果（失敗）

### アプローチB
試したこと → 結果（失敗）

### アプローチC（成功）
試したこと → 結果（成功）

## 解決策
最終的な実装

## 学び
この経験から得た知見
```

## 🔄 ADRとの関係

同じトピックの場合、**ノート→ADR**の順で書きます：

```
開発ノート（試行錯誤の物語）
  ↓
ADR（決意）
```

- **ノート**: どう問題を解決したか（過程）
- **ADR**: なぜその決定をしたか（結論）

## 🔗 関連ドキュメント

- [ドキュメント目次](../README.md)
- [AI協働開発ガイド](../ai-collaboration/)
- [ADR](../architecture/decisions/)
- [申し送り](../letters/)
