/**
 * guide_git_push ツール
 *
 * git push 前の最終チェック手順ガイドを取得する。
 * 機密情報チェック、.gitignore 保護確認、安全性検証を含む。
 */

import { loadActionGuide } from "../utils/action-loader.js";

export const guideGitPushInputSchema = {};

export const guideGitPushToolDefinition = {
  name: "guide_git_push",
  description: "「プッシュしたい」「リモートに反映したい」ときに使う。git push 前の最終チェック手順ガイドを取得します。機密情報チェック、.gitignore 保護確認、安全性検証を含みます。Claude はこのガイドに従って git diff をチェックし、問題がなければユーザーの承認を得てからプッシュを実行してください。",
  inputSchema: guideGitPushInputSchema,
};

export async function guideGitPushToolHandler(
  _input: Record<string, never>,
  docsPath: string
) {
  // actions/01_git_push.md を読み込み
  const actionGuide = await loadActionGuide(docsPath, "01_git_push.md");

  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        guide: actionGuide,
      }, null, 2),
    }],
  };
}
