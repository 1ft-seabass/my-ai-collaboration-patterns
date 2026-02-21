/**
 * guide_note_creation ツール
 *
 * ノート作成の完全な手順ガイドを取得する。
 * 理解チェック、承認フロー、TEMPLATE.md 参照、機密情報保護ルールを含む。
 */

import { z } from "zod";
import { join } from "node:path";
import { generateFilename } from "../utils/naming.js";
import { loadTemplate } from "../utils/template.js";
import { loadActionGuide } from "../utils/action-loader.js";

export const guideNoteCreationInputSchema = {
  title: z.string().describe("ノートのタイトル（英数字のみ、日本語タイトルの場合は英訳してから渡すこと）"),
};

export const guideNoteCreationToolDefinition = {
  name: "guide_note_creation",
  description: "「ノートを作りたい」「知見を記録したい」ときに使う。ノート作成の完全な手順ガイドを取得します。理解チェック、承認フロー、TEMPLATE.md 参照、機密情報保護ルールを含みます。Claude はこのガイドに従ってユーザーに提案し、承認を得てからノートを作成してください。注意: タイトルは英数字のみで指定すること（日本語タイトルの場合は英訳が必要）。",
  inputSchema: guideNoteCreationInputSchema,
};

export async function guideNoteCreationToolHandler(
  { title }: { title: string },
  docsPath: string
) {
  // 1. actions/doc_note.md を読み込み
  const actionGuide = await loadActionGuide(docsPath, "doc_note.md");

  // 2. ファイル名を生成
  const filename = generateFilename(title);
  const filepath = join(docsPath, "notes", filename);

  // 3. テンプレートを読み込み（ガイド除去）
  const template = await loadTemplate(docsPath, "notes");

  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        guide: actionGuide,
        suggested_filepath: filepath,
        template,
      }, null, 2),
    }],
  };
}
