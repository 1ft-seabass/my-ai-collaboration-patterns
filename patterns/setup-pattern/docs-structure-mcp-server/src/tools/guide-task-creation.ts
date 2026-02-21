/**
 * guide_task_creation ツール
 *
 * タスク作成のガイドを取得する。
 * TEMPLATE.md を使用してタスクを作成する。
 */

import { z } from "zod";
import { join } from "node:path";
import { generateFilename } from "../utils/naming.js";
import { loadTemplate } from "../utils/template.js";

export const guideTaskCreationInputSchema = {
  title: z.string().describe("タスクのタイトル（英数字のみ、日本語タイトルの場合は英訳してから渡すこと）"),
  priority: z.enum(["high", "medium", "low"]).optional().default("medium").describe("優先度"),
};

export const guideTaskCreationToolDefinition = {
  name: "guide_task_creation",
  description: "「タスクを記録したい」「あとでやることをメモしたい」ときに使う。タスク作成のガイドとテンプレートを取得します。注意: タイトルは英数字のみで指定すること（日本語タイトルの場合は英訳が必要）。",
  inputSchema: guideTaskCreationInputSchema,
};

export async function guideTaskCreationToolHandler(
  { title, priority = "medium" }: { title: string; priority?: "high" | "medium" | "low" },
  docsPath: string
) {
  // 1. ファイル名を生成
  const filename = generateFilename(title);
  const filepath = join(docsPath, "tasks", filename);

  // 2. テンプレートを読み込み（ガイド除去）
  const template = await loadTemplate(docsPath, "tasks");

  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        suggested_filepath: filepath,
        template,
        priority,
        guide: "タスクを作成する際は、TEMPLATE.md を参考に以下を含めてください:\n" +
               "- FrontMatter (tags, status, priority)\n" +
               "- 概要・背景・理由\n" +
               "- 確認項目・チェックリスト\n" +
               "- 完了条件\n" +
               "- 機密情報は必ずプレースホルダーで記載",
      }, null, 2),
    }],
  };
}
