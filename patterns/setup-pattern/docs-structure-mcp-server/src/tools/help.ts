/**
 * help ツール
 *
 * MCP サーバーの使い方とバージョンを返す。
 * 開発フロー検証の初手として最初に実装する。
 */

import { z } from "zod";

export const helpInputSchema = {};

export const helpToolDefinition = {
  name: "help",
  description: "この MCP サーバーの使い方を知りたいときに使う。利用可能なツール一覧と簡単な説明、バージョンを返す。",
  inputSchema: helpInputSchema,
};

export async function helpToolHandler() {
  const helpText = `# docs-structure MCP サーバー

## docs フォルダの役割

- **letters**: セッション間の申し送り
- **notes**: 試行錯誤・知見の記録
- **tasks**: サブの ToDo
- **actions**: 指示書

## 動かしたいときに使うツール

### navigate — よく使う指示書へのパスサジェスト

意図を伝えると対応する指示書のパスを返します。

よく使う指示書:
- actions/00_session_end.md - セッション終了 / 申し送り
- actions/doc_note.md - ノート作成 / まとめ / 記録
- actions/doc_letter.md - 申し送り作成のみ
- actions/doc_note_and_commit.md - ノートとコミット
- actions/git_commit.md - コミット / git commit
- actions/01_git_push.md - プッシュ / git push

### actions_info — 全指示書の一覧を表示

navigate 対応のものも含め、actions フォルダ内の全指示書を一覧表示します。

### search_docs_titles — タイトルで検索

ノートや申し送りをタイトルで検索します。

### search_docs_content — 中身を全文検索

ドキュメントの中身を全文検索します。

---
version: 0.1.0`;

  return {
    content: [{
      type: "text" as const,
      text: helpText
    }]
  };
}
