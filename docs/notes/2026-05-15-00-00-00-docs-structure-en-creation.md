---
tags: [docs-structure, docs-structure-en, english, pattern, i18n]
---

# docs-structure-en 作成記録

**作成日**: 2026-05-15
**関連タスク**: docs-structure の英語版パターン新規作成

## 背景

docs-structure（日本語）の英語版 `docs-structure-en` を作成したいという要望。

**動機**:
- 完全英語で動くか試したい
- 英語はトークン数が少なく LLM の事前学習データとも相性がよいため、日本語版より効率的に動作すると期待
- `npx degit` で `docs-structure-en` を取得して使えるようにしたい

## 設計判断

### ファイル構成は日本語版と完全に同じ

```
patterns/docs-structure-en/
├── VERSION
├── CHANGELOG.md
├── README.md
├── GUIDE.md
├── examples/
│   ├── README.md
│   ├── 01_example-letter.md
│   ├── 02_example-note.md
│   └── 03_example-task.md
├── migration/
│   ├── README.md
│   └── MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md
└── templates/
    ├── README.md
    ├── actions/ (14ファイル)
    ├── letters/
    ├── notes/
    └── tasks/
```

全30ファイル。`patterns/docs-structure/` との1:1対応。

### degit パスは `docs-structure-en` を向くよう変更

README の one-shot prompt:
```
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure-en/templates ./docs
```

### 言語設定の英語化

`00_session_end.md` の完了通知テンプレート:
- 日本語版: 「以降は日本語のセッションで進めます。」
- 英語版: 「Continue this session in English.」

`doc_letter.md` の完了通知テンプレート:
- 日本語版: 「...を日本語で。」
- 英語版: 「...in English.」

### 用語の英訳対応

| 日本語 | 英語 |
|--------|------|
| 申し送り | handoff / session handoff |
| 開発ノート | dev note |
| タスク | task |
| アクション | action |
| 機密情報 | secrets / sensitive data |
| 小分けの原則 | one-file-one-insight principle |
| 空気感 | vibe |

### `patterns/setup-pattern/` 等の外部ファイルは変更しない

今回のスコープは `patterns/docs-structure-en/` の中身のみ。
外側の参照（setup-pattern/README.md 等）は別セッションで対応。

## 学び

- 英語版は日本語版よりファイルによっては明らかに短くなる（トークン節約に直結）
- 構造・意図はそのまま保ちつつ英語に翻訳することで、LLM の理解精度向上が期待できる
- `@` 参照やアクションパターンは言語非依存なので、英語版でもそのまま動作するはず

## 今後の改善案

- 実際に英語版を別プロジェクトに degit して動作検証
- フィードバックを元に文言調整
- `patterns/setup-pattern/README.md` に `docs-structure-en` エントリを追加

---

**最終更新**: 2026-05-15
**作成者**: Claude
