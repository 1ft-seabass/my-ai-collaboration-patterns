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
import { guideSessionEndToolDefinition, guideSessionEndToolHandler } from "./tools/guide-session-end.js";
import { guideNoteCreationToolDefinition, guideNoteCreationToolHandler } from "./tools/guide-note-creation.js";
import { guideLetterCreationToolDefinition, guideLetterCreationToolHandler } from "./tools/guide-letter-creation.js";
import { guideTaskCreationToolDefinition, guideTaskCreationToolHandler } from "./tools/guide-task-creation.js";
import { guideNoteAndCommitToolDefinition, guideNoteAndCommitToolHandler } from "./tools/guide-note-and-commit.js";
import { guideGitCommitToolDefinition, guideGitCommitToolHandler } from "./tools/guide-git-commit.js";
import { guideGitPushToolDefinition, guideGitPushToolHandler } from "./tools/guide-git-push.js";
import { listLettersToolDefinition, listLettersToolHandler } from "./tools/list-letters.js";
import { searchDocsTitlesToolDefinition, searchDocsTitlesToolHandler } from "./tools/search-docs-titles.js";
import { searchDocsContentToolDefinition, searchDocsContentToolHandler } from "./tools/search-docs-content.js";

const server = new McpServer({
  name: "docs-structure",
  version: "0.1.0",
});

// help ツール登録
server.registerTool(
  helpToolDefinition.name,
  {
    description: helpToolDefinition.description,
    inputSchema: helpToolDefinition.inputSchema,
  },
  helpToolHandler
);

// guide_session_end ツール登録
server.registerTool(
  guideSessionEndToolDefinition.name,
  {
    description: guideSessionEndToolDefinition.description,
    inputSchema: guideSessionEndToolDefinition.inputSchema,
  },
  async (args: any) => guideSessionEndToolHandler(args, resolvedDocsPath)
);

// guide_note_creation ツール登録
server.registerTool(
  guideNoteCreationToolDefinition.name,
  {
    description: guideNoteCreationToolDefinition.description,
    inputSchema: guideNoteCreationToolDefinition.inputSchema,
  },
  async (args: any) => guideNoteCreationToolHandler(args, resolvedDocsPath)
);

// guide_letter_creation ツール登録
server.registerTool(
  guideLetterCreationToolDefinition.name,
  {
    description: guideLetterCreationToolDefinition.description,
    inputSchema: guideLetterCreationToolDefinition.inputSchema,
  },
  async (args: any) => guideLetterCreationToolHandler(args, resolvedDocsPath)
);

// guide_task_creation ツール登録
server.registerTool(
  guideTaskCreationToolDefinition.name,
  {
    description: guideTaskCreationToolDefinition.description,
    inputSchema: guideTaskCreationToolDefinition.inputSchema,
  },
  async (args: any) => guideTaskCreationToolHandler(args, resolvedDocsPath)
);

// guide_note_and_commit ツール登録
server.registerTool(
  guideNoteAndCommitToolDefinition.name,
  {
    description: guideNoteAndCommitToolDefinition.description,
    inputSchema: guideNoteAndCommitToolDefinition.inputSchema,
  },
  async (args: any) => guideNoteAndCommitToolHandler(args, resolvedDocsPath)
);

// guide_git_commit ツール登録
server.registerTool(
  guideGitCommitToolDefinition.name,
  {
    description: guideGitCommitToolDefinition.description,
    inputSchema: guideGitCommitToolDefinition.inputSchema,
  },
  async (args: any) => guideGitCommitToolHandler(args, resolvedDocsPath)
);

// guide_git_push ツール登録
server.registerTool(
  guideGitPushToolDefinition.name,
  {
    description: guideGitPushToolDefinition.description,
    inputSchema: guideGitPushToolDefinition.inputSchema,
  },
  async (args: any) => guideGitPushToolHandler(args, resolvedDocsPath)
);

// list_letters ツール登録
server.registerTool(
  listLettersToolDefinition.name,
  {
    description: listLettersToolDefinition.description,
    inputSchema: listLettersToolDefinition.inputSchema,
  },
  async (args: any) => listLettersToolHandler(args, resolvedDocsPath)
);

// search_docs_titles ツール登録
server.registerTool(
  searchDocsTitlesToolDefinition.name,
  {
    description: searchDocsTitlesToolDefinition.description,
    inputSchema: searchDocsTitlesToolDefinition.inputSchema,
  },
  async (args: any) => searchDocsTitlesToolHandler(args, resolvedDocsPath)
);

// search_docs_content ツール登録
server.registerTool(
  searchDocsContentToolDefinition.name,
  {
    description: searchDocsContentToolDefinition.description,
    inputSchema: searchDocsContentToolDefinition.inputSchema,
  },
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
