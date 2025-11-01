# 申し送りファイルパス通知機能の追加

## 概要

申し送りファイル作成時に、プロジェクトルートからの相対パスを通知する仕組みを各パターンに追加しました。

## 背景・課題

申し送りファイルを作成した後、次のセッションでそのファイルを参照したいとき、毎回ファイルパスを探す必要がありました。

ユーザーからの要望：
- 申し送り作成後に、プロジェクトルートからの相対パスを通知してほしい
- @マークなどの特定ツールに依存しない形式で（ロックインを避ける）
- どのツールでも使える汎用的な形式で

## 対応内容

### 1. current_create_letter アクションに通知指示を追加

以下のパターンの `current_create_letter.md` に手順4を追加：

- `patterns/docs-structure/templates/actions/current_create_letter.md`
- `patterns/docs-structure-for-target-branch-only/templates/actions/current_create_letter.md`
- `patterns/actions-pattern/templates/actions/current_create_letter.md`

**追加内容**:
```markdown
4. **申し送りファイルパスの通知**
   - 申し送り作成完了後、必ず以下の形式で通知してください：
   ```
   申し送りファイルを作成しました:
   docs/letters/YYYY-MM-DD-HH-MM-SS.md
   ```
   - プロジェクトルートからの相対パスで記載
   - 次セッションで簡単に参照できるようにするため
```

### 2. letters/README.md に説明セクションを追加

以下のパターンの `letters/README.md` に「📍 ファイルパスの通知」セクションを追加：

- `patterns/docs-structure/templates/letters/README.md`
- `patterns/docs-structure-for-target-branch-only/templates/docs/letters/README.md`
- `patterns/writing-collaborate/templates/letters/README.md`

**追加内容**:
```markdown
## 📍 ファイルパスの通知

申し送りを作成した際は、プロジェクトルートからの相対パスで通知してください：

```
申し送りファイルを作成しました:
docs/letters/2025-10-23-15-30-00.md
```

これにより、次セッションで簡単にファイルを参照できます。
```

注: `writing-collaborate` パターンは `collaborate/letters/` を使用

## 期待される効果

- 次セッションで申し送りファイルを即座に参照可能
- ファイルパスを探す手間が削減
- 特定のツールに依存しない汎用的な形式
- コピー＆ペーストで簡単に使える

## 実装日

2025-11-01

## 関連ファイル

- patterns/docs-structure/templates/actions/current_create_letter.md
- patterns/docs-structure/templates/letters/README.md
- patterns/docs-structure-for-target-branch-only/templates/actions/current_create_letter.md
- patterns/docs-structure-for-target-branch-only/templates/docs/letters/README.md
- patterns/actions-pattern/templates/actions/current_create_letter.md
- patterns/writing-collaborate/templates/letters/README.md
