/**
 * list_letters ツール
 *
 * 申し送りの一覧を取得する。
 */

import { z } from "zod";
import { join, basename } from "node:path";
import { listMarkdownFiles, extractTitle, extractTags, extractCreatedAt } from "../utils/search.js";

export const listLettersInputSchema = z.object({
  count: z.number().min(1).max(10).optional().default(1).describe("取得件数"),
});

export const listLettersToolDefinition = {
  name: "list_letters",
  description: "「最新の申し送りを読みたい」「直近の開発状況を把握したい」ときに使う。指定件数分の申し送りファイル情報を返す。中身の読み込みはユーザー側で行う。",
  inputSchema: listLettersInputSchema,
};

export async function listLettersToolHandler(
  { count = 1 }: { count?: number },
  docsPath: string
) {
  // 1. letters/ のファイルを日時降順でソート
  const lettersDir = join(docsPath, "letters");
  const letterFiles = await listMarkdownFiles(lettersDir);

  // 2. 上位 N 件のファイルパス、冒頭タイトル、tags を取得
  const letters = await Promise.all(
    letterFiles.slice(0, count).map(async (filepath) => {
      const filename = basename(filepath);
      return {
        filepath,
        title: await extractTitle(filepath),
        tags: await extractTags(filepath),
        created_at: extractCreatedAt(filename),
      };
    })
  );

  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        letters,
      }, null, 2),
    }],
  };
}
