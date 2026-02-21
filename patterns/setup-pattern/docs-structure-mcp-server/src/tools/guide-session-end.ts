/**
 * guide_session_end ツール
 *
 * セッション終了時の申し送り作成手順ガイドを取得する。
 * ノート作成→コミット→申し送り作成の完全なフローを含む。
 */

import { z } from "zod";
import { join } from "node:path";
import { loadActionGuide } from "../utils/action-loader.js";
import { listMarkdownFiles, extractTitle } from "../utils/search.js";

export const guideSessionEndInputSchema = {};

export const guideSessionEndToolDefinition = {
  name: "guide_session_end",
  description: "「セッション終了したい」「申し送りを作成したい」ときに使う。セッション終了時の完全な手順ガイド（ノート作成→コミット→申し送り作成）を取得します。Claude はこのガイドに従ってユーザーに提案し、承認を得てから作業を進めてください。",
  inputSchema: guideSessionEndInputSchema,
};

export async function guideSessionEndToolHandler(
  _input: Record<string, never>,
  docsPath: string
) {
  // 1. actions/00_session_end.md を読み込み
  const actionGuide = await loadActionGuide(docsPath, "00_session_end.md");

  // 2. 直近 10 件のノートを取得（申し送り作成時に使う）
  const notesDir = join(docsPath, "notes");
  const noteFiles = await listMarkdownFiles(notesDir);
  const recentNotes = await Promise.all(
    noteFiles.slice(0, 10).map(async (filepath) => ({
      filepath,
      title: await extractTitle(filepath),
    }))
  );

  // 3. 直近 2 件の申し送りを取得（未着手・残件把握用）
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
        recent_notes: recentNotes,
        recent_letters: recentLetters,
      }, null, 2),
    }],
  };
}
