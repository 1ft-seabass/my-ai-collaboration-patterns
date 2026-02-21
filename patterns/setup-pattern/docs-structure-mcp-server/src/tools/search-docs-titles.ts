/**
 * search_docs_titles ツール
 *
 * docs/ 配下のファイル名と冒頭タイトルを検索する。
 */

import { z } from "zod";
import { searchTitles } from "../utils/search.js";
import type { Scope } from "../utils/search.js";

export const searchDocsTitlesInputSchema = z.object({
  query: z.string().describe("検索文字列"),
  scope: z.enum(["notes", "letters", "tasks", "all"]).optional().default("all").describe("検索範囲"),
});

export const searchDocsTitlesToolDefinition = {
  name: "search_docs_titles",
  description: "ノートや申し送りをタイトルで探したいときに使う。ファイル名と冒頭の見出しを検索する。全文を検索したい場合は search_docs_content を使う。",
  inputSchema: searchDocsTitlesInputSchema,
};

export async function searchDocsTitlesToolHandler(
  { query, scope = "all" }: { query: string; scope?: Scope },
  docsPath: string
) {
  const results = await searchTitles(docsPath, query, scope);

  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        results,
      }, null, 2),
    }],
  };
}
