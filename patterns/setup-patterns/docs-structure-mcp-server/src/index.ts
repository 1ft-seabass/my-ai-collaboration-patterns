#!/usr/bin/env node
/**
 * docs-structure MCP サーバー
 *
 * letters/notes/tasks の日常運用を支援する MCP サーバー
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// .env を MCP サーバーのディレクトリから読む
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "..", ".env");
dotenv.config({ path: envPath });

// DOCS_PATH は絶対パスで指定される（MCP サーバー内の .env で設定）
const resolvedDocsPath = process.env.DOCS_PATH || "/home/node/workspace/repos/my-ai-collaboration-patterns/docs";

// ユーティリティのインポート
import { log } from "./utils/logger.js";

// ツールハンドラーのインポート
import { helpToolDefinition, helpToolHandler } from "./tools/help.js";
import { prepareNoteToolDefinition, prepareNoteToolHandler } from "./tools/prepare-note.js";
import { prepareTaskToolDefinition, prepareTaskToolHandler } from "./tools/prepare-task.js";
import { prepareLetterToolDefinition, prepareLetterToolHandler } from "./tools/prepare-letter.js";
import { listLettersToolDefinition, listLettersToolHandler } from "./tools/list-letters.js";
import { searchDocsTitlesToolDefinition, searchDocsTitlesToolHandler } from "./tools/search-docs-titles.js";
import { searchDocsContentToolDefinition, searchDocsContentToolHandler } from "./tools/search-docs-content.js";

const server = new McpServer({
  name: "docs-structure",
  version: "0.1.0",
});

// help ツール登録
server.tool(
  helpToolDefinition.name,
  helpToolDefinition.description,
  helpToolDefinition.inputSchema,
  helpToolHandler
);

// prepare_note ツール登録
server.tool(
  prepareNoteToolDefinition.name,
  prepareNoteToolDefinition.description,
  prepareNoteToolDefinition.inputSchema,
  async (args: any) => prepareNoteToolHandler(args, resolvedDocsPath)
);

// prepare_task ツール登録
server.tool(
  prepareTaskToolDefinition.name,
  prepareTaskToolDefinition.description,
  prepareTaskToolDefinition.inputSchema,
  async (args: any) => prepareTaskToolHandler(args, resolvedDocsPath)
);

// prepare_letter ツール登録
server.tool(
  prepareLetterToolDefinition.name,
  prepareLetterToolDefinition.description,
  prepareLetterToolDefinition.inputSchema,
  async (args: any) => prepareLetterToolHandler(args, resolvedDocsPath)
);

// list_letters ツール登録
server.tool(
  listLettersToolDefinition.name,
  listLettersToolDefinition.description,
  listLettersToolDefinition.inputSchema,
  async (args: any) => listLettersToolHandler(args, resolvedDocsPath)
);

// search_docs_titles ツール登録
server.tool(
  searchDocsTitlesToolDefinition.name,
  searchDocsTitlesToolDefinition.description,
  searchDocsTitlesToolDefinition.inputSchema,
  async (args: any) => searchDocsTitlesToolHandler(args, resolvedDocsPath)
);

// search_docs_content ツール登録
server.tool(
  searchDocsContentToolDefinition.name,
  searchDocsContentToolDefinition.description,
  searchDocsContentToolDefinition.inputSchema,
  async (args: any) => {
    log('search_docs_content tool called', { args });
    return searchDocsContentToolHandler(args, resolvedDocsPath);
  }
);

// サーバー起動
log('MCP server starting', { resolvedDocsPath });

const transport = new StdioServerTransport();
await server.connect(transport);

log('MCP server connected');
console.error("docs-structure MCP server running on stdio");
console.error(`DOCS_PATH: ${resolvedDocsPath}`);
