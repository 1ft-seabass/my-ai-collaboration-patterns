/**
 * navigate ツール
 *
 * ユーザーの意図から対応する指示書のパスをサジェストする。
 * ファイルの中身は返さず、パスのみを返す。
 */

import { z } from "zod";

// navigate で呼べる指示書のマッピング（guide 系7つに対応）
// 注意: より具体的なキーワードを先に配置すること（「ノートとコミット」は「ノート」より前）
const navigableActions = [
  {
    keywords: ['セッション終了', 'session end', '終了', '申し送り', 'セッション終わ', 'session'],
    path: 'actions/00_session_end.md',
    description: 'セッション終了時の申し送り作成'
  },
  {
    keywords: ['ノートとコミット', 'note and commit', 'ノート作ってコミット', 'ノートコミット'],
    path: 'actions/doc_note_and_commit.md',
    description: 'ノート作成＋コミット'
  },
  {
    keywords: ['ノート', 'note', 'まとめ', '記録', '知見', 'ノート作成', 'ノート作り'],
    path: 'actions/doc_note.md',
    description: 'ノート作成（知見・試行錯誤の記録）'
  },
  {
    keywords: ['レター', 'letter', '申し送りのみ', '申し送りだけ'],
    path: 'actions/doc_letter.md',
    description: '申し送り作成のみ'
  },
  {
    keywords: ['コミット', 'commit', 'git commit', 'コミットし'],
    path: 'actions/git_commit.md',
    description: 'git コミット実行'
  },
  {
    keywords: ['プッシュ', 'push', 'git push', 'プッシュ前', 'プッシュ前チェック', 'プッシュし', 'プッシュする'],
    path: 'actions/01_git_push.md',
    description: 'git push 前の最終チェック'
  }
];

export const navigateInputSchema = {
  intent: z.string().describe("やりたいこと（例: 'ノート作りたい', 'セッション終了', 'コミットしたい'）"),
};

export const navigateToolDefinition = {
  name: "navigate",
  description: "「ノートを作りたい」「セッション終了」「コミットしたい」「プッシュしたい」「申し送り作りたい」など、やりたいことを伝えると対応する指示書のパスを返す。git 操作（コミット、プッシュ）も指示書経由で実行する。パスを確認後、指示書として実行する。",
  inputSchema: navigateInputSchema,
};

export async function navigateToolHandler(
  { intent }: { intent: string },
  docsPath: string
) {
  // 意図を小文字に変換してマッチング
  const intentLower = intent.toLowerCase();

  // キーワードマッチング
  for (const action of navigableActions) {
    for (const keyword of action.keywords) {
      if (intentLower.includes(keyword.toLowerCase())) {
        return {
          content: [{
            type: "text" as const,
            text: `${action.path} を指示書として実行します。よろしいですか？\n\n（${action.description}）`
          }]
        };
      }
    }
  }

  // マッチしない場合
  const availableActions = navigableActions
    .map(a => `- ${a.description}`)
    .join('\n');

  return {
    content: [{
      type: "text" as const,
      text: `該当する指示書が見つかりませんでした。\n\nnavigate で呼べる指示書:\n${availableActions}\n\nその他の指示書を探す場合は actions_info ツールを使ってください。`
    }]
  };
}
