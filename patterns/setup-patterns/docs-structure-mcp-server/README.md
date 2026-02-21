# docs-structure MCP Server

letters/notes/tasks の日常運用を支援する MCP サーバー。

## 思想と経緯

docs-structure パターンを導入したプロジェクトで、ノート・申し送り・タスクの作成を AI エージェントと協働する際、従来は以下の課題があった:

1. **トークン消費が大きい**: テンプレート全文 + ガイド + アクションファイルの説明を毎回読み込む
2. **手順の冗長性**: 「テンプレートを読んで、ファイル名を生成して、既存ファイルを探索して...」という手順を自然言語で指示
3. **一貫性の担保**: 命名規則やテンプレート参照先を AI が毎回解釈するため、ブレが発生する可能性

MCP サーバー化により、これらの処理を TypeScript の固定ロジックに移行し、AI は「段取り済みの材料」を受け取るだけで作業を開始できる。

### トークン削減の実測値

現行の自然言語版と MCP 版で、AI が消費するトークン量を実測比較:

- **ノート作成**: 5,393 bytes → ~1,800 bytes（約67%削減）
- **申し送り作成**: 11,242 bytes → ~6,000 bytes（約47%削減）

消えるもの:
- テンプレートのガイド部分（命名規則、使い方、検索方法）: 5,638 bytes
- アクションファイル全体（手順書、チェックリスト、完了通知フォーマット）: 12,119 bytes
- 合計: ~17,700 bytes が TypeScript ロジックに移行

これは毎セッション発生するコスト。ノート作成は1セッションで複数回あり得るため、20万トークン予算内での累積効果が大きい。

## インストール

### 前提条件

- Node.js (18 以上推奨)
- docs-structure パターンが導入済みのプロジェクト
- MCP 対応コーディングエージェント（Claude Code など）

### 手順

1. **MCP サーバーのセットアップ**

```bash
cd patterns/setup-patterns/docs-structure-mcp-server
npm install
```

2. **.env ファイルの作成**

```bash
cp .env.example .env
```

DOCS_PATH を必要に応じて編集:

```env
DOCS_PATH=./docs
```

3. **.mcp.json への登録**

プロジェクトルートに `.mcp.json` を作成（または既存ファイルに追記）:

```json
{
  "mcpServers": {
    "docs-structure": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/docs-structure-mcp-server/src/index.ts"]
    }
  }
}
```

絶対パスを正しく設定すること。

4. **コーディングエージェントの再起動**

MCP サーバーの変更を反映するため、Claude Code などを再起動。

## 利用可能なツール

### help

MCP サーバーの使い方とバージョンを表示。

### prepare_note

「ノートを作りたい」ときに使う。テンプレートとファイル名を生成して返す。

**パラメータ:**
- `title` (string, required): ノートのタイトル

**返却内容:**
- `filepath`: 生成されたファイルパス
- `template`: ガイド除去済みのテンプレート本文
- `existing_count`: 既存のノート数

### prepare_task

「タスクを記録したい」ときに使う。テンプレートとファイル名を生成して返す。

**パラメータ:**
- `title` (string, required): タスクのタイトル
- `priority` (enum, optional): 優先度 (`high`, `medium`, `low`。デフォルト: `medium`)

**返却内容:**
- `filepath`: 生成されたファイルパス
- `template`: ガイド除去済み・priority 反映済みのテンプレート本文

### prepare_letter

「申し送りを作りたい」ときに使う。テンプレートとファイル名を生成し、直近のノートと前回の申し送り情報も返す。

**パラメータ:**
- `title` (string, required): 申し送りのタイトル
- `recent_notes_count` (number, optional): 添える直近ノート数（デフォルト: 10）

**返却内容:**
- `filepath`: 生成されたファイルパス
- `template`: ガイド除去済みのテンプレート本文
- `recent_notes`: 直近 N 件のノート情報（ファイルパス + タイトル）
- `recent_letters`: 直近 2 件の申し送り情報（ファイルパス + タイトル）

### list_letters

「最新の申し送りを読みたい」ときに使う。指定件数分の申し送りファイル情報を返す。

**パラメータ:**
- `count` (number, optional): 取得件数（1-10、デフォルト: 1）

**返却内容:**
- `letters`: 申し送りの配列（ファイルパス、タイトル、tags、作成日時）

### search_docs_titles

ノートや申し送りをタイトルで探したいときに使う。ファイル名と冒頭の見出しを検索する。

**パラメータ:**
- `query` (string, required): 検索文字列
- `scope` (enum, optional): 検索範囲 (`notes`, `letters`, `tasks`, `all`。デフォルト: `all`)

**返却内容:**
- `results`: マッチしたファイルの配列（ファイルパス + タイトル、最大20件）

### search_docs_content

ノートや申し送りの中身を全文検索したいときに使う。タグ検索もこれで対応できる。

**パラメータ:**
- `query` (string, required): 検索文字列
- `scope` (enum, optional): 検索範囲 (`notes`, `letters`, `tasks`, `all`。デフォルト: `all`)

**返却内容:**
- `results`: マッチした行の配列（ファイルパス、行番号、マッチ行、最大30件）

## 使用例

### ノート作成

```
AI: 「ノートを作りたい。タイトルは mcp-server-first-test」
```

→ `prepare_note` が呼ばれて、ファイルパスとテンプレートが返る。
→ AI がそのテンプレートを使ってファイルを作成。

### 申し送り作成

```
AI: 「今日のセッションの申し送りを作りたい」
```

→ `prepare_letter` が呼ばれて、テンプレート + 直近のノート一覧 + 前回の申し送り情報が返る。
→ AI が context を踏まえて申し送りを作成。

### タイトル検索

```
AI: 「MCP に関するノートを探したい」
```

→ `search_docs_titles` (query: "MCP") が呼ばれて、タイトルに MCP が含まれるファイルが返る。

## 仕組み

### DOCS_PATH の解決

- MCP サーバー側の `.env` で `DOCS_PATH` を設定（デフォルト: `./docs`）
- `process.cwd()` ベースで解決（コーディングエージェントの作業ディレクトリ = プロジェクトルート）
- MCP クライアント側の env フィールドは使わない

### テンプレート読み込み

- `{DOCS_PATH}/{type}/TEMPLATE.md` から読み込む
- テンプレート使用ガイドと実際のテンプレート内容を区切るマーカー行（`<!-- ====...`）を検出
- マーカー行以降のみを返す（ガイド部分を除去）

### 命名規則

- ファイル名: `yyyy-mm-dd-hh-mm-ss-{title}.md`
- 日時: MCP サーバーのローカル時刻
- title: アルファベットの場合はケバブケース変換、日本語はそのまま

### 探索とソート

- ファイル名の日時接頭語に基づいて降順ソート
- TEMPLATE.md と README.md は検索・一覧から除外

## ライセンス

MIT

## 今後の拡張（後続チケット）

- setup.js（ブートストラップスクリプト）
  - npm install 自動化
  - .env 生成
  - .mcp.json エントリ追加
  - ワンショット導入フロー確立
