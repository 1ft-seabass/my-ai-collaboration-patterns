# 申し送りメッセージフォーマットのMarkdown見出しバグ修正

**作成日**: 2025-11-17
**関連タスク**: 申し送りフロー改善の継続

## 問題

申し送り作成時に出力される「次セッション用メッセージ」に含まれる運用ルールが、AIの出力時にMarkdown見出しとして誤認識される問題が発生していた。

### 問題の構造

1. **テンプレートの記述**:
```markdown
このプロジェクトの運用ルール:
・知見は docs/notes/ ...
・申し送りは docs/letters/ ...
```

2. **AIが出力する際の変換**:
   - AI（特にClaude）が申し送りを出力する際、中黒 `・` をハイフン `-` に置き換えることがある
   - すると以下のようになる：
```markdown
このプロジェクトの運用ルール:
- 知見は docs/notes/ ...
- 申し送りは docs/letters/ ...
```

3. **Markdownの誤認識**:
   - この形式が「Setext形式の見出し + リスト」として解釈される可能性
   - レンダリングが意図しない形になる

### 副次的な問題

- `:` の直後に改行があると、次の行の解釈がブラウザやMarkdownパーサーによって不安定になる

## 解決策

`:` を削除し、代わりに空行を挿入することで、見出しとリストを明確に分離。

### 修正前
```markdown
このプロジェクトの運用ルール:
・知見は docs/notes/ ...
```

### 修正後
```markdown
このプロジェクトの運用ルール

・知見は docs/notes/ ...
```

### 効果

1. **見出しバグの防止**: AIが `-` に置き換えても、空行があるため見出しとは解釈されない
2. **レンダリングの安定化**: 空行により、構造が明確になる
3. **可読性の向上**: 視覚的にも区切りが明確になる

## 実装

### 修正対象ファイル（合計9ファイル）

**current_create_letter.md（5ファイル）**:
- `docs/actions/current_create_letter.md`
- `patterns/actions-pattern/templates/actions/current_create_letter.md`
- `patterns/docs-structure/templates/actions/current_create_letter.md`
- `patterns/docs-structure-for-target-branch-only/templates/docs/actions/current_create_letter.md`
- `patterns/writing-collaborate/templates/actions/current_create_letter.md`

**TEMPLATE.md（4ファイル）**:
- `docs/letters/TEMPLATE.md`
- `patterns/docs-structure/templates/letters/TEMPLATE.md`
- `patterns/docs-structure-for-target-branch-only/templates/docs/letters/TEMPLATE.md`
- `patterns/writing-collaborate/templates/letters/TEMPLATE.md`

### 修正箇所

申し送り完了通知の例文部分（各ファイル60-95行目付近）:
```markdown
このプロジェクトの運用ルール:
```
↓
```markdown
このプロジェクトの運用ルール

```

## 学び

### 1. Markdownレンダリングの特性理解

- AIが出力時に記号を置き換える可能性を考慮する必要がある
- 特に `・` → `-` の変換は頻繁に発生する
- Markdownの構文（特にSetext形式の見出し）との干渉に注意

### 2. テンプレート設計の重要性

- ユーザーがコピペして使うメッセージは、どのように出力されるかまで考慮する
- AIの癖や変換パターンを想定した設計が必要
- 「人間が書く」と「AIが出力する」では異なる配慮が必要

### 3. 小さな改善の積み重ね

- `:` の有無という小さな変更でも、使い勝手に大きく影響する
- 実際に運用して発見した問題を素早く修正するサイクルが重要

## 関連ドキュメント

- [85_handoff-workflow-improvement-with-session-prompt.md](./85_handoff-workflow-improvement-with-session-prompt.md) - 申し送りフロー改善の前回の取り組み
- [84_apply-fullspec-letter-template.md](./84_apply-fullspec-letter-template.md) - 申し送りテンプレート全体への適用

---

**最終更新**: 2025-11-17
**作成者**: AI (Claude Sonnet 4.5)
