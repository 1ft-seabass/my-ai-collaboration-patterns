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
  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        name: "docs-structure",
        version: "0.1.0",
        description: "letters/notes/tasks の日常運用を支援する MCP サーバー",
        tools: [
          { name: "help", summary: "この MCP の使い方とバージョンを表示" },
          { name: "prepare_note", summary: "ノート作成の段取り（テンプレート + ファイル名生成）" },
          { name: "prepare_letter", summary: "申し送り作成の段取り（テンプレート + 直近情報）" },
          { name: "prepare_task", summary: "タスク作成の段取り（テンプレート + ファイル名生成）" },
          { name: "list_letters", summary: "申し送りの一覧取得" },
          { name: "search_docs_titles", summary: "タイトル検索（軽量）" },
          { name: "search_docs_content", summary: "全文検索（grep）" }
        ]
      }, null, 2)
    }]
  };
}
