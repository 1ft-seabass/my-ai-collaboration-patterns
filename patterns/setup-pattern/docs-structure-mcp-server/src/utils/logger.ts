/**
 * シンプルなファイルロガー
 */

import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logPath = join(__dirname, "..", "..", "mcp-server.log");

export function log(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  appendFileSync(logPath, `[${timestamp}] ${message}${dataStr}\n`);
}
