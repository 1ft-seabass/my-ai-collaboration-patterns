---
tags: [mcp, refactoring, navigate, actions-info, docs-structure]
---

# MCP ツール6ツール構成への集約 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-02-21

## 問題

前セッションで docs-structure MCP サーバーに guide 系7ツールを実装し、14ツール構成になった。しかし以下の問題が発覚：

1. **guide 系ツールの価値の再評価**: actions/*.md の中身を MCP が返すと、自然言語プロンプトとして通しで読ませる場合（90点）と比べて効果が落ちる（70点）
2. **ユーザーの本当の困りごと**: ファイルの中身へのアクセスではなく、「パスの記憶」が面倒
3. **点と線の混在**: MCP に適した「点」（パスサジェスト、検索）と、自然言語に適した「線」（actions/*.md の一連フロー）が混在

## 方向転換の経緯

ユーザー（田中さん）との対話で「点と線の分離」という設計思想が明確化：

- **点（MCP）**: 入力が決まれば出力が決まる。命名規則、テンプレート取得、grep 検索、**パスサジェスト**
- **線（自然言語）**: 理解チェック→承認フロー→実行の一連のフロー。actions/*.md が自然言語で制御

**決定事項**: guide 系は「ファイル内容の仲介者」から「パスのサジェスター」に役割を変更し、14ツール → 6ツールに集約

## 実装内容

### 新規作成したツール

#### 1. navigate ツール

**ファイル**: `patterns/setup-pattern/docs-structure-mcp-server/src/tools/navigate.ts`

**役割**: ユーザーの意図から対応する指示書のパスをサジェスト

**実装の要点**:
- guide 系7ツールを1つに束ねる
- 意図のキーワード → パスのマッピングをツール内にハードコード
- ファイルの中身は読まず、パスのみを返す
- より具体的なキーワードを先に配置（「ノートとコミット」は「ノート」より前）

**マッピング例**:
```typescript
const navigableActions = [
  {
    keywords: ['セッション終了', 'session end', '終了', '申し送り'],
    path: 'actions/00_session_end.md',
    description: 'セッション終了時の申し送り作成'
  },
  {
    keywords: ['ノートとコミット', 'note and commit'],
    path: 'actions/doc_note_and_commit.md',
    description: 'ノート作成＋コミット'
  },
  // ...
];
```

**返り値**:
```
actions/doc_note.md を指示書として実行します。よろしいですか？

（ノート作成（知見・試行錯誤の記録））
```

#### 2. actions_info ツール

**ファイル**: `patterns/setup-pattern/docs-structure-mcp-server/src/tools/actions-info.ts`

**役割**: actions フォルダ内の全指示書の一覧を返す

**実装の要点**:
- actions/*.md を自動スキャン
- navigate で呼べるものと、そうでないものを区別して表示
- 各ファイルの1行目の見出しを抽出して役割説明として表示
- フルパス（actions/*.md）を明記

**返り値例**:
```
## よく使う指示書（navigate で呼べます）

- actions/00_session_end.md - セッション終了
- actions/doc_note.md - ノート作成アクション
...

## その他の指示書（直接パス指定で呼ぶ）

- actions/dev_refactoring.md - リファクタリング（治療）
- actions/dev_review.md - 開発レビュー（診断）
...

---
指示書を実行する場合は、パスをそのまま @ 参照で指定してください。
例: `@actions/doc_note.md を指示書として実行`
```

### 更新したツール

#### help ツール

**ファイル**: `patterns/setup-pattern/docs-structure-mcp-server/src/tools/help.ts`

**変更内容**:
- JSON 形式から Markdown 形式に変更
- docs フォルダの役割説明を追加
- 各ツールの機能説明を追加
- よく使う指示書のフルパスと説明を明記

**効果**: README では見えない「動かし方」を具体的に案内できるようになった

### 削除したファイル

**guide 系7ファイル**:
- guide-session-end.ts
- guide-note-creation.ts
- guide-letter-creation.ts
- guide-task-creation.ts
- guide-note-and-commit.ts
- guide-git-commit.ts
- guide-git-push.ts

**utils 3ファイル**:
- action-loader.ts（actions/*.md を読み込む汎用ヘルパー）
- template.ts（テンプレート読み込み・ガイド除去）
- naming.ts（ファイル名生成）

→ ファイル内容を読む必要がなくなったため不要

### 最終ツール構成（6ツール）

1. **help** - docs の役割説明 + ツール案内
2. **navigate** - 意図→パスサジェスト
3. **actions_info** - 全指示書一覧
4. **list_letters** - 申し送り一覧（維持）
5. **search_docs_titles** - タイトル検索（維持）
6. **search_docs_content** - 全文検索（維持）

## 実装時の課題と解決

### 課題1: navigate のキーワードマッチング順序

**問題**: 「ノートとコミット」より先に「ノート」がマッチしてしまう

**原因**: 配列を順番にループしているため

**解決**: より具体的なキーワードを先に配置（配列の順序を変更）

```typescript
// 修正前: ノート → ノートとコミット
// 修正後: ノートとコミット → ノート
```

### 課題2: actions_info の出力が不十分

**問題**: パスのみが表示され、AI が @ 参照として認識しづらい

**解決**: 出力の最後に「パスの使い方」の説明を追加

```typescript
output += '---\n';
output += '指示書を実行する場合は、パスをそのまま @ 参照で指定してください。\n';
output += '例: `@actions/doc_note.md を指示書として実行`';
```

### 課題3: help にフルパスがない

**問題**: help ではツール名だけで、具体的なパスがわからない

**解決**: help にもよく使う指示書のフルパスと説明を明記

## 動作確認結果

ユーザー（田中さん）による動作確認:
- ✅ ノート作成 → navigate が正しく呼ばれる
- ✅ 使い方教えて → help が具体的なパスと説明を返す
- ✅ ノートを～で検索 → search 系が動作
- ✅ アクション一覧 → actions_info が全指示書を表示

**評価**: 「バッチリうまくいきました！最高！」

## 学び

1. **MCP に何を載せるかの判断基準**: 「できること」ではなく「効くこと」
2. **点と線の分離**: MCP は点（パスサジェスト、検索）に徹し、線（一連フロー）は自然言語に任せる
3. **help の重要性**: README では見えない「動かし方」を案内することで、自己説明的なツールになる
4. **キーワードマッチングの順序**: より具体的なキーワードを先に配置する必要がある

## 今後の改善案

1. **actions/ の進化に追従**: 新しい指示書が増えたら navigate のマッピングを更新
2. **よく使う指示書の見直し**: 使用頻度に応じて navigableActionPaths を調整
3. **クライアント案件への展開**: help の充実により、田中さんがいなくても仕組みが自己説明できる

## 関連ドキュメント

- [設計思想のノート](./2026-02-21-12-16-00-mcp-point-and-line-separation.md)
- [前回の申し送り](../letters/2026-02-21-09-46-00-mcp-guide-tools-complete.md)

---

**最終更新**: 2026-02-21
**作成者**: Claude Sonnet 4.5
