---
tags: [docs-structure, for-branch-init, setup-pattern, design-decision, branch-workflow]
---

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない

**作成日**: 2026-04-17
**関連タスク**: docs-structure-for-branch 新設・for_branch_init.md 再設計

## 問題

`for_branch_init.md` が `docs/actions/` に置かれていたが、立ち位置が曖昧だった。

- action ファイルだが呼ぶのは1回限り（初期化後は役割が終わる）
- `patterns/docs-structure/templates/actions/` にも複製があり同期コストが発生
- 実際に使ってみると手順の抜け（TEMPLATE.md コピー・パス書き換え、`check_my_security_prepare_level.md` 未対応）が発覚

また、元の `docs/notes/` 等をどう扱うか（削除・移動・残す）で設計判断が必要だった。

## 設計判断

### 配置先: setup-pattern 配下に移動

`patterns/setup-pattern/docs-structure-for-branch/` に新設。

- `for_branch_init.md` はブランチ初期化の「0手順目」であり、ongoing action ではない
- setup-pattern は「一回限りの初期化セットアップ」の家
- `docs-structure` からはリンクで参照するだけ（混ざらない）
- 廃止した `docs-structure-for-target-branch-only/` との違い：あちらは docs-structure の複製で同期コストが問題。今回は「差分だけ・特有動作だけ」を切り出した別責務

### TEMPLATE.md の取得: degit 採用

手順2.5（ブランチ専用 dirs への TEMPLATE.md コピー）で `cp` ではなく `npx degit` で取得する方向。

**理由:**

| 状況 | cp の結果 |
|------|----------|
| 自分のプロジェクト（degit 直後） | OK |
| 他人のプロジェクト（docs 自作） | TEMPLATE.md がない → 失敗 |
| 他人のプロジェクト（カスタム済み） | 意図しないものがコピーされる |

degit なら既存 docs の状態に依存せず、常に公式テンプレートを取得できる。

**補足:** TEMPLATE.md はほぼ変更なしで動くため、degit で最新版を取ってきても実運用上の差はほぼない。

### 元ディレクトリ（docs/notes/ 等）: 一切触れない

`for_branch_init.md` は元の `docs/notes/`, `docs/letters/`, `docs/tasks/` に**一切触れない**。

**理由:**
- main で積み上げた実ノート・申し送りが入っている可能性がある（irreplaceable）
- action ファイルのパスが `docs/{branch}/` に書き換わるので、以降の書き込みはブランチ側に向く
- 元ディレクトリが残ったままでも実害なし

削除・移動の選択肢をAIに与えると「消しておきました！」という事故が起きうる。揺れる余地を与えない設計が安全。

### main ブランチ: 即終了

main / master を検出したら理由を伝えて即終了。承認フロー等は一切なし。

**理由:** ブランチ専用の操作を main で実行すると action ファイルのパスが壊れる。

### 安全網: git

- action ファイルが壊れても `git checkout` で一発復元
- TEMPLATE.md は `patterns/docs-structure/templates/` から再取得可能
- これらが安全網として機能するので、コード側の複雑な退避処理は不要

## 解決策

```
patterns/setup-pattern/docs-structure-for-branch/
├── README.md            ← ワンショット指示 + シェルスクリプト例
└── for_branch_init.md   ← AI が読む手順書
```

`patterns/docs-structure/README.md` の関連パターンセクションからリンク。

## 学び

- **「一切触れない」を明文化する**: 削除・移動の選択肢を手順に入れた瞬間、AIがどれかを選ぼうとする。危険な選択肢はそもそも存在させない
- **cp の原本依存は危うい**: 他人のプロジェクトや自作 docs では原本が保証されない。外部から取得する方が安定
- **git が安全網**: 復元できるものには過剰な退避処理を入れない。シンプルさ優先

## 関連ドキュメント

- `patterns/setup-pattern/docs-structure-for-branch/README.md`
- `patterns/setup-pattern/docs-structure-for-branch/for_branch_init.md`
- `patterns/docs-structure/README.md`

---

**最終更新**: 2026-04-17
**作成者**: Claude
