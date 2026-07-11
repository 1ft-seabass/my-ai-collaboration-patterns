---
tags: [setup-securecheck, git-worktree, security-verify, false-positive, simple-git-hooks]
---

# git worktree構成でのpre-commitフック誤検知修正 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-11
**関連タスク**: ユーザーからの外部フィードバック（`main`/`develop`をgit worktreeで共有する構成でsetup-securecheckを導入した際の気づき2件）への対応

## 問題

setup-securecheck v2.0.2を使ってgit worktree構成のリポジトリに導入したユーザーから、以下2点の報告を受けた。

1. `security-verify.js`が`.git/hooks/pre-commit`を決め打ちパスで存在チェックしており、worktreeでは`.git`がディレクトリではなく`gitdir: /path/to/main/.git/worktrees/<name>`を指すポインタファイルになるため、フックが正しく導入・動作していても常に❌判定になる
2. Phase 3 ステップ3.3「値が完全一致するか確認し、異なれば修正する」という指示が、複数worktreeでhooksを共有し一部のworktreeにしか`scripts/pre-commit.js`が無い構成では、存在ガード式（`if [ -f scripts/pre-commit.js ]; then ... fi`）を一律「不具合」として扱ってしまい、単純な`node scripts/pre-commit.js`に「修正」すると未導入側のworktreeでコミットが失敗するようになる

どちらもユーザー側で実コミット・ネガティブテストにより動作確認済みの再現性ある指摘だった。

## 調査

### 実装調査

`templates/scripts/security-verify.js`のcheck#3（存在）・check#8（内容）が両方とも`fileExists('.git/hooks/pre-commit')` / `readFile('.git/hooks/pre-commit')`という決め打ちパスだった。

`setup-securecheck.md`ステップ3.3を確認すると、「`pre-commit`の値が`node scripts/pre-commit.js`と完全一致するか必ず確認してください...異なっていれば上記の値に**修正**してください」という指示になっており、worktreeガード式を例外扱いする記述がなかった。

### 追加発見: 自動インストーラー側の同型バグ

手動ガイド（人間が読んで判断する）だけでなく、`docs-structure-and-securitycheck/setup-all.js`（degitで取得して実行する統合自動インストーラー）にも同じ2つの決め打ちロジックが存在することに気づいた。

- `fileExists(path.join('.git', 'hooks', 'pre-commit'))` — 同じworktree誤検知（ただしSKIP/CREATEのログ表示にのみ影響。フック自体は`npx simple-git-hooks`実行で正しく作られるため実害はない）
- `simple-git-hooks.pre-commit`の値が期待値と完全一致しなければ**問答無用で上書き修正**するロジック — 手動ガイドのステップ3.3と同じ問題だが、こちらは人間の判断を挟まず自動実行されるため実害がより大きい。worktreeガード式を意図的に使っているプロジェクトに対してこのインストーラーを再実行すると、無言でガード式が剥がされてしまう

手動ガイドの注記だけを直しても、自動インストーラー経由の再適用では再発する構造だったため、両方を直す方針にした。

## 解決策

### 1. worktreeでのフック検出パス解決

`git rev-parse --git-path hooks/<hookname>`でgit自身に実パスを解決させる方式に変更（hooksは全worktreeで共有される実体を指すため、mainでもworktreeでも正しく検出できる）。

**実装場所**:
- `patterns/setup-pattern/setup-securecheck/templates/scripts/security-verify.js`
- `scripts/security-verify.js`（このリポジトリ自身のデプロイ済みコピー。テンプレートと同期させる必要があった）
- `patterns/setup-pattern/docs-structure-and-securitycheck/setup-all.js`

```js
function resolveGitHookPath(hookName) {
  const resolved = execCommand(`git rev-parse --git-path hooks/${hookName}`);
  if (resolved) {
    return path.isAbsolute(resolved) ? resolved : path.join(process.cwd(), resolved);
  }
  return path.join(process.cwd(), '.git', 'hooks', hookName);
}
```

フォールバック（gitコマンド失敗時）は非git環境向けの保険で、通常は到達しない想定。

### 2. simple-git-hooks.pre-commitの「正しさ」判定を完全一致から実質判定に変更

`security-verify.js`のcheck#8は元々「`pre-commit.js`を呼んでおり`|| true`等の抑制が無ければ良し」という実質判定だった（文字列完全一致ではない）。`setup-all.js`の上書き判定もこれと同じ基準に揃えた。

```js
function isEffectivelyCorrectPreCommitValue(value) {
  return !!value && value.includes('pre-commit.js') && !/\|\|\s*true/.test(value);
}
```

`|| true`（exit code握りつぶし）とは異なり、存在ガード式はファイルが存在すれば通常通りexit codeが伝播するため、検出精度を落とさずに許容できる。

### 3. `setup-securecheck.md`ステップ3.3への注記追加

worktreeでhooksを共有し一部worktreeにのみ導入している場合は、存在ガード式を許容する旨と具体的なガード式の例を追記した。

### 4. 副次的に発見した古いドキュメント数値の修正

README.mdに`security-verify.js`のヘルスチェック項目数として「12/12」「12項目」という古い数字が残っていた（v2.0.2でcheck#13を追加した際の同期漏れ）。前回申し送りで「12/12のような古い数字を見つけたら要修正のサイン」と警告されていた通りの実例だったため、13に修正した。

**主なポイント**:
1. 手動ガイドの文言修正だけでなく、それを自動化した経路（`setup-all.js`）に同じ設計思想の不整合が無いか確認する必要がある
2. 「完全一致」という機械的な判定基準は、意図的な差分（今回のworktreeガード式）を一律不正扱いしてしまうリスクがある。`security-verify.js`のcheck#8は元々「実質的に正しいか」で判定していたため、その基準に揃えることで一貫性を確保した
3. パターンのテンプレートを直すだけでなく、このリポジトリ自身がテンプレートのデプロイ先でもあるため、`scripts/security-verify.js`（デプロイ済みコピー）への同期を忘れずに行う必要がある

## 検証

- 通常構成（非worktree）でのリグレッション確認: `npm run security:verify` → 13/13 passed
- worktree構成での修正確認: `git worktree add`で一時worktreeを作成し、修正前のスクリプトでは`.git/hooks/pre-commit`が❌、修正後のスクリプトを配置すると✅に変わることを確認（uncommittedな変更はworktree checkout時に反映されないため、修正版スクリプトを手動でworktreeにコピーして検証した）
- `isEffectivelyCorrectPreCommitValue`のロジックを単体テスト（完全一致の値・ガード式・`|| true`付き・無関係な値の4パターン）で確認
- テスト用worktreeとブランチは検証後に`git worktree remove --force` / `git branch -D`で削除済み

## 学び

- ユーザー報告のバグは、報告された箇所だけでなく「同じ設計思想で書かれた別の実装」（今回は手動ガイド↔自動インストーラー）にも同型のバグが潜んでいないか横展開して確認する価値がある
- 「値が完全一致するか」という機械的な正しさの基準は、意図的な差分を持つ利用者を弾いてしまうことがある。可能なら「実質的に正しいか」という基準に寄せた方が、検出精度を落とさずに柔軟性を確保できる
- パターンのテンプレートとこのリポジトリ自身のデプロイ済みコピーは別物であり、修正のたびに同期を意識する必要がある（過去のgitleaks `--redact`修正でも同種の同期漏れがあった）

## 今後の改善案

- 今回は`.git/hooks/pre-commit`のみ対応したが、同じ決め打ちパスパターンが他のフック関連チェックに紛れ込んでいないか、将来pre-commit以外のフックを扱うようになった際は再確認すること

## 関連ドキュメント
- [前回申し送り（A6・ネガティブテスト検証プロトコル完了）](../letters/2026-07-10-09-50-23-setup-securecheck-a6-negative-test-protocol-complete.md)

---

**最終更新**: 2026-07-11
**作成者**: Claude
