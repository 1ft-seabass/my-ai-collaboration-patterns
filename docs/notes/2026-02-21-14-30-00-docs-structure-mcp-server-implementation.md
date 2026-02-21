---
tags: [mcp, docs-structure, typescript, mcp-sdk, zod]
---

# docs-structure MCP サーバー基盤実装 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-02-21
**関連タスク**: docs-structure MCP サーバー実装依頼（03-oneshot-mcp-setup.md）

## 問題

docs-structure パターンを使ったプロジェクトで、AI エージェントとの協働時に以下の課題があった:

1. **トークン消費が大きい**: テンプレート全文 + ガイド + アクションファイルを毎回読み込む
2. **手順の冗長性**: 「テンプレートを読んで、ファイル名を生成して...」という手順を自然言語で指示
3. **一貫性の担保**: 命名規則やテンプレート参照先を AI が毎回解釈

MCP サーバー化により、これらを TypeScript の固定ロジックに移行し、AI は「段取り済みの材料」を受け取るだけで作業可能にする。

## 実装内容

### 基盤実装（コミット1: 85f1ab2）

**プロジェクト構造**:
```
docs-structure-mcp-server/
├── package.json              # MCP SDK, zod, dotenv
├── tsconfig.json
├── .env.example
├── .mcp.json.example
└── src/
    ├── types.ts              # 共通型定義
    └── utils/
        ├── naming.ts         # ファイル名生成（日時接頭語 + ケバブケース）
        ├── template.ts       # テンプレート読み込み（ガイド除去）
        ├── search.ts         # grep ラッパー、ファイル探索
        └── logger.ts         # シンプルなファイルロガー
```

**設計方針**:
1. **DOCS_PATH の解決**: MCP サーバー内の `.env` に絶対パスを記載（自己完結）
2. **テンプレート読み込み**: `{DOCS_PATH}/{type}/TEMPLATE.md` から読み込み、ガイド部分を除去
3. **命名規則**: `yyyy-mm-dd-hh-mm-ss-{title}.md` 形式を自動生成

### 7ツール実装（コミット2: 2ff5f64）

| ツール名 | 説明 | inputSchema |
|---------|------|-------------|
| `help` | 使い方とバージョン表示 | なし |
| `prepare_note` | ノート作成の段取り | `title` |
| `prepare_task` | タスク作成の段取り | `title`, `priority?` |
| `prepare_letter` | 申し送り作成の段取り | `title`, `recent_notes_count?` |
| `list_letters` | 申し送り一覧取得 | `count?` |
| `search_docs_titles` | タイトル検索 | `query`, `scope?` |
| `search_docs_content` | 全文検索（grep） | `query`, `scope?` |

**実装場所**: `patterns/setup-patterns/docs-structure-mcp-server/src/tools/*`

### ログ機能の追加

**実装**: `src/utils/logger.ts`
- `mcp-server.log` に追記形式で出力
- タイムスタンプ付き
- デバッグ時の動作確認に使用

## 試行錯誤

### アプローチA: JSON Schema 形式の inputSchema

**試したこと**: MCP SDK の `server.tool()` で JSON Schema 形式を使用

```typescript
inputSchema: {
  type: "object" as const,
  properties: {
    query: { type: "string" as const, description: "検索文字列" },
    scope: { type: "string" as const, enum: ["notes", "letters", "tasks", "all"] }
  },
  required: ["query"],
}
```

**結果**: 失敗

**理由**: ログで確認すると `args` に `query` が含まれず、`undefined` で grep が実行されていた。MCP SDK は zod スキーマを期待している可能性が高い。

---

### アプローチB: zod スキーマへの変更

**試したこと**: すべてのツールの inputSchema を zod スキーマに変更

```typescript
export const searchDocsContentInputSchema = z.object({
  query: z.string().describe("検索文字列"),
  scope: z.enum(["notes", "letters", "tasks", "all"]).optional().default("all").describe("検索範囲"),
});

export const searchDocsContentToolDefinition = {
  name: "search_docs_content",
  description: "...",
  inputSchema: searchDocsContentInputSchema,
};
```

**結果**: セッション終了時点では未検証

**理由**: zod スキーマに変更後、再起動してテストする時間がなかった。次セッションで検証が必要。

## 既知の問題

### query パラメータが undefined で渡される

**現象**:
- `search_docs_content` を呼び出すと、結果が空配列で返る
- ログで確認すると `query` が `undefined`

**ログ出力**:
```
search_docs_content tool called {"args":{"signal":{},"_meta":{...},"requestId":3}}
grepContent called {"docsPath":"/path/to/docs","scope":"all","scopePaths":[...]}
Running grep command {"cmd":"grep -rn \"undefined\" ..."}
```

**調査結果**:
- JSON Schema 形式では MCP クライアントがパラメータを正しく渡していない
- zod スキーマへの変更を実施したが、検証前にセッション終了

**次のアクション**:
1. MCP サーバーを再起動
2. `search_docs_content` で "actions" を検索
3. ログで `query` が正しく渡されているか確認

## 学び

### 1. MCP サーバーの開発フロー

- **help ツールで開発サイクルを確立**: コード変更 → 再起動 → 反映確認
- **ログファイルの重要性**: stdio 経由のため、ファイルログがないとデバッグが困難
- **シンプルなロガーで十分**: 余計なライブラリを避け、`fs.appendFileSync` で実装

### 2. 閉じた仕様の設計

- **プロジェクトルートに依存しない**: MCP サーバー内の `.env` に絶対パスを記載
- **自己完結**: プロジェクト側に `.env` や設定ファイルを要求しない
- **透明性**: テンプレートは .md ファイルから読む（TypeScript に埋め込まない）

### 3. MCP SDK の仕様理解

- **inputSchema は zod スキーマを期待**: JSON Schema 形式では動作しない可能性
- **args の構造**: `signal`, `_meta`, `requestId` などが含まれる
- **型安全性**: zod スキーマを使うことで、ランタイムでのバリデーションも可能

## 今後の改善案

### 優先度: 高

1. **query パラメータ問題の解決**
   - zod スキーマで正しく動作するか検証
   - MCP SDK のドキュメント・サンプルコードを確認
   - 必要に応じて SDK のバージョンアップ

2. **全ツールの動作確認**
   - `prepare_note`, `prepare_task`, `prepare_letter` の実行テスト
   - テンプレート読み込みが正しく動作するか
   - ファイル名生成が命名規則に従っているか

### 優先度: 中

3. **エラーハンドリングの強化**
   - TEMPLATE.md が存在しない場合のエラーメッセージ改善
   - grep の失敗時の詳細なエラー情報

4. **README の充実**
   - トークン削減の実測値を追加
   - インストール手順の詳細化
   - トラブルシューティングセクション

### 優先度: 低

5. **setup.js の実装**（後続チケット）
   - npm install 自動化
   - .env 生成（絶対パス自動設定）
   - .mcp.json エントリ追加

## 関連ドキュメント

- [実装依頼書](../../../patterns/setup-patterns/docs-structure-mcp-server/03-oneshot-mcp-setup.md)
- [README](../../../patterns/setup-patterns/docs-structure-mcp-server/README.md)
- [開発 TODO](../../../patterns/setup-patterns/docs-structure-mcp-server/TODO.md)

---

**最終更新**: 2026-02-21
**作成者**: Claude Sonnet 4.5
