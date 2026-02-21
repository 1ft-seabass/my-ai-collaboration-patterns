/**
 * prepare_letter ツール
 *
 * 申し送り作成の段取りを整える。
 * テンプレートとファイル名を生成し、直近のノートと前回の申し送り情報も返す。
 */

import { z } from "zod";
import { join, basename } from "node:path";
import { generateFilename } from "../utils/naming.js";
import { loadTemplate } from "../utils/template.js";
import { listMarkdownFiles, extractTitle } from "../utils/search.js";

export const prepareLetterInputSchema = {
  title: z.string().describe("申し送りのタイトル"),
  recent_notes_count: z.number().optional().default(10).describe("添える直近ノート数"),
};

export const prepareLetterToolDefinition = {
  name: "prepare_letter",
  description: "「申し送りを作りたい」「次のセッションに引き継ぎたい」ときに使う。テンプレートとファイル名を生成し、直近のノートと前回の申し送り情報も返す。実際のファイル作成はユーザー側で行う。",
  inputSchema: prepareLetterInputSchema,
};

export async function prepareLetterToolHandler(
  { title, recent_notes_count = 10 }: { title: string; recent_notes_count?: number },
  docsPath: string
) {
  // 1. ファイル名を生成
  const filename = generateFilename(title);
  const filepath = join(docsPath, "letters", filename);

  // 2. テンプレートを読み込み（ガイド除去）
  const template = await loadTemplate(docsPath, "letters");

  // 3. 直近 N 件のノートを取得
  const notesDir = join(docsPath, "notes");
  const noteFiles = await listMarkdownFiles(notesDir);
  const recentNotes = await Promise.all(
    noteFiles.slice(0, recent_notes_count).map(async (filepath) => ({
      filepath,
      title: await extractTitle(filepath),
    }))
  );

  // 4. 直近 2 件の申し送りを取得
  const lettersDir = join(docsPath, "letters");
  const letterFiles = await listMarkdownFiles(lettersDir);
  const recentLetters = await Promise.all(
    letterFiles.slice(0, 2).map(async (filepath) => ({
      filepath,
      title: await extractTitle(filepath),
    }))
  );

  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        filepath,
        template,
        recent_notes: recentNotes,
        recent_letters: recentLetters,
      }, null, 2),
    }],
  };
}
