/**
 * 共通型定義
 */

export type DocType = 'notes' | 'letters' | 'tasks';

export interface FileInfo {
  filepath: string;
  title: string;
}

export interface LetterInfo extends FileInfo {
  tags: string[];
  created_at: string;
}

export interface SearchResult {
  filepath: string;
  line_number: number;
  matched_line: string;
}
