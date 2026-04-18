---
tags: [for-branch-init, degit, setup-pattern, template, docs-structure]
---

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない

**作成日**: 2026-04-18
**関連タスク**: for_branch_init.md 手順2.5 cp → npx degit 変更

## 問題

`for_branch_init.md` の手順2.5 で、ブランチ専用ディレクトリへの TEMPLATE.md 取得に `cp` を使っていた。

```bash
# 旧: ローカルからコピー
[ -f "docs/${dir}/TEMPLATE.md" ] && cp "docs/${dir}/TEMPLATE.md" "docs/${BRANCH}/${dir}/TEMPLATE.md"
```

この方式の問題:

| 状況 | cp の結果 |
|------|----------|
| 自分のプロジェクト（degit 直後） | OK |
| 他人のプロジェクト（docs 自作） | TEMPLATE.md がない → スキップ（取得されない） |
| 他人のプロジェクト（カスタム済み） | 意図しないものがコピーされる |

`for_branch_init.md` は「他人のプロジェクトでも使える汎用ツール」を目指しているため、ローカルの docs 状態に依存する cp は不適切だった。

## 解決策

```bash
# 新: 公式テンプレートを degit で取得
BRANCH=$(git branch --show-current)
for dir in notes letters tasks; do
  npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure/templates/${dir} "docs/${BRANCH}/${dir}" --force
done
```

degit を使うことで:
- ローカルの docs 状態に依存しない
- 常に公式テンプレート（README.md + TEMPLATE.md）が取得される
- `--force` で既存ディレクトリへの展開も安全に行える

TEMPLATE.md のパス書き換え処理（node スクリプト）はそのまま維持。degit で取得した TEMPLATE.md に対して書き換えが走るため、問題なく機能する。

## 変更ファイル

- `patterns/setup-pattern/docs-structure-for-branch/for_branch_init.md`
  - 手順2.5 の理解チェック文言: 「cp」→「npx degit で取得」
  - 手順2.5 のコマンド: cp ループ → degit ループ
  - 完了通知文言: 「コピー・書き換え」→「取得・書き換え」
- `patterns/setup-pattern/docs-structure-for-branch/README.md`
  - シェルスクリプト例の同箇所を同様に更新

## 学び

- **「ローカル依存の cp は汎用ツールに向かない」**: 自分専用なら問題ないが、他人が使う前提のテンプレートでは外部から取得する方が安定
- **TEMPLATE.md は degit 後も書き換え処理が必要**: パス (`docs/notes/` → `docs/${branch}/notes/`) の書き換えは degit 取得後も変わらず必要。セットをそのまま維持できた

## 関連ドキュメント

- `patterns/setup-pattern/docs-structure-for-branch/for_branch_init.md`
- `patterns/setup-pattern/docs-structure-for-branch/README.md`
- `docs/notes/2026-04-17-00-00-03-docs-structure-for-branch-design.md`（前回の設計判断ノート）

---

**最終更新**: 2026-04-18
**作成者**: Claude
