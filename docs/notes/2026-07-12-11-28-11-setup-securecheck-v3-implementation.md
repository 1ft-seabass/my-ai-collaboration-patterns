---
tags: [setup-securecheck, v3, fail-closed, cli, migration, uninstall, verification-protocol]
---

# setup-securecheck v3実装（.security-check化・フェイルクローズ・アンインストール） - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-12
**関連タスク**: 同日の構想・計画ノート（[[2026-07-12-10-15-49-setup-securecheck-v3-restructuring-plan]]）で合意した設計の実装。このノートは実装内容・実地検証結果・実装中に判明した事実を記録する。

## 問題

構想ノートで合意した設計（`.security-check/`への集約、`cli.js`単一エントリポイント、フェイルクローズ方針、アンインストールコマンド、v2→v3マイグレーション経路）を、実際にコードとして実装し、「本当に動くか」「壊れた状態で本当に失敗するか」を実地で確認する必要があった。

## 実装したもの

### `.security-check/` の構成

テンプレート（`patterns/setup-pattern/setup-securecheck/templates/.security-check/`）とこのリポジトリ自身のデプロイ済みコピー（`.security-check/`）の両方に、以下を実装した:

- `cli.js` — 単一エントリポイント。サブコマンド（`verify` / `pre-commit` / `install-gitleaks` / `uninstall`）を振り分け、exit codeを一元管理する
- `lib/environment.js` — gitleaksバイナリの探索（`.security-check/bin/` → グローバル → 見つからない）、v1（husky）/v2（旧`scripts/`レイアウト）の検知を共有する。以前は`pre-commit.js`と`security-verify.js`が別々に（別基準で）gitleaksの有無を判定していたため、この分散自体が「gitleaksが導入されていないのに気づかれない」土壌になっていた
- `lib/pre-commit.js` — 毎コミット実行される検証本体。既存の`scripts/pre-commit.js`のロジック（secretlint/gitleaks独立実行、自動カナリア自己検証、try/finally一本化構造）をほぼそのまま移植しつつ、gitleaks不在時の挙動を「警告してコミット続行」から「エラーを出してコミットをブロック」に変更した
- `lib/verify.js` — ヘルスチェック（旧`security-verify.js`相当）。チェック項目を14→15に変更（`.security-check/`ディレクトリ自体の存在チェックを追加）。v1に加えv2（旧レイアウト）の先行検知も追加
- `lib/install-gitleaks.js` — gitleaksバイナリのインストーラー。配置先を`./bin/`から`.security-check/bin/`に変更した以外は既存ロジックのまま
- `lib/uninstall.js` — 新規実装。詳細は下記「アンインストールの設計」参照
- `README.md` — `.security-check/`自身の説明（中身・使い方・設計方針）。「今は明示的な説明が無くREADME頼み」という課題への対応

### 設定ファイルの扱い

`gitleaks.toml` / `.secretlintrc.json` は`.security-check/`に集約せず、リポジトリルートに残した。理由は構想ノート記載の通り、これらはユーザーが直接編集する対象であり、`.eslintrc`等と同種の「見える場所にあるべき」設定ファイルだと判断したため。

### フェイルクローズの実装

`lib/pre-commit.js`で、`findGitleaksBinary()`が`null`を返した場合（gitleaks未導入）:

```js
gitleaksOk = false;
console.error('  ❌ gitleaks が見つかりません — フェイルクローズ方針によりコミットをブロックします');
console.error('    導入するには: node .security-check/cli.js install-gitleaks');
```

以前は`gitleaksOk`が初期値`true`のまま変わらず、警告ログのみでコミットが成立していた（フェイルオープン）。この一点が今回のv3化の核心的な変更。

### アンインストールの設計

`lib/uninstall.js`は以下を行う:
1. `package.json`から、このパターンが管理するキー（`scripts.security`・`scripts.postinstall`が`npx simple-git-hooks`と完全一致する場合のみ・`simple-git-hooks['pre-commit']`・`devDependencies`の`secretlint`/`@secretlint/secretlint-rule-preset-recommend`/`simple-git-hooks`）を削除
2. `git rev-parse --git-path hooks/pre-commit`で解決した実際のgit hookファイルを削除（worktree環境でも正しく動作する）
3. `.security-check/`ディレクトリ自体を再帰的に削除

デフォルトはドライラン（削除計画を表示するのみ）で、`--yes`を付けた場合のみ実際に実行する。`gitleaks.toml` / `.secretlintrc.json`は自動削除しない（ユーザー編集対象のため）。

**自己削除の技術的な注意点**: `cli.js`自身が`.security-check/`ディレクトリの中に存在するため、`uninstall`コマンドは実行中の自分自身が入っているディレクトリを削除することになる。POSIX系OS（Linux/macOS）では、Node.jsが起動時に`cli.js`の内容を読み込み済みのため、実行中にファイル/ディレクトリを`unlink`しても問題なくプロセスは完走できる（このリポジトリの動作確認環境はLinuxのため、この前提で実装・確認した。Windowsでは同様に動作しない可能性があり、`.security-check/README.md`にその旨の注記はしていないため、次回機会があれば追記を検討）。

## 実地検証の結果

### フェイルクローズ確認

このリポジトリの`.security-check/bin/gitleaks`を一時的にリネームして`pre-commit`サブコマンドを直接実行し、`❌ gitleaks が見つかりません — フェイルクローズ方針によりコミットをブロックします`とexit code 1が返ることを確認。バイナリを復元後は15/15 passed。

### アンインストール確認

`/tmp`のスクラッチディレクトリに`.security-check/`一式・`package.json`・`.gitignore`をコピーし、gitを初期化した上で`uninstall --yes`を実行:
- git hookが存在しないケース・存在するケースの両方で、正しく計画表示→実行→`.security-check/`の自己削除まで完走することを確認
- `package.json`から管理対象キーが正しく削除されることを確認

### 新規インストール（0→v3）のエンドツーエンド確認

空の新規git repoにテンプレート一式（`.secretlintrc.json` / `gitleaks.toml` / `.security-check/`）を配置し、`install-gitleaks` → `package.json`手動設定 → `npx simple-git-hooks` → 実コミット、という一連の流れを実行し、最終的に15/15 passedに到達することを確認した。

**この過程で判明した事実（実装のバグではなく環境要因）**: テスト用の`package.json`に`secretlint`を`devDependencies`として明示的にpinせずに`npx secretlint`を実行したところ、`npx`がグローバルの最新版（12.0.0）を解決し、この状態で自動カナリア自己検証が「カナリアが検出されませんでした」と失敗した（≒ pre-commitがこの状態を正しくフェイルクローズでブロックした）。`npm install -D secretlint@^11.7.1 ...`で正しくpinし直したところ11.7.1が解決され、自己検証も正常に成功した。ロジック自体のバグではなく、「`npm install`でsecretlintを明示的に入れる」という手順（Step 1.2）を飛ばした場合の当然の帰結だが、secretlintのメジャーバージョン間でJSON出力の互換性が保証されているとは限らない、という点は将来的な留意事項として記録しておく。

## 学び

- gitleaksの有無判定を1箇所（`environment.js`）に集約したことで、「`pre-commit.js`は判定できているのに`security-verify.js`は❌になる」といった潜在的な不整合（実際、旧実装ではverify側がグローバルgitleaksを考慮しておらずpre-commit側とは判定基準が微妙に異なっていた）も同時に解消できた。footprint集約は「見た目の整理」だけでなく「ロジックの重複によるバグの温床」も一緒に潰せる
- アンインストールという「使われないことを祈る機能」ほど、実際に動かして確認しないと信用できない。特に自己削除（実行中の自分のディレクトリを消す）は直感的に「危険では」と感じやすいが、POSIXのファイルシステムの仕組み（読み込み済みファイルのunlinkは実行継続に影響しない）を理解した上で実地確認すれば、安全に実装できる
- 「新規インストールを最初から全部やってみる」という検証は、ドキュメント（`setup-securecheck.md`）のプローズを読むだけでは見つからない抜け（今回はsecretlintのバージョンpin忘れ）を発見する。手順書の正しさは、手順書を実際になぞってみないと分からない

## 今後の改善案

- `patterns/setup-pattern/docs-structure-and-securitycheck/setup-all.js`（docs-structureとの統合自動インストーラー、別パターン）が旧`scripts/`レイアウトを前提にしたコピー・マージロジックをハードコードしたままで、今回のv3化に未対応。このまま使うと、この統合インストーラー経由で導入したプロジェクトはv2レイアウトのまま新規作成されてしまう。次回セッションで対応するか、少なくとも既知のギャップとして認識しておくこと
- `.security-check/README.md`に、アンインストールの自己削除がWindows環境で同様に動作するかは未確認である旨の注記を追加できると親切
- 次セッションでユーザーが検証予定: このリポジトリ自身への当て込みでのインストーラー・`cli.js`自体の動作確認、人間が叩けるウィザードのブラッシュアップ

## 関連ドキュメント
- [setup-securecheck v3構造化の構想と移行計画](./2026-07-12-10-15-49-setup-securecheck-v3-restructuring-plan.md)
- [毎コミット自動カナリア自己検証の実装ノート](./2026-07-12-08-36-00-per-commit-canary-self-verification-implementation.md)

---

**最終更新**: 2026-07-12
**作成者**: Claude
