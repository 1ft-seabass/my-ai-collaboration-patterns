/**
 * Actions ガイド読み込みユーティリティ
 *
 * actions/*.md ファイルを読み込んで返す。
 * actions ディレクトリは DOCS_PATH の親ディレクトリにある想定。
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Actions ガイドを読み込む
 *
 * @param docsPath - DOCS_PATH (process.cwd() ベースで解決済み)
 * @param actionFileName - actions/*.md のファイル名 (例: '00_session_end.md')
 * @returns actions ファイルの全文
 * @throws ファイルが存在しない場合はエラー
 */
export async function loadActionGuide(docsPath: string, actionFileName: string): Promise<string> {
  const actionsPath = join(docsPath, '..', 'actions');
  const actionPath = join(actionsPath, actionFileName);

  try {
    return await readFile(actionPath, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Action guide not found: ${actionPath}`);
    }
    throw error;
  }
}
