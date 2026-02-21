/**
 * 検索ユーティリティ
 *
 * grep ラッパー、スコープ絞り込み、ファイル探索など
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { log } from './logger.js';

const execAsync = promisify(exec);

export type Scope = 'notes' | 'letters' | 'tasks' | 'all';

/**
 * スコープに応じた対象ディレクトリを取得
 */
export function getScopePaths(docsPath: string, scope: Scope): string[] {
  if (scope === 'all') {
    return [
      join(docsPath, 'notes'),
      join(docsPath, 'letters'),
      join(docsPath, 'tasks'),
    ];
  }
  return [join(docsPath, scope)];
}

/**
 * ディレクトリ内の .md ファイルを日時降順でソート
 * TEMPLATE.md と README.md は除外
 */
export async function listMarkdownFiles(dirPath: string): Promise<string[]> {
  try {
    const entries = await readdir(dirPath);
    const mdFiles = entries.filter(file =>
      file.endsWith('.md') &&
      file !== 'TEMPLATE.md' &&
      file !== 'README.md'
    );

    // ファイル名に日時接頭語が含まれている前提でソート（降順）
    mdFiles.sort((a, b) => b.localeCompare(a));

    return mdFiles.map(file => join(dirPath, file));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * ファイルの冒頭タイトル（# で始まる最初の行）を取得
 */
export async function extractTitle(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // FrontMatter をスキップ
    let startIndex = 0;
    if (lines[0] === '---') {
      const endIndex = lines.findIndex((line, i) => i > 0 && line === '---');
      if (endIndex !== -1) {
        startIndex = endIndex + 1;
      }
    }

    // # で始まる最初の行を探す
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('# ')) {
        return line.replace(/^#\s+/, '');
      }
    }

    return '(no title)';
  } catch {
    return '(error reading file)';
  }
}

/**
 * FrontMatter から tags を抽出
 */
export async function extractTags(filePath: string): Promise<string[]> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    if (lines[0] !== '---') {
      return [];
    }

    const endIndex = lines.findIndex((line, i) => i > 0 && line === '---');
    if (endIndex === -1) {
      return [];
    }

    const frontMatter = lines.slice(1, endIndex).join('\n');

    // 簡易的な tags パース (tags: [tag1, tag2] 形式)
    const tagsMatch = frontMatter.match(/tags:\s*\[(.*?)\]/);
    if (tagsMatch) {
      return tagsMatch[1]
        .split(',')
        .map(tag => tag.trim().replace(/['"]/g, ''))
        .filter(tag => tag.length > 0);
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * ファイルの作成日時を取得（ファイル名から抽出）
 */
export function extractCreatedAt(filename: string): string {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})/);
  if (match) {
    const [year, month, day, hour, minute, second] = match[1].split('-');
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }
  return '';
}

/**
 * grep で全文検索
 *
 * @param docsPath - DOCS_PATH
 * @param query - 検索文字列
 * @param scope - 検索範囲
 * @returns マッチした行の配列 [{ filepath, line_number, matched_line }]
 */
export async function grepContent(
  docsPath: string,
  query: string,
  scope: Scope
): Promise<Array<{ filepath: string; line_number: number; matched_line: string }>> {
  const scopePaths = getScopePaths(docsPath, scope);
  const results: Array<{ filepath: string; line_number: number; matched_line: string }> = [];

  log('grepContent called', { docsPath, query, scope, scopePaths });

  for (const scopePath of scopePaths) {
    try {
      const cmd = `grep -rn "${query}" "${scopePath}" --include="*.md" --exclude="TEMPLATE.md" --exclude="README.md"`;
      log('Running grep command', { cmd });

      const { stdout } = await execAsync(cmd, { maxBuffer: 1024 * 1024 });

      log('grep stdout received', { length: stdout.length });

      const lines = stdout.trim().split('\n');
      for (const line of lines) {
        if (!line) continue;

        // 形式: filepath:line_number:matched_line
        const match = line.match(/^(.+?):(\d+):(.+)$/);
        if (match) {
          results.push({
            filepath: match[1],
            line_number: parseInt(match[2], 10),
            matched_line: match[3],
          });
        }
      }
    } catch (error) {
      // grep がマッチしない場合は exit code 1 を返すので、無視して続行
      // その他のエラー（ディレクトリが存在しない等）も無視
      log('grep error', { message: (error as any).message, code: (error as any).code });
      continue;
    }
  }

  log('grepContent completed', { resultCount: results.length });

  // 最大30件に制限
  return results.slice(0, 30);
}

/**
 * ファイル名と冒頭タイトルで検索
 *
 * @param docsPath - DOCS_PATH
 * @param query - 検索文字列
 * @param scope - 検索範囲
 * @returns マッチしたファイルの配列 [{ filepath, title }]
 */
export async function searchTitles(
  docsPath: string,
  query: string,
  scope: Scope
): Promise<Array<{ filepath: string; title: string }>> {
  const scopePaths = getScopePaths(docsPath, scope);
  const results: Array<{ filepath: string; title: string }> = [];

  for (const scopePath of scopePaths) {
    const files = await listMarkdownFiles(scopePath);

    for (const filepath of files) {
      const filename = filepath.split('/').pop() || '';
      const title = await extractTitle(filepath);

      // ファイル名またはタイトルに query が含まれているか
      if (filename.includes(query) || title.includes(query)) {
        results.push({ filepath, title });

        // 最大20件
        if (results.length >= 20) {
          return results;
        }
      }
    }
  }

  return results;
}
