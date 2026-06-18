---
tags: [docs-structure-for-branch, ux, idempotency, regex, copy-paste]
---

# docs-structure-for-branch コピペUX改善と冪等性向上

**作成日**: 2026-06-18
**関連タスク**: docs-structure-for-branch の運用改善

## 問題

2点の課題があった。

1. **README の発動プロンプトがコピペしにくい**: 発動プロンプト内に ` ```bash ` フェンスがあり、外側をフェンスで囲もうとするとネストが発生してコピペブロックとして機能しなかった。

2. **action ファイルのパス書き換えが冪等でない**: 手順3の正規表現が `docs/notes/` の固定パターンのみを対象としていたため、別ブランチで一度適用済みで `docs/branches/old-branch/notes/` になっている action ファイルを新しいブランチに適用しようとしても変換されなかった。

## 解決策

### 1. README: bash フェンスを除去してシンプルに

発動プロンプト内の ` ```bash ` フェンスを取り除き、コマンドを平文に。外側を ` ``` ` で囲むだけでブロックごとコピペできるようになった。

**Before**:
```
---
... ```bash
npx degit ...
``` ...
---
```

**After**:
````
```
...
npx degit ...
...
```
````

### 2. for_branch_init.md 手順3: 正規表現を拡張して4状態を吸収

**Before**:
```js
c.replace(/docs\/notes\//g, 'docs/branches/' + branch + '/notes/')
```

**After**:
```js
c.replace(/docs\/(?:branches\/[^\/]+\/)?notes\//g, 'docs/branches/' + branch + '/notes/')
```

`(?:branches\/[^\/]+\/)?` を追加することで、以下の4状態すべてを現在ブランチのパスに書き換えられるようになった：

| 状態 | action のパス | 対応 |
|---|---|---|
| A. 完全新規 / docs-structure あり・ブランチ未対応 | `docs/notes/` | Phase 0 → 手順3で変換 |
| B. 別ブランチのパスになっている | `docs/branches/old-branch/notes/` | 今回の修正で変換可能に |
| C. 同ブランチで再実行 | `docs/branches/current/notes/` | 同上（冪等に通過） |

## 学び

- **コードに判定を落とし込む**: 状態判定をコード（正規表現）に入れることで、AI の判断に依存しない確実な処理になる。コードが「どの状態でも正しく動く」形にすることが冪等性の本質。
- **ネストを避けるシンプルさ**: コピペ用プロンプトに ` ```bash ` を入れるのは構造的なネストを招く。AI はコードフェンスがなくてもコマンドとして認識できるため、平文で十分。

## 関連ドキュメント

- [docs-structure-for-branch パターン](../../patterns/setup-pattern/docs-structure-for-branch/)
- [発動プロンプト整理と Phase 0 追加](./2026-06-15-00-00-00-docs-structure-for-branch-activation-redesign.md)

---

**最終更新**: 2026-06-18
**作成者**: AI (Claude) + 人間レビュー
