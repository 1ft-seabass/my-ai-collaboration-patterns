---
tags: [mcp, typescript, implementation, docs-structure, guide-tools]
---

# MCP Guide ツール実装 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-02-21
**関連タスク**: docs-structure MCP サーバーに actions/*.md を統合

## 問題

docs-structure MCP サーバーに既存の `prepare_note`, `prepare_letter`, `prepare_task` があったが、以下の課題があった：

1. **actions/*.md の手順書が別ファイルで管理されている**
   - ユーザーが `@actions/00_session_end.md` のようにファイルパスを指定する必要がある
   - Claude が自発的に actions を見つけられない

2. **prepare 系は TEMPLATE.md を返すだけ**
   - actions/*.md の詳細な手順（理解チェック、承認フロー）が含まれていない
   - ファイル名生成と TEMPLATE 読み込みしかしていない

3. **「脳内インデックス」の負荷**
   - ユーザーが「セッション終了 → actions/00_session_end.md」という対応関係を覚えている必要がある

## 試行錯誤

### アプローチA: prepare 系を拡張して actions を返す

**試したこと**: 既存の prepare_note に actions/doc_note.md を含める

**結果**: 設計方針として却下

**理由**:
- prepare という命名が不適切（ガイド全体を返すのに「準備」は語弊がある）
- actions/*.md を返すなら guide という命名の方が適切

---

### アプローチB: actions 系ツールを全て MCP 化

**試したこと**: actions/*.md 全てに対応する MCP ツールを作成する案

**結果**: 部分的に採用（優先度高のみ）

**理由**:
- 優先度高（session_end, git_commit, git_push, note, letter, task）は価値がある
- 優先度中・低（dev_refactoring, dev_review など）はワンショット指定で十分
- ツール数が増えすぎると Claude の判断が汚れる

---

### アプローチC: guide 系ツールを実装（成功）

**試したこと**:
1. actions/*.md を読み込む汎用ヘルパー `action-loader.ts` を作成
2. 7つの guide 系ツールを実装
3. 既存の prepare 系を削除して guide 系に統合

**結果**: 成功

**コード例**:

```typescript
// src/utils/action-loader.ts
export async function loadActionGuide(docsPath: string, actionFileName: string): Promise<string> {
  const actionsPath = join(docsPath, '..', 'actions');
  const actionPath = join(actionsPath, actionFileName);
  return await readFile(actionPath, 'utf-8');
}

// src/tools/guide-session-end.ts
export async function guideSessionEndToolHandler(
  _input: Record<string, never>,
  docsPath: string
) {
  const actionGuide = await loadActionGuide(docsPath, "00_session_end.md");
  const recentNotes = await listMarkdownFiles(join(docsPath, "notes"));
  const recentLetters = await listMarkdownFiles(join(docsPath, "letters"));

  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        guide: actionGuide,
        recent_notes: recentNotes.slice(0, 10),
        recent_letters: recentLetters.slice(0, 2),
      }, null, 2),
    }],
  };
}
```

## 解決策

### 実装した7つのツール

1. **guide_session_end** - patterns/setup-pattern/docs-structure-mcp-server/src/tools/guide-session-end.ts:17
   - actions/00_session_end.md を返す
   - 直近10件のノート、2件の申し送り情報を含む

2. **guide_note_creation** - patterns/setup-pattern/docs-structure-mcp-server/src/tools/guide-note-creation.ts:17
   - actions/doc_note.md を返す
   - ファイル名自動生成、TEMPLATE.md を含む

3. **guide_letter_creation** - patterns/setup-pattern/docs-structure-mcp-server/src/tools/guide-letter-creation.ts:17
   - actions/doc_letter.md を返す
   - ファイル名自動生成、TEMPLATE.md、直近ノート/申し送り情報を含む

4. **guide_task_creation** - patterns/setup-pattern/docs-structure-mcp-server/src/tools/guide-task-creation.ts:17
   - TEMPLATE.md を返す（actions ファイルなし）
   - ファイル名自動生成、優先度パラメータ付き

5. **guide_note_and_commit** - patterns/setup-pattern/docs-structure-mcp-server/src/tools/guide-note-and-commit.ts:17
   - actions/doc_note_and_commit.md を返す
   - ノート作成 + コミットの手順

6. **guide_git_commit** - patterns/setup-pattern/docs-structure-mcp-server/src/tools/guide-git-commit.ts:12
   - actions/git_commit.md を返す

7. **guide_git_push** - patterns/setup-pattern/docs-structure-mcp-server/src/tools/guide-git-push.ts:12
   - actions/01_git_push.md を返す

### 主なポイント

1. **action-loader.ts で汎用化**
   - actions/*.md を読み込むヘルパー関数
   - 各ツールから共通で使用

2. **既存 prepare 系を削除**
   - prepare-note.ts, prepare-task.ts, prepare-letter.ts を削除
   - guide 系に統合して役割を明確化

3. **TypeScript 型定義の統一**
   - 全ツールで同じパターンの型定義
   - inputSchema, toolDefinition, toolHandler の3つ

4. **src/index.ts に全ツール登録**
   - server.registerTool() で7つのツールを登録
   - 型チェック完了（エラーなし）

## 学び

- **命名の重要性**: prepare → guide の変更で役割が明確になった
- **汎用ヘルパーの価値**: action-loader.ts により各ツールがシンプルになった
- **既存コードの削除判断**: prepare 系は思い切って削除し、guide 系に一本化
- **段階的実装**: 優先度高のみ実装し、残りはワンショット指定で対応

## 今後の改善案

- Claude が自発的に guide 系ツールを呼ぶか動作確認
- 必要に応じて description を改善（Claude のツール選択精度向上）
- 検索系ツールとの連携強化

## 関連ドキュメント

- [MCP サーバー query パラメータ問題解決](./2026-02-21-08-05-00-mcp-server-query-parameter-problem-resolution.md)
- [MCP サーバータイトル検証実装](./2026-02-21-08-06-00-mcp-server-title-validation-implementation.md)
- [申し送り: MCP サーバー実装完了](../letters/2026-02-21-08-21-00-mcp-server-implementation-complete.md)

---

**最終更新**: 2026-02-21
**作成者**: Claude Sonnet 4.5
