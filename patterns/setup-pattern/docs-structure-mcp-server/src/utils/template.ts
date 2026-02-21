/**
 * テンプレート読み込みユーティリティ
 *
 * テンプレートは {DOCS_PATH}/{type}/TEMPLATE.md から読み込む。
 * ガイド部分を除去して、実際のテンプレート内容のみを返す。
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * テンプレートのガイド除去マーカー
 * このマーカー行以降のみを返す（マーカー行自体は除く）
 */
const TEMPLATE_MARKER = '<!-- ============================================================';

/**
 * テンプレートを読み込み、ガイド部分を除去して返す
 *
 * @param docsPath - DOCS_PATH (process.cwd() ベースで解決済み)
 * @param type - テンプレートタイプ (notes, letters, tasks)
 * @returns ガイド除去済みのテンプレート本文
 * @throws TEMPLATE.md が存在しない場合はエラー
 */
export async function loadTemplate(docsPath: string, type: 'notes' | 'letters' | 'tasks'): Promise<string> {
  const templatePath = join(docsPath, type, 'TEMPLATE.md');

  try {
    const content = await readFile(templatePath, 'utf-8');
    return removeGuide(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`TEMPLATE.md not found: ${templatePath}`);
    }
    throw error;
  }
}

/**
 * テンプレートからガイド部分を除去
 *
 * マーカー行を検索し、それ以降の内容のみを返す。
 * マーカーが見つからない場合は全文を返す。
 *
 * @param content - テンプレートの全文
 * @returns ガイド除去済みの本文
 */
function removeGuide(content: string): string {
  const lines = content.split('\n');
  const markerIndex = lines.findIndex(line => line.startsWith(TEMPLATE_MARKER));

  if (markerIndex === -1) {
    // マーカーが見つからない場合は全文を返す
    return content;
  }

  // マーカー行の次の行が "ここから下が実際のテンプレート内容" のようなコメント
  // さらにその次の行が閉じタグ "============================================================ -->"
  // なので、markerIndex + 3 から開始する
  const templateStart = markerIndex + 3;

  // 先頭の空行を除去
  const templateLines = lines.slice(templateStart);
  while (templateLines.length > 0 && templateLines[0].trim() === '') {
    templateLines.shift();
  }

  return templateLines.join('\n');
}
