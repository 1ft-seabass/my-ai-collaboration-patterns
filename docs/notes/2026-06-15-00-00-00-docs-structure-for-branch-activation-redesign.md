---
tags: [docs-structure-for-branch, wizard, activation-prompt, docs-structure, branch]
---

# docs-structure-for-branch 発動プロンプト整理と Phase 0 追加

**作成日**: 2026-06-15
**関連タスク**: docs-structure-for-branch の運用改善

## 問題

運用してみて以下の2点が使いにくかった。

1. **発動方法が2ステップに分離していた**: degit で `for_branch_init.md` を取得 → `@for_branch_init.md` で発動、という2アクションが必要だった
2. **docs-structure 未導入のプロジェクトに使えなかった**: 「いつ使うか」に `docs-structure` 導入済み前提と書いてあり、他クライアントのプロジェクトに投入する際（多数派のユースケース）に手順が足りなかった

## ユースケースの整理

| シナリオ | 頻度 | 必要な作業 |
|---|---|---|
| 他クライアントのプロジェクトに投入 | 多数派 | docs-structure 導入 → ブランチ初期化 |
| 自分のプロジェクト（main に経緯システム済み）| 少数 | ブランチ初期化のみ |

## 解決策

### README.md: 発動プロンプトを1アクションに整理

**Before**: degit + copy + `@for_branch_init.md` の2ステップ

**After**: 以下を貼るだけ

```
まず以下のコマンドで手順書を取得してください：
npx degit ... tmp/docs-structure-for-branch --force

取得後、tmp/docs-structure-for-branch/for_branch_init.md を読んで指示に従ってください。
```

AI が degit を実行して for_branch_init.md を読み、そのまま実行まで行う。シェルスクリプト例は削除してプロンプト発動に注力。

### for_branch_init.md: Phase 0 を追加

`docs/actions/` の存在チェックで docs-structure の導入状況を判定。

- EXISTS → 手順1へ（ブランチ初期化のみ）
- NOT FOUND → `npx degit ... templates` で docs-structure を導入してから手順1へ

これにより両シナリオを1つのウィザードで吸収できる。

## 学び

- **README = 発動プロンプトに注力、for_branch_init.md = 実動ロジック**という役割分担を明確にすることで、二重管理を防げる
- 多数派のユースケース（他クライアント投入）を基準に設計すると、少数派（自プロジェクト）も Phase 0 のチェックで自然に吸収できる

## 関連ドキュメント

- [docs-structure-for-branch パターン](../../patterns/setup-pattern/docs-structure-for-branch/)
- [docs-structure パターン](../../patterns/docs-structure/)

---

**最終更新**: 2026-06-15
**作成者**: AI (Claude) + 人間レビュー
