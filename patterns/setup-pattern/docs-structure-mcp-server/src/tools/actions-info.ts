/**
 * actions_info ツール
 *
 * actions フォルダ内の全指示書の一覧を返す。
 * navigate で呼べるものと、そうでないものを区別して表示。
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// navigate で呼べる指示書（navigate.ts と同じリスト）
const navigableActionPaths = [
  'actions/00_session_end.md',
  'actions/doc_note.md',
  'actions/doc_letter.md',
  'actions/doc_note_and_commit.md',
  'actions/git_commit.md',
  'actions/01_git_push.md'
];

export const actionsInfoInputSchema = {};

export const actionsInfoToolDefinition = {
  name: "actions_info",
  description: "「指示書の一覧を見たい」「どんなアクションがあるか知りたい」ときに使う。actions フォルダ内の全指示書の一覧（パス + 役割説明）を返す。navigate で呼べるものと、そうでないものを区別して表示。",
  inputSchema: actionsInfoInputSchema,
};

/**
 * Markdown ファイルの1行目の見出しを取得
 */
function extractTitle(filePath: string): string {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^#\s+(.+)/);
      if (match) {
        return match[1].trim();
      }
    }
    return '';
  } catch {
    return '';
  }
}

export async function actionsInfoToolHandler(
  args: any,
  docsPath: string
) {
  const actionsDir = join(docsPath, 'actions');

  // actions フォルダ内の .md ファイルを取得
  const files = readdirSync(actionsDir)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .sort();

  const navigableActions: string[] = [];
  const otherActions: string[] = [];

  for (const file of files) {
    const filePath = join(actionsDir, file);
    const relativePath = `actions/${file}`;
    const title = extractTitle(filePath);
    const displayLine = title
      ? `- ${relativePath} - ${title}`
      : `- ${relativePath}`;

    if (navigableActionPaths.includes(relativePath)) {
      navigableActions.push(displayLine);
    } else {
      otherActions.push(displayLine);
    }
  }

  let output = '';

  if (navigableActions.length > 0) {
    output += '## よく使う指示書（navigate で呼べます）\n\n';
    output += navigableActions.join('\n');
    output += '\n\n';
  }

  if (otherActions.length > 0) {
    output += '## その他の指示書（直接パス指定で呼ぶ）\n\n';
    output += otherActions.join('\n');
    output += '\n\n';
  }

  output += '---\n';
  output += '指示書を実行する場合は、パスをそのまま @ 参照で指定してください。\n';
  output += '例: `@actions/doc_note.md を指示書として実行`';

  return {
    content: [{
      type: "text" as const,
      text: output.trim()
    }]
  };
}
