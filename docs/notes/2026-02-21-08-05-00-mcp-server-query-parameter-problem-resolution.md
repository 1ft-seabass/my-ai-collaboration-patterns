---
tags: [mcp, typescript, debugging, api-migration, docs-structure]
---

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-02-21
**関連タスク**: docs-structure MCP サーバーの query パラメータ問題解決

## 問題

docs-structure MCP サーバーで `search_docs_content` ツールを呼び出すと、`query` パラメータが `undefined` で渡され、検索が正常に動作しない問題が発生していた。

**現象**:
```
search_docs_content tool called {"args":{"signal":{},"_meta":{...},"requestId":3}}
grepContent called {"docsPath":"/path/to/docs","scope":"all",...}
Running grep command {"cmd":"grep -rn \"undefined\" ..."}
```

前セッションで JSON Schema から zod スキーマに変更したが、検証前にセッション終了となり、問題が未解決のまま引き継がれた。

## 試行錯誤

### アプローチA: zod スキーマのまま検証
**試したこと**: 前セッションで変更した zod スキーマ（`z.object({...})`）で動作確認

**結果**: 失敗

**理由**:
- MCP サーバー再起動後もパラメータが渡されない
- ログに `query` フィールドが含まれていない
- 根本的な問題が別にあることが判明

---

### アプローチB: inputSchema の形式を変更
**試したこと**: `z.object({...})` からプロパティオブジェクト形式 `{ prop: z.type() }` に変更

```typescript
// ❌ 変更前
export const searchDocsContentInputSchema = z.object({
  query: z.string().describe("検索文字列"),
  scope: z.enum(["notes", "letters", "tasks", "all"]).optional().default("all"),
});

// ✅ 変更後
export const searchDocsContentInputSchema = {
  query: z.string().describe("検索文字列"),
  scope: z.enum(["notes", "letters", "tasks", "all"]).optional().default("all").describe("検索範囲"),
};
```

**結果**: 部分的に改善（しかし完全には解決せず）

**理由**: inputSchema の形式は正しくなったが、`server.tool()` API 自体がレガシーだった

---

### アプローチC: server.registerTool() への移行（成功）
**試したこと**: 参考記事（1ft-seabass.jp）を発見し、`server.tool()` から `server.registerTool()` へ移行

**参考記事**: [2025 年 9 月時点 tsx でより手軽に TypeScript な MCP サーバーを動かすメモ](https://www.1ft-seabass.jp/memo/2025/09/10/mcp-server-with-tsx-2025-09/)

**結果**: 成功

**コード例**:
```typescript
// ❌ レガシー API
server.tool(
  toolDefinition.name,
  toolDefinition.description,
  toolDefinition.inputSchema,
  handler
);

// ✅ 新しい API
server.registerTool(
  toolDefinition.name,
  {
    description: toolDefinition.description,
    inputSchema: toolDefinition.inputSchema,
  },
  handler
);
```

**動作確認結果**:
```
search_docs_content tool called {"args":{"query":"actions","scope":"all"}}
searchDocsContentToolHandler called {"query":"actions","scope":"all","docsPath":"..."}
grepContent completed {"resultCount":271}
```

正しく `query` パラメータが渡され、検索が成功した。

## 解決策

最終的な実装方法

**実装場所**:
- `patterns/setup-pattern/docs-structure-mcp-server/src/index.ts`: 全7ツールの登録を `server.registerTool()` に変更
- `patterns/setup-pattern/docs-structure-mcp-server/src/tools/*.ts`: inputSchema をプロパティオブジェクト形式に変更

**主なポイント**:
1. **API の移行**: `server.tool()` → `server.registerTool()`
2. **引数形式の変更**: 第2引数をオブジェクト `{ description, inputSchema }` に変更
3. **inputSchema の形式**: `z.object({...})` ではなく `{ prop: z.type() }` を使用
4. **全ツールの一括修正**: help, prepare_note, prepare_task, prepare_letter, list_letters, search_docs_titles, search_docs_content の7ツール全て

## 学び

この経験から得た知見

- **学び1**: MCP SDK のバージョンや API は進化している。公式ドキュメントだけでなく、最新の実例（ブログ記事など）も参考にすべき
- **学び2**: 実装依頼書がレガシーコードだった場合、動作確認で早期に発見することが重要
- **学び3**: `server.tool()` は古い API で、`server.registerTool()` が正しい。第2引数の形式も異なる
- **学び4**: Zod スキーマは `z.object()` でラップせず、プロパティオブジェクト形式で直接渡す

## 今後の改善案

- MCP SDK のバージョンアップ時は、breaking changes を確認する
- 実装依頼書に「最終更新日」と「SDK バージョン」を明記する
- 動作確認を実装の各段階で行い、問題を早期発見する

## 関連ドキュメント

- [前回のノート](./2026-02-21-14-30-00-docs-structure-mcp-server-implementation.md)
- [前回の申し送り](../letters/2026-02-21-14-45-00-docs-structure-mcp-server-partial-implementation.md)
- [参考記事: tsx でより手軽に TypeScript な MCP サーバーを動かすメモ](https://www.1ft-seabass.jp/memo/2025/09/10/mcp-server-with-tsx-2025-09/)

---

**最終更新**: 2026-02-21
**作成者**: Claude Sonnet 4.5
