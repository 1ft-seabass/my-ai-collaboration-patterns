---
tags: [secretlint, pre-commit, simple-git-hooks, performance, security]
---

# pre-commit の secretlint が全件スキャン（`**/*`）で 10 分 → staged のみに直す

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-06-10
**関連タスク**: セキュリティチェック（secretlint + gitleaks）のコミット遅延調査

## 問題

`git commit` のたびに pre-commit フックの secretlint が走ると、数十秒〜分単位で待たされていた。実測すると **10 分 30 秒**。しかも 1 ファイルだけの tiny なコミットでも同じだけ待たされる ＝ コストが「変更の大きさ」ではなく「リポジトリの大きさ」に比例していた。

申し送りでは「`.secretlintrc.json` の `ignores` にキャッシュ/生成物を足して除外する」方針だったが、実測したら除外は効かなかった（むしろ誤差で遅くなった）。真因は別だった。

## `**/*` だとこうなる（実測データ）

pre-commit は `npx secretlint "**/*"` でワーキングツリー全体を対象にしていた。この repo での内訳:

| 区分 | ファイル数 |
|---|---|
| 全ファイル（`"**/*"` が列挙する対象） | 48,962 |
| └ node_modules（ネスト全部） | **32,847**（67%） |
| └ _site | 9,229 |
| └ .git | 5,121 |
| **secretlint が実際に内容スキャンする件数**（ignores 適用後） | **1,749** |

→ **1,749 件をスキャンするために 48,962 件を歩いている**。10 分の正体はファイルの中身検査ではなく、約 49,000 回の `stat`（ファイルの歩き回り）で、その 3 分の 2 が node_modules。`time` でも user CPU ≒ 0.25s に対し実時間 10 分 ＝ 純粋な I/O 待ちだった。Windows は Defender が各ファイルアクセスを覗くので `stat` がさらに遅く、増幅される。

**重要な気づき**: `.secretlintrc.json` の `ignores`（`**/node_modules/**` 等）は *マッチ段階* の除外であって、*列挙（walk）段階* では効かない。つまり **ignore は「スキャンする対象」を減らすが「歩く対象」は減らさない**。だから申し送りの「.cache を除外に足す」では絶対に直らなかった（実測でも誤差）。効くのは入口の glob を変えることだけ。

## なぜ混入したか（時系列）

最初（導入時 2026-01-20）は正しかった。`husky + lint-staged` 構成で、secretlint は **lint-staged 経由で staged ファイルのみ** をスキャンしていた。`secretlint "**/*"` は別物の手動フルスキャン用 `npm run secret-scan` 側だった（gate と audit が分離されていた）。

退化したのは v2.0.0 適用時（husky/lint-staged → simple-git-hooks 移行）。

- `husky + lint-staged` を完全削除 → secretlint の「staged のみ」を担保していた **lint-staged が消えた**
- secretlint には **native な staged モードが無い**（だから lint-staged が外付けで担っていた）
- 新 `pre-commit.js` は staged リストを渡し直さず、`secretlint "**/*"`（＝監査コマンド）で穴を埋めた

しかも当時すでに気づかれていた。移行ノートの「今後の改善案」に:

> `pre-commit.js` の secretlint は現状 `**/*` 全件スキャンで重め。staged ファイルのみに絞る選択肢も検討する（lint-staged を再導入するか、`git diff --cached --name-only` を渡す）

→ 見落としていたバグではなく、**気づいてメモしたが着手されず埋もれた改善案**。検出ではなくフォロースルーが穴だった。

## 解決策

pre-commit の secretlint を「ステージ済みファイルのみ」に変える。**gitleaks が既にやっている `protect --staged` と対称**にするのがポイント（gitleaks は native の `--staged` を持つので移行を生き延びた。secretlint は持たないので staged リストを自前で食わせる）。

**実装場所**: `patterns/setup-pattern/setup-securecheck/templates/scripts/pre-commit.js`

```js
// before（監査コマンドをゲートに流用＝誤り）
execSync('npx secretlint "**/*"', { stdio: 'inherit' });

// after（staged を自前供給＝gitleaks --staged と対称）
const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
  .split('\n').map(s => s.trim()).filter(Boolean);
if (staged.length === 0) {
  console.log('ステージされたファイルがないため secretlint をスキップします');
} else {
  // Windows のコマンドライン長制限を避けるため 100 件ずつ分割
  for (const files of chunk(staged, 100)) {
    execSync(`npx secretlint ${files.map(f => `"${f}"`).join(' ')}`, { stdio: 'inherit' });
  }
}
```

**結果**: pre-commit 実走で **10 分 30 秒 → 1.18 秒**（gitleaks 含めて全パス）。

補足:
- `ignores` は明示指定したファイルにも効くことを実測確認済み（`_site`/`.cache` のファイルを直接渡しても skip された）。なので生成物がステージに混じっても安全。
- 保険として `.secretlintrc.json` に `**/.cache/**` も追加した（load-bearing ではないが無害）。
- リポジトリ全体の定期監査は従来どおり `npm run secret-scan`（`**/*`）で実行できる。pre-commit が差分だけ見るのは標準的かつ正しい挙動。

## 学び

- 学び1: **コミットゲートに監査コマンドを置くな（gate ≠ audit）**。pre-commit は「このコミットに入る差分」だけを見る。`"**/*"` は全件監査の命令で、要求が逆（コスト=リポジトリサイズ vs 差分サイズ）。
- 学び2: **ignore は scanned を減らすが walked は減らさない**。「除外を足す」で遅さを直そうとしても、glob が全列挙する限り walk コストは消えない。直すなら入口の glob。
- 学び3: **差分に絶対入らないもの（node_modules / ビルド生成物 / .git）に触れていたら、それはゲートに監査が紛れ込んでいるサイン**。staged スコープなら node_modules には原理的に触れない。「tiny コミットでも遅い＝コストが差分でなくツリーに比例」も同じ兆候。
- 学び4: **同種アンチパターンの代表例**（「これ系の匂い」として）:
  - リンタ/フォーマッタを `**/*` や `.` でフック実行（`eslint .` / `prettier --write .` / `secretlint "**/*"`）。`lint-staged` はこれを直すために存在する
  - セキュリティスキャナの監査モードをゲートに流用（`gitleaks detect --source .` / `trivy fs .` / `semgrep .`）→ 各ツールの `--staged`/diff モードを使う
  - 全テストを毎コミット/毎保存（影響範囲に絞らない）、`tsc` フルプロジェクト型チェックをゲートに
  - `grep -r` / `find .` / `du` を node_modules ごと（日常版）
  - ファイルウォッチャ（chokidar/nodemon/webpack）が node_modules/dist を ignore せず監視 → inotify 枯渇・常時高負荷

## 今後の改善案

- `.gitleaksignore` の既存エントリ（`joplin-conderter-node-red_dir/.config.runtime.json:3`）が「Invalid fingerprint entry」警告のままなので形式を直す（別件）。

## 関連ドキュメント

- [setup-securecheck パターン](../../patterns/setup-pattern/setup-securecheck/)
- [v2.0.0→v2.0.1 移行ガイド](../../patterns/setup-pattern/setup-securecheck/migration/MIGRATION_GUIDE_v2.0.0_to_v2.0.1.md)

---

**最終更新**: 2026-06-10
**作成者**: AI (Claude) + 人間レビュー
