/**
 * prepare_task ツール
 *
 * タスク作成の段取りを整える。
 * テンプレートとファイル名を生成して返す。
 */

import { z } from "zod";
import { join } from "node:path";
import { generateFilename } from "../utils/naming.js";
import { loadTemplate } from "../utils/template.js";

export const prepareTaskInputSchema = {
  title: z.string().describe("タスクのタイトル（英数字のみ、日本語タイトルの場合は英訳してから渡すこと）"),
  priority: z.enum(["high", "medium", "low"]).optional().default("medium").describe("優先度"),
};

export const prepareTaskToolDefinition = {
  name: "prepare_task",
  description: "「タスクを記録したい」「あとでやることをメモしたい」ときに使う。テンプレートとファイル名を生成して返す。実際のファイル作成はユーザー側で行う。注意: タイトルは英数字のみで指定すること（日本語タイトルの場合は英訳が必要）。",
  inputSchema: prepareTaskInputSchema,
};

export async function prepareTaskToolHandler(
  { title, priority = "medium" }: { title: string; priority?: "high" | "medium" | "low" },
  docsPath: string
) {
  // 1. ファイル名を生成
  const filename = generateFilename(title);
  const filepath = join(docsPath, "tasks", filename);

  // 2. テンプレートを読み込み（ガイド除去）
  let template = await loadTemplate(docsPath, "tasks");

  // 3. priority プレースホルダーを置換（もし存在すれば）
  // テンプレート内に {{priority}} のようなプレースホルダーがあれば置換
  template = template.replace(/\{\{priority\}\}/g, priority);

  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        filepath,
        template,
      }, null, 2),
    }],
  };
}
