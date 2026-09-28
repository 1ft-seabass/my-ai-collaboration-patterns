---
tags: [docs-structure-for-branch, install-js, kit-vision, idempotency, node-ification]
---

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-28
**関連タスク**: `docs-structure-for-branch`のNode化（kit構想の肥大化防止・4つのメンテ懸念のうち④）

## 問題

`docs-structure-for-branch`の`for_branch_init.md`は、AIが読んで手動で実行する手順書のみの構成（`install.js`登場以前の旧スタイル）だった。他パターン（`docs-structure`/`setup-securecheck`）は既に確定的なNode.jsスクリプトへ移行済みで、これだけが取り残されていた。

## 試行錯誤

### 判断: Node化の是非を判定

`for_branch_init.md`の全手順（docs-structure導入確認→ブランチ名取得→main/masterなら中断→ディレクトリ作成→テンプレート取得・パス書き換え→actionファイルのパス書き換え→post-check）を確認したところ、**判断ポイントが実質ゼロ**であることが分かった。「main/masterなら中断」は固定ルールであり判断ではなく、パス書き換えも機械的な正規表現処理。setup-securecheckと違って「本物の漏洩かどうか」のような主観的判断が一切無いため、Node化の好条件と判断した。

### 設計判断: テンプレートの二重管理を避ける

削除した`docs-structure-and-securitycheck`（[削除の経緯](./2026-09-27-21-10-03-setup-pattern-mcp-server-and-securitycheck-removal.md)参照）が、`.security-check/lib/environment.js`との判定ロジック二重管理により実際に乖離していた反省を踏まえ、`install.js`は`docs-structure/templates`のコピーを自パターン内に持たず、**実行のたびにGitHubから直接degit取得**する設計にした。唯一の正が`docs-structure/templates`側に一本化され、乖離のリスクがゼロになる。

### 設計判断: verifyの要否

setup-securecheckの`verify`のような独立した再実行可能なコマンドは作らないことにした。理由は、`docs-structure-for-branch`には**継続的に壊れる可動部分が無い**（gitフックやバイナリと違い、一度パス書き換えが終われば後から静かに壊れる要素がない）ため。代わりに:
- 既存の post-check（未置換パスが残っていないかの確認）を`install.js`内に組み込む
- 人間への最終的な引き渡しは、`doc_note_and_commit.md`の既存フロー（`git diff`でのレビュー）に委ねる。このパターンの変更は全てdiffで完全に見える（ファイル作成・テキスト置換のみ）ため、diffレビュー自体が十分な人間検証になる

### アプローチA（バグ発見①）: post-checkの誤検知

**試したこと**: 分離したtmpのgitリポジトリで、ブランチ名`feature/test-branch`（スラッシュを含む、一般的な命名）で実行

**結果**: 失敗（post-checkが誤って「未置換パスが残っている」と警告）

**理由**: post-checkの「他ブランチ検出」正規表現`/docs\/branches\/[^/]+\//g`が、ブランチ名の最初の`/`までしか見ておらず、正しく置換された`docs/branches/feature/test-branch/`を`docs/branches/feature/`とマッチさせてしまい、targetと不一致と誤判定していた。実際の置換自体は正しく行われていた。

**修正**: 置換時に使う正規表現（`docs/(?:branches/.+?/)?`が`notes/|letters/|tasks/`の直前に来るかを見る、境界ベースの判定）をpost-checkでもそのまま再利用するよう変更。ブランチ名にスラッシュが何個含まれていても正しく判定できる。

### アプローチB（バグ発見②）: 無意味なUPDATE表示

**試したこと**: 同じブランチで`install.js`を再実行（冪等性テスト）

**結果**: 失敗（内容が変化していないのに毎回「UPDATE（N箇所）」と表示され、無駄な書き込みも発生）

**理由**: action ファイルの書き換え判定が「正規表現がマッチした回数（`count > 0`）」だけを見ており、置換前後で実際に内容が変わったかを見ていなかった。既に正しいパスになっている場合、置換は「同じ文字列を同じ文字列に置き換える」no-opになるが、`count`は0にならないため誤ってUPDATE扱いになっていた。

**修正**: `TEMPLATE.md`書き換え部分と同様に、置換前後の文字列を比較（`after !== before`）してから書き込み・ログ出力するよう変更。

### アプローチC（成功）: 全項目の実地検証

分離したtmpのgitリポジトリで以下を確認:
1. 新規導入（docs-structure未導入から） → 自動導入＋ブランチ専用ディレクトリ作成
2. 冪等性（同じブランチで再実行） → 全てSKIP、変更なし
3. main/masterガード → 固定ルールで即エラー終了（exit 1）
4. 別ブランチへの切り替え（`feature/test-branch` → `bugfix/second-branch`） → action ファイルが新ブランチパスに正しく再ターゲットされ、旧ブランチパスが一切残らない
5. 一時取得ディレクトリ（`.docs-structure-for-branch-fetch-tmp`）が`process.on('exit', ...)`で確実にクリーンアップされる
6. 元の`docs/notes/`・`docs/letters/`・`docs/tasks/`が無変更のまま残る

**結果**: 成功。

## 解決策

`docs-structure-for-branch/install.js`を新設し、`for_branch_init.md`の全手順を判断待ちなしの1スクリプトに集約した。

**実装場所**:
- `patterns/setup-pattern/docs-structure-for-branch/install.js`（新設）
- `patterns/setup-pattern/docs-structure-for-branch/README.md`（install.js優先の導線に更新、`for_branch_init.md`は「1ステップずつ確認したい場合」の代替として維持）
- `patterns/setup-pattern/README.md`（同様に更新）

**主なポイント**:
1. main/masterガードは固定ルールとして`process.exit(1)`で即中断（確認ダイアログ不要）
2. テンプレートは自パターン内に複製せず、実行時に`docs-structure/templates`から直接degit取得
3. post-checkとaction ファイル書き換えの判定は、同じ「notes/|letters/|tasks/の直前」という境界基準を共有することで、ブランチ名の形式（スラッシュの有無）に関わらず正しく動作する

## 学び

- 「判断ポイントがあるか」を先に見極めることで、Node化すべきパターンとそうでないパターンを判別できる。setup-securecheckは判断ポイントが本質的に残るためAIとの往復が必要だが、docs-structure-for-branchは判断ポイントが無いため完全にコード化できた
- `verify`のような継続検証コマンドの価値は「後から静かに壊れる可動部分があるか」に依存する。可動部分が無ければ、post-checkのような即時チェック＋diffレビューで十分
- ブランチ名にスラッシュを含む（`feature/xxx`のような一般的な命名規則）ケースは、パス処理のテストで見落としやすい。単純な「/」区切りでの1階層比較ではなく、実際の置換ロジックと同じ境界判定を再利用する方が安全
- 「内容が変わったか」を見ずに「処理が実行されたか（マッチ回数）」だけでUPDATE/SKIPを判定すると、no-opな置換でも誤ってUPDATE表示してしまう。他の同種スクリプト（`setup-local.js`等）でも同じ観点でのチェックが有効

## 今後の改善案

- 特になし（`docs-structure-and-securitycheck`削除・`docs-structure-mcp-server`削除と合わせて、当初の4つのメンテ懸念は一通り対応完了）

## 関連ドキュメント
- [setup-pattern MCPサーバー/統合インストーラー削除の経緯](./2026-09-27-21-10-03-setup-pattern-mcp-server-and-securitycheck-removal.md)
- [verifyの人間検証ループと信頼契約の経緯](./2026-09-27-09-54-47-verify-human-loop-trust-contract.md)

---

**最終更新**: 2026-09-28
**作成者**: AI
