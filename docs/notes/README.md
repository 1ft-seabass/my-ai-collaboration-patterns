# 開発ノート

技術的な試行錯誤、問題解決の記録を格納しています。

## 📄 ノート一覧

### 01. [degit の挙動理解](./01_degit-understanding.md)
degit とは何か、どう使うべきか。ファイルコピーツールとしての本質を理解。

### 02. [パターン構造の設計](./02_pattern-structure-design.md)
ワンショット指示とファイル構造の関係。GUIDE.md と templates/ の役割。

### 03. [ドッグフーディング実践](./03_repository-dogfooding.md)
このリポジトリ自身に docs/ を作成し、AI協働開発ガイドに従う実践記録。

### 04. [パターン抽出プロセス](./04_pattern-extraction-process.md)
docs/ 構造を patterns/docs-structure/ として抽出・パッケージ化する過程の記録。

### 05. [パターン文書標準構造](./05_pattern-docs-standard-structure.md)
パターン文書の標準構造を定義。README、GUIDE、examples の役割分担を明確化。

### 06. [ガイド簡略化の原則](./06_guide-simplification-principles.md)
AI向けガイドを簡潔に保つための原則。本質だけを残し、実装詳細はコードに委ねる。

### 07. [タスク管理システム統合](./07_task-system-integration.md)
申し送りを主役としたタスク管理システムの統合。セッション跨ぎタスクの運用方法。

### 08. [letter → letters への変更](./08_letters-naming-change.md)
申し送りディレクトリを letter/ から letters/ に変更した経緯と実装詳細。複数形への統一。

### 09. [notes 4桁連番への変更](./09_notes-4digit-numbering-change.md)
開発ノートの連番を2桁から4桁に変更。スケーラビリティ向上とtasksとの一貫性確保。

## 📝 テンプレート

[TEMPLATE.md](./TEMPLATE.md) を使用してください。

## 📂 命名規則

```
XXXX_タイトル.md (新規は4桁、既存は2桁のまま)

例:
0001_degit-behavior-understanding.md  # 新規の場合
01_degit-understanding.md             # 既存（移行中）
```

- **連番**: 4桁（0001, 0002, ...）← 09以降は4桁で作成
- **既存**: 01-08は2桁のまま維持（後方互換性）
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
