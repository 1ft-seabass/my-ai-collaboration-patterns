---
tags: [setup-securecheck, wizard, cli, fail-closed, cwd-guard]
---

# setup-securecheck v3 ウィザード追加とcwdガード修正 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-12
**関連タスク**: setup-securecheck v3.0.0 実運用検証（前回申し送りでユーザーから依頼）

## 問題

前回セッション（`docs/notes/2026-07-12-11-28-11-setup-securecheck-v3-implementation.md`）で `.security-check/` への集約・フェイルクローズ化・アンインストールを実装したが、「このリポジトリ自身への当て込みでのインストーラー動作確認」「`cli.js`の動作確認」「人間が叩けるウィザードのブラッシュアップ」の3点がユーザーから次回検証希望として申し送られていた。

今回のセッションでは、ユーザー自身がVS Code上の実ターミナルで`cli.js`を実地に叩きながら検証を進め、その過程で対話ウィザードの新規実装と、実行場所に依存する不具合の発見・修正が発生した。

## 経緯

### 1. ウィザードの構想

ユーザーが別プロジェクトで実証済みの「tools CLI 設計パターン」（依存ゼロ、raw-mode+ANSI、select/multiselect/confirm、窓表示、非TTY縮退）のメモを参考として提示。これをベースに、`cli.js`に「引数なしで起動すると人間向けの対話メニューが立ち上がる」ウィザードを追加する方針で合意した。

**設計判断**:
- 既存のサブコマンド呼び出し（`verify`/`pre-commit`/`install-gitleaks`/`uninstall`）は変更しない（スクリプト・CI・git hookからの呼び出しに影響を与えないため）
- 引数なし+TTYのときだけウィザード発動。非TTYは従来通りヘルプ+exit 1に縮退
- `pre-commit`はgit hook専用なのでメニューの選択肢から除外
- `install-gitleaks`はバイナリDLという副作用があるためconfirmを挟む
- `uninstall`はドライラン計画を自動表示してからconfirmする（`--yes`を覚える必要がなくなる）

### 2. 実装

- `lib/prompt.js`（新規）: `select`（上下キー選択、窓表示、ラップ）と`confirm`（y/n一打鍵）。どちらも非TTYでは`null`を返して安全に縮退
- `lib/wizard.js`（新規）: メニュー本体。各lib（verify/install-gitleaks/uninstall）の`run(args)`をそのまま呼び出す薄いオーケストレーション
- `cli.js`: 引数なし+TTYの分岐を追加、ヘルプにウィザードの案内を1行追記

疑似TTY（Python `pty`モジュールでキー入力をエミュレート）で、カーソル移動・ラップ・Escキャンセル・verifyサブメニュー・uninstallのドライラン→confirmキャンセルの各フローを事前に確認してからユーザーに引き渡した。

### 3. 実地検証で発覚した不具合

ユーザーが実ターミナルで`cd .security-check && node cli.js`と操作し、ウィザードから`install-gitleaks`を実行したところ、「gitleaks installed: 8.30.0」と成功表示されたが、実際には`.security-check/.security-check/bin/gitleaks`という二重ネストしたパスに誤って導入されていた。

**原因**: `lib/environment.js`の`BIN_DIR`をはじめ、各サブコマンドは`process.cwd()`基準でパスを組み立てる設計になっている（例: `SECURITY_CHECK_DIR = path.join(process.cwd(), '.security-check')`）。`.security-check/`ディレクトリの中に`cd`してから`node cli.js`を実行すると、`cwd + '.security-check'`が実在しない二重ネストパスになり、`verify`では「ファイルが見つからない」という誤検知（3/15 passed）、`install-gitleaks`ではバイナリの誤配置という、動作の種類によって症状が異なる形で現れた。

`README.md`で「`.husky`/`.github`と同じ『ツール領域』として扱ってください」と案内している以上、人間が`cd .security-check`してしまうのは十分にありうる導線であり、看過できない不具合と判断した。

### 4. 修正

`cli.js`に`assertRunFromProjectRoot()`を追加。このファイル自身の実の場所（`__filename`、cwdに依存しない）と、`cwd + '.security-check'`（各lib同様の期待値）を比較し、不一致なら以下のような分かりやすいエラーを出して即終了する。

```
❌ プロジェクトルート（.security-check/ の一つ上の階層）から実行してください
   現在地: /path/to/project/.security-check
   実行例: cd .. && node .security-check/cli.js <subcommand>
```

`--help`/`-h`はパスに触れないため、このガードより先に応答する（どこからでもヘルプは見られる）。

## 解決策

**実装場所**:
- `.security-check/cli.js`（ガード本体、ウィザード分岐）
- `.security-check/lib/prompt.js`（新規、対話プリミティブ）
- `.security-check/lib/wizard.js`（新規、メニュー本体）
- 上記すべて`patterns/setup-pattern/setup-securecheck/templates/.security-check/`にも同期済み

**主なポイント**:
1. `assertRunFromProjectRoot()`は`path`モジュールのAPIのみで実装しており、Windows上でも原理的には動作するはずだが、このセッションはLinux環境のため実機検証はできていない（大文字小文字を区別しないファイルシステムでの短縮パス等のエッジケースは未検証）
2. ウィザードは各lib（verify/install-gitleaks/uninstall）の既存インターフェース（`run(args)` → exit code）をそのまま呼ぶだけなので、ロジックの重複がない
3. 実地検証で「gitleaks除去→verifyが検知（13/15 passed, 1 failed）→ウィザードから復旧→15/15」という一連のフェイルクローズのループをユーザー自身の手で確認できた

## 学び

- **「ツール領域として扱ってください」という案内自体が、`cd`して中身を見に行く動線を誘発しうる**。CLIツールを単一フォルダに集約する設計（前回セッションの核心決定）は、フォルダの外からの単一エントリポイント実行を前提としているが、その前提を明示的にコードで守らないと、フォルダ自体が「実行される場所」として誤用されるリスクがある
- **`process.cwd()`基準の設計は、実行場所の一貫性をコード側で保証しない限り壊れる**。今回は「誤検知（verify）」と「誤配置（install-gitleaks）」という異なる症状で現れたため、どちらか一方の検証だけでは見逃していた可能性がある
- 疑似TTY（Python pty）による事前のワイヤーフレーム検証は、キー入力のエミュレーションまで含めて動作確認できるため、対話UIをユーザーに渡す前のスモークテストとして有効だった

## 今後の改善案

- Windows実機（またはコンテナ/CI）での`assertRunFromProjectRoot()`・`install-gitleaks`の動作検証（ユーザーより「時が来たら」との合意）
- `patterns/setup-pattern/docs-structure-and-securitycheck/setup-all.js`のv3対応（既存の申し送り事項、未着手のまま）

## 関連ドキュメント
- [前回セッションの申し送り](../letters/2026-07-12-11-34-59-setup-securecheck-v3-security-check-restructuring-complete.md)
- [v3構造化の計画ノート](./2026-07-12-10-15-49-setup-securecheck-v3-restructuring-plan.md)
- [v3構造化の実装ノート](./2026-07-12-11-28-11-setup-securecheck-v3-implementation.md)

---

**最終更新**: 2026-07-12
**作成者**: Claude
