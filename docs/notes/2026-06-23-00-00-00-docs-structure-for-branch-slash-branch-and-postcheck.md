---
tags: [docs-structure-for-branch, idempotency, regex, post-check, branch]
---

# docs-structure-for-branch スラッシュ含みブランチ名対応と post-check 追加

**作成日**: 2026-06-23
**関連タスク**: docs-structure-for-branch 継続運用の冪等性強化

## 問題

### 1. `feature/xxx` 形式のブランチ名で正規表現がサイレント失敗

前回の修正で導入した `[^\/]+` はスラッシュを含まない単一セグメントにしかマッチしない。  
`feature/communication-chat` のようなスラッシュ含みブランチ名の場合、action ファイルが既にそのパスになっていても未検出のまま置換がスキップされた。

```
// マッチしない例（旧正規表現）
docs/branches/feature/communication-chat/notes/
              ^^^^^^^^^^^^^^^^^^^^^^
              [^\/]+ はスラッシュを含まないのでマッチ失敗
```

### 2. 置換結果の確認手段がなかった

置換後に残存パスがあってもログに出ず、サイレントに失敗していた。

## 解決策

### 正規表現を lookahead 方式に変更

`[^\/]+` を `.+?`（非greedy）＋ lookahead `(?=notes\/|letters\/|tasks\/)` に置き換え。  
`.+?` は終端（`notes/` 等）の直前まで伸びるので、スラッシュ含みブランチ名も正確に抜き出せる。

また、3行の個別 replace を1本に統合:

```js
// Before（3行、スラッシュ含みブランチ名に非対応）
c = c.replace(/docs\/(?:branches\/[^\/]+\/)?notes\//g,   target + 'notes/');
c = c.replace(/docs\/(?:branches\/[^\/]+\/)?letters\//g, target + 'letters/');
c = c.replace(/docs\/(?:branches\/[^\/]+\/)?tasks\//g,   target + 'tasks/');

// After（1行、全形式に対応）
const re = /docs\/(?:branches\/.+?\/)?(?=notes\/|letters\/|tasks\/)/g;
c = c.replace(re, () => { count++; return target; });
```

対応できるようになった状態:

| action のパス | 対応 |
|---|---|
| `docs/notes/` | ✅ 変換 |
| `docs/branches/main/notes/` | ✅ 変換 |
| `docs/branches/feature/old-branch/notes/` | ✅ 変換（今回修正） |
| `docs/branches/current-branch/notes/` | ✅ 冪等（同じパスに変換） |

### shell post-check を追加

node script の後に grep で残存パスをチェック。2種類の残存を検出:

```bash
STALE=$(grep -rE "docs/(notes|letters|tasks)/" docs/actions/ 2>/dev/null)
OTHER=$(grep -r "docs/branches/" docs/actions/ 2>/dev/null | grep -Fv "docs/branches/${BRANCH}/")
```

- `STALE`: 元の `docs/notes/` 等のプレーンパスが残っている
- `OTHER`: 現在ブランチ以外の `docs/branches/*/` パスが残っている

⚠️ が出た場合は手動確認を促すことでサイレント失敗を防ぐ。

## 学び

- **lookahead で終端を固定する**: ブランチ名の区切りをブランチ名側で決めようとすると文字クラスの制約が生まれる。代わりに、後続の固定トークン（`notes/` 等）を lookahead で指定すると、ブランチ名の形式を問わず正確に分割できる。
- **post-check はコードに落とす**: 「ちゃんと変わったか確認してください」を自然言語で書くより、grep で検出して明示的に出力する方がサイレント失敗を確実に防げる。

## 関連ドキュメント

- [docs-structure-for-branch パターン](../../patterns/setup-pattern/docs-structure-for-branch/)
- [前回の冪等性改善ノート](./2026-06-18-00-00-00-docs-structure-for-branch-ux-and-idempotency.md)

---

**最終更新**: 2026-06-23
**作成者**: AI (Claude) + 人間レビュー
