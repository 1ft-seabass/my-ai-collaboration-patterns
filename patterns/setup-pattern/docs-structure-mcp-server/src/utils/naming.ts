/**
 * ファイル名生成ユーティリティ
 *
 * 命名規則: yyyy-mm-dd-hh-mm-ss-{title}.md
 * - 日時: MCP サーバーのローカル時刻
 * - title: ケバブケース変換（アルファベットの場合）、日本語はそのまま
 */

/**
 * 日時接頭語を生成
 * @returns yyyy-mm-dd-hh-mm-ss 形式の文字列
 */
export function generateDatePrefix(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

/**
 * タイトルをケバブケースに変換
 * - アルファベット: スペース→ハイフン、英数字とハイフンのみ残す、小文字化
 * - 日本語: そのまま使う
 *
 * @param title - 変換対象のタイトル
 * @returns ケバブケース化されたタイトル
 */
export function toKebabCase(title: string): string {
  // 日本語文字が含まれている場合はそのまま返す
  if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(title)) {
    return title;
  }

  // アルファベットの場合: ケバブケース変換
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')           // スペースをハイフンに
    .replace(/[^a-z0-9-]/g, '')     // 英数字とハイフン以外を削除
    .replace(/-+/g, '-')            // 連続するハイフンを1つに
    .replace(/^-|-$/g, '');         // 先頭・末尾のハイフンを削除
}

/**
 * ファイル名を生成
 * @param title - ファイルのタイトル
 * @returns yyyy-mm-dd-hh-mm-ss-{title}.md 形式のファイル名
 */
export function generateFilename(title: string): string {
  const datePrefix = generateDatePrefix();
  const kebabTitle = toKebabCase(title);

  return `${datePrefix}-${kebabTitle}.md`;
}
