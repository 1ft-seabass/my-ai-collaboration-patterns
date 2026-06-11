---
tags: [docs-structure-for-branch, directory-structure, branch]
---

# docs-structure-for-branch のブランチパスを docs/branches/ 配下に変更

**作成日**: 2026-06-11
**関連タスク**: docs-structure-for-branch パス構造の調整

## 問題

`docs/{branch}/` という構造だと、他の開発ブランチに入ったときに `docs/` 直下にブランチ名ディレクトリが並んで見通しが悪くなる。

## 解決策

`docs/branches/{branch}/` に変更。`docs/branches/` という傘の下にブランチ専用ディレクトリが集まり、`docs/notes/` `docs/letters/` などの通常ディレクトリと混在しなくなる。

**変更ファイル**: `for_branch_init.md` のすべてのパス（mkdir / degit / replace 処理 / 完了通知テンプレート）

---

**最終更新**: 2026-06-11
**作成者**: AI (Claude) + 人間レビュー
