/**
 * search_docs_content ツール
 *
 * docs/ 配下の全文を grep する。
 */

import { z } from "zod";
import { grepContent } from "../utils/search.js";
import type { Scope } from "../utils/search.js";
import { log } from "../utils/logger.js";

export const searchDocsContentInputSchema = z.object({
  query: z.string().describe("検索文字列"),
  scope: z.enum(["notes", "letters", "tasks", "all"]).optional().default("all").describe("検索範囲"),
});

export const searchDocsContentToolDefinition = {
  name: "search_docs_content",
  description: "ノートや申し送りの中身を全文検索したいときに使う。タグ検索もこれで対応できる。タイトルだけで探す場合は search_docs_titles を使う。",
  inputSchema: searchDocsContentInputSchema,
};

export async function searchDocsContentToolHandler(
  { query, scope = "all" }: { query: string; scope?: Scope },
  docsPath: string
) {
  log('searchDocsContentToolHandler called', { query, scope, docsPath });

  const results = await grepContent(docsPath, query, scope);

  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        results,
      }, null, 2),
    }],
  };
}
