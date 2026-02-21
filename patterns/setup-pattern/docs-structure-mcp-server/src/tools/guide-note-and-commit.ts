/**
 * guide_note_and_commit ツール
 *
 * ノート作成とコミットの完全な手順ガイドを取得する。
 * ノート作成→git status/diff 確認→コミットスタイル把握→コミットの流れを含む。
 */

import { z } from "zod";
import { join } from "node:path";
import { generateFilename } from "../utils/naming.js";
import { loadTemplate } from "../utils/template.js";
import { loadActionGuide } from "../utils/action-loader.js";

export const guideNoteAndCommitInputSchema = {
  title: z.string().describe("ノートのタイトル（英数字のみ、日本語タイトルの場合は英訳してから渡すこと）"),
};

export const guideNoteAndCommitToolDefinition = {
  name: "guide_note_and_commit",
  description: "「ノートを作ってコミットしたい」「知見を記録してコミットしたい」ときに使う。ノート作成とコミットの完全な手順ガイドを取得します。理解チェック、承認フロー、git 操作、コミットスタイル把握を含みます。Claude はこのガイドに従ってユーザーに提案し、承認を得てから作業を進めてください。注意: タイトルは英数字のみで指定すること（日本語タイトルの場合は英訳が必要）。",
  inputSchema: guideNoteAndCommitInputSchema,
};

export async function guideNoteAndCommitToolHandler(
  { title }: { title: string },
  docsPath: string
) {
  // 1. actions/doc_note_and_commit.md を読み込み
  const actionGuide = await loadActionGuide(docsPath, "doc_note_and_commit.md");

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
