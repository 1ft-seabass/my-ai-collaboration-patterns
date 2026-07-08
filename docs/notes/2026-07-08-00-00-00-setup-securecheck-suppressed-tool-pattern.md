---
tags: [setup-securecheck, security, pre-commit, secretlint, idempotency, false-positive]
---

# setup-securecheck「ツールはあったが握りつぶされていた」型の問題と対策

**作成日**: 2026-07-08
**関連タスク**: setup-securecheck 実運用バグ報告への対応

## 問題

### 症状

`git commit` のたびに secretlint チェックが失敗表示されるが、コミット自体は毎回成立していた。

### 構造

以下の2つが重なって発生した：

**① exit code の握りつぶし**

`simple-git-hooks` の pre-commit コマンド定義が以下のようになっており、スクリプトが `exit 1` を返してもシェルレベルで無効化されていた：

```
"pre-commit": "... && node scripts/pre-commit.js || true"
```

**② スキャン範囲の過剰指定による誤爆の常態化**

スキャン範囲が `"**/*"` で `.gitignore` を無視していたため、ログファイル等の無関係なファイルに恒常的に誤検知が発生。「毎回エラーが出るが無視してよい」という運用習慣が生まれ、① の `|| true` を誘発する一因になった。

### 本質的なリスク

「チェックは動いている（ログにエラーは出る）」のに「実効性はゼロ（何もブロックしない）」という状態が、外見上は正常に運用されているように見えてしまう。ツールの有無や設定ファイルの存在だけを見る診断では「導入済み・安全」と誤判定する。

## 解決策

### Fix 1: `security-verify.js` check #8 に `|| true` 検出を追加

`|| true` パターンを正規表現で検出し、存在すれば ❌ を報告するように変更：

```js
const hasSuppression = precommit && /\|\|\s*true/.test(precommit);
if (hasSuppression) {
  checkResult(false, '.git/hooks/pre-commit — || true が含まれており exit code が握りつぶされています（コミットがブロックされません）');
} else {
  checkResult(hasPreCommitJs, '.git/hooks/pre-commit に pre-commit.js ...');
}
```

### Fix 2: `setup-securecheck.md` にネガティブテスト（Step 3.6.5）を追加

陽性確認（コミット成功）だけでなく、**陰性確認（シークレットがブロックされるか）** を必須ステップとして追加：

```bash
echo 'TEST_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' > .test-secret-canary
git add .test-secret-canary
git commit -m "test: should be blocked by pre-commit hook"
# → コミットが失敗することを確認してからクリーンアップ
git restore --staged .test-secret-canary && rm .test-secret-canary
```

成功してしまった場合は `|| true` の有無を確認し、`npm run security:verify` でヘルスチェックを促す注記も追加。

### Fix 3: `"**/*"` スキャンの位置づけを注釈で明示

`secret-scan` / `secret-scan:full` は全体監査用であり `.gitignore` 無視が意図的な仕様であることを記載。pre-commit フックは staged ファイルのみスキャンするため `.gitignore` 済みファイルには反応しないことを明確化。「毎回エラーが出る」場合は `ignores` への追加を促す。

## 学び

- **「ツールが入っている」と「ツールが機能している」は別物**: verify の項目に「実際にブロックするか」（陰性確認）を加えないと、握りつぶし状態を「正常」と判定してしまう
- **誤爆の常態化が握りつぶしを誘発する**: スキャン範囲の過剰指定 → 常時誤検知 → `|| true` で黙らせる、という流れが自然に起きる。スキャン範囲の設計が第一防衛線
- **フォールバックの恒久化**: `|| true` 的なパターンは「とりあえず動かす」目的で入りがちだが、恒久化すると気づかれないまま無効化状態が続く

## 関連ドキュメント

- [setup-securecheck パターン](../../patterns/setup-pattern/setup-securecheck/)

---

**最終更新**: 2026-07-08
**作成者**: AI (Claude) + 人間レビュー
