/**
 * guide_letter_creation ツール
 *
 * 申し送り作成の完全な手順ガイドを取得する。
 * 理解チェック、前回申し送り確認、TEMPLATE.md 参照、機密情報保護ルールを含む。
 */

import { z } from "zod";
import { join } from "node:path";
import { generateFilename } from "../utils/naming.js";
import { loadTemplate } from "../utils/template.js";
import { loadActionGuide } from "../utils/action-loader.js";
import { listMarkdownFiles, extractTitle } from "../utils/search.js";

export const guideLetterCreationInputSchema = {
  title: z.string().describe("申し送りのタイトル（英数字のみ、日本語タイトルの場合は英訳してから渡すこと）"),
  recent_notes_count: z.number().optional().default(10).describe("添える直近ノート数"),
};

export const guideLetterCreationToolDefinition = {
  name: "guide_letter_creation",
  description: "「申し送りを作りたい」「次のセッションに引き継ぎたい」ときに使う。申し送り作成の完全な手順ガイドを取得します。理解チェック、前回申し送り確認、TEMPLATE.md 参照、機密情報保護ルールを含みます。Claude はこのガイドに従ってユーザーに提案し、承認を得てから申し送りを作成してください。注意: タイトルは英数字のみで指定すること（日本語タイトルの場合は英訳が必要）。",
  inputSchema: guideLetterCreationInputSchema,
};

export async function guideLetterCreationToolHandler(
  { title, recent_notes_count = 10 }: { title: string; recent_notes_count?: number },
  docsPath: string
) {
  // 1. actions/doc_letter.md を読み込み
  const actionGuide = await loadActionGuide(docsPath, "doc_letter.md");

  // 2. ファイル名を生成
  const filename = generateFilename(title);
  const filepath = join(docsPath, "letters", filename);

  // 3. テンプレートを読み込み（ガイド除去）
  const template = await loadTemplate(docsPath, "letters");

  // 4. 直近 N 件のノートを取得
  const notesDir = join(docsPath, "notes");
  const noteFiles = await listMarkdownFiles(notesDir);
  const recentNotes = await Promise.all(
    noteFiles.slice(0, recent_notes_count).map(async (filepath) => ({
      filepath,
      title: await extractTitle(filepath),
    }))
  );

  // 5. 直近 2 件の申し送りを取得
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
        guide: actionGuide,
        suggested_filepath: filepath,
        template,
        recent_notes: recentNotes,
        recent_letters: recentLetters,
      }, null, 2),
    }],
  };
}
