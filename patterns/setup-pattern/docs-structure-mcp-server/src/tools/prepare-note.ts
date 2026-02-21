/**
 * prepare_note ツール
 *
 * ノート作成の段取りを整える。
 * テンプレートとファイル名を生成して返す。
 */

import { z } from "zod";
import { join } from "node:path";
import { generateFilename } from "../utils/naming.js";
import { loadTemplate } from "../utils/template.js";
import { listMarkdownFiles } from "../utils/search.js";

export const prepareNoteInputSchema = {
  title: z.string().describe("ノートのタイトル（英数字のみ、日本語タイトルの場合は英訳してから渡すこと）"),
};

export const prepareNoteToolDefinition = {
  name: "prepare_note",
  description: "「ノートを作りたい」「知見を記録したい」「試行錯誤をまとめたい」ときに使う。テンプレートとファイル名を生成して返す。実際のファイル作成はユーザー側で行う。注意: タイトルは英数字のみで指定すること（日本語タイトルの場合は英訳が必要）。",
  inputSchema: prepareNoteInputSchema,
};

export async function prepareNoteToolHandler(
  { title }: { title: string },
  docsPath: string
) {
  // 1. ファイル名を生成
  const filename = generateFilename(title);
  const filepath = join(docsPath, "notes", filename);

  // 2. テンプレートを読み込み（ガイド除去）
  const template = await loadTemplate(docsPath, "notes");

  // 3. 既存のノート数をカウント
  const notesDir = join(docsPath, "notes");
  const existingFiles = await listMarkdownFiles(notesDir);
  const existing_count = existingFiles.length;

  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        filepath,
        template,
        existing_count,
      }, null, 2),
    }],
  };
}
