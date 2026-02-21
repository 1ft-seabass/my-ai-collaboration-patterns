/**
 * guide_git_commit ツール
 *
 * git コミットの完全な手順ガイドを取得する。
 * git status/diff 確認→コミットスタイル把握→段階的コミット計画→コミットの流れを含む。
 */

import { loadActionGuide } from "../utils/action-loader.js";

export const guideGitCommitInputSchema = {};

export const guideGitCommitToolDefinition = {
  name: "guide_git_commit",
  description: "「コミットしたい」「進捗をコミットしたい」ときに使う。git コミットの完全な手順ガイドを取得します。理解チェック、git status/diff 確認、コミットスタイル把握、段階的コミット計画を含みます。Claude はこのガイドに従ってユーザーに提案し、承認を得てからコミットを実行してください。",
  inputSchema: guideGitCommitInputSchema,
};

export async function guideGitCommitToolHandler(
  _input: Record<string, never>,
  docsPath: string
) {
  // actions/git_commit.md を読み込み
  const actionGuide = await loadActionGuide(docsPath, "git_commit.md");

  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        guide: actionGuide,
      }, null, 2),
    }],
  };
}
