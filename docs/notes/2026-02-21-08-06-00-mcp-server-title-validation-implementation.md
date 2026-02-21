---
tags: [mcp, naming-convention, validation, i18n, docs-structure]
---

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-02-21
**関連タスク**: MCP サーバーのタイトル命名規則の厳格化

## 問題

`prepare_note` ツールで日本語タイトルを渡すと、ファイル名がそのまま日本語になってしまう問題が発生した。

**現象**:
```
入力: "MCP動作確認テスト"
出力: 2026-02-21-07-31-39-MCP動作確認テスト.md
```

プロジェクトの既存ノートは全て英語のケバブケース形式（例: `2026-01-31-10-00-00-api-authentication-debug.md`）であり、命名規則に一貫性がなくなる。

**原因**:
`naming.ts` の `toKebabCase()` 関数が、日本語文字を検出すると「そのまま返す」実装になっていた。これは当初の設計意図だったが、実際のプロジェクトの命名規則とは異なっていた。

```typescript
// 問題のあった実装
if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(title)) {
  return title; // 日本語をそのまま返す
}
```

## 試行錯誤

### アプローチA: ローマ字変換ライブラリの導入
**試したこと**: 日本語をローマ字に自動変換するライブラリを検討

**結果**: 採用せず

**理由**:
- 外部ライブラリの依存を増やしたくない
- ローマ字変換の品質（読みの曖昧性）に懸念
- AI が英訳する方が自然で意味が伝わりやすい

---

### アプローチB: ユーザーに英語タイトルを要求
**試したこと**: 日本語が含まれている場合はエラーをスローし、AI が英訳してから再実行する仕組み

**結果**: 成功

**コード例**:
```typescript
export function toKebabCase(title: string): string {
  // 日本語文字が含まれている場合はエラー
  if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(title)) {
    throw new Error('タイトルに日本語が含まれています。英数字のみで指定してください。');
  }

  // アルファベットの場合: ケバブケース変換
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
```

**動作フロー**:
1. ユーザーが日本語タイトルでノート作成を依頼
2. AI が `prepare_note` に日本語タイトルを渡す
3. MCP サーバーがエラーを返す（「タイトルに日本語が含まれています」）
4. AI がエラーを受け取り、タイトルを英訳
5. AI が英語タイトルで `prepare_note` を再実行
6. 成功

## 解決策

最終的な実装方法

**実装場所**:
- `patterns/setup-pattern/docs-structure-mcp-server/src/utils/naming.ts:35-39`: エラースロー処理を追加
- `patterns/setup-pattern/docs-structure-mcp-server/src/tools/prepare-note.ts:15,20`: description と inputSchema に制約を明記
- `patterns/setup-pattern/docs-structure-mcp-server/src/tools/prepare-task.ts:14,20`: 同上
- `patterns/setup-pattern/docs-structure-mcp-server/src/tools/prepare-letter.ts:15,21`: 同上

**主なポイント**:
1. **バリデーション**: 日本語文字を検出したら即座にエラーをスロー
2. **明示的な制約**: description に「英数字のみ」を明記
3. **AI へのヒント**: inputSchema の describe に「日本語タイトルの場合は英訳してから渡すこと」と記載
4. **一貫性**: prepare_note, prepare_task, prepare_letter の3ツール全てに適用

**ツール description の例**:
```typescript
description: "「ノートを作りたい」「知見を記録したい」「試行錯誤をまとめたい」ときに使う。テンプレートとファイル名を生成して返す。実際のファイル作成はユーザー側で行う。注意: タイトルは英数字のみで指定すること（日本語タイトルの場合は英訳が必要）。"
```

## 学び

この経験から得た知見

- **学び1**: 命名規則は早期に厳格化すべき。一度混在すると統一が困難になる
- **学び2**: AI が自然に英訳するフローを確立すれば、ユーザー体験を損なわずに制約を守れる
- **学び3**: エラーメッセージは具体的に（「英数字のみで指定してください」と明示）
- **学び4**: MCP ツールの description は AI の振る舞いを制御する重要な要素

## 今後の改善案

- `prepare_task` の動作確認（今回は未実施）
- エラーメッセージの多言語対応（英語版も追加）
- 既存の日本語ファイル名があれば、マイグレーションスクリプトを検討

## 関連ドキュメント

- [query パラメータ問題の解決ノート](./2026-02-21-08-05-00-mcp-server-query-parameter-problem-resolution.md)
- [前回の申し送り](../letters/2026-02-21-14-45-00-docs-structure-mcp-server-partial-implementation.md)

---

**最終更新**: 2026-02-21
**作成者**: Claude Sonnet 4.5
