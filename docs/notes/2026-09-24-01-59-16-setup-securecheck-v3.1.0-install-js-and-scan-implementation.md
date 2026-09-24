---
tags: [setup-securecheck, v3.1.0, install-js, scan, verification]
---

# setup-securecheck v3.1.0 - install.js相当／scan実装

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-24
**関連タスク**: [setup-securecheck v3.1.0 着手前合意](./2026-09-24-00-12-39-setup-securecheck-v3.1.0-pre-implementation-agreement.md)の①②の実行編

## 問題

着手前合意ノートで決めた3つの実装（①install.js相当、②scan、③setup-local）のうち、①②を実装・検証する必要があった。

## 調査

`patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/verify.js`を読み込み、`verify --test-run`/`--simple`が既にsecretlint/gitleaksの実スキャンロジック（339〜423行目）を持っていることを確認した。ただし331-333行目に`if (results.failed > 0) { ...; return 1; }`という早期returnがあり、**15項目のヘルスチェックが1つでも失敗すると実スキャンに到達しない**ことをコードで確認した。これはkit構想原資が観測していた「verify --test-runは15項目が通らないとスキャンに進まない」という懸念の裏付けになった。hook未配線のPhase1段階ではverifyが使えないため、`scan`という独立した入口が必要という設計が正しいと確認できた。

## 解決策

### ① `patterns/setup-pattern/setup-securecheck/install.js`

- `templates/`と同じ階層に配置。コピー元は`__dirname/templates`、配置先は`process.cwd()`
- 手順: 配置先の絶対パス出力（cwd事故対策） → `.secretlintrc.json`/`gitleaks.toml`/`.security-check/`を`copyRecursiveSkipExisting`で配置 → `package.json`が無ければ`npm init -y` → `secretlint`未導入なら`npm install -D`で追加 → 配置済みの`install-gitleaks.js`をrequireして呼び出し（車輪の再発明をしない）
- `runOrAbort`ヘルパーで、npm系コマンド失敗時に実際のstderrを含めた分かりやすいエラーを出す（`setup-all.js`の同名関数と同じ設計）

### ② `scan`サブコマンド

- `templates/.security-check/lib/scan.js`を新設、`cli.js`のSUBCOMMANDSとヘルプに追加
- `--all`（全ファイル＋全履歴）／無指定（stagedのみ）の2モード
- gitleaks呼び出しは`environment.js`の`findGitleaksBinary()`を再利用し、手順書で唯一OS別に書き分けていた箇所（1.5）を解消
- secretlintは`--all`時`npx secretlint "**/*"`、staged時は`git diff --cached --name-only`で取得したファイルのみに絞って実行
- 検出結果の解釈はコード化せず、生出力をそのまま返す

## 検証結果

いずれも隔離した一時ディレクトリで、このリポジトリ自身には触れず検証した。ネットワーク到達性（GitHub）を事前確認済みで、実際のgitleaksバイナリ（v8.30.0）のダウンロードも含めて検証している。

**install.js（3パターン）**:
- 新規プロジェクト: 12ファイル作成、gitleaksバイナリの実ダウンロードまで成功
- 冪等性（2回目実行）: 全件SKIP、gitleaksもバージョン確認でスキップ
- 中断からの再開（既存の`.secretlintrc.json`・`package.json`あり）: 既存ファイルを一切上書きせず、不足分（`.security-check/`一式）のみ補完。`npm install`は既存`package.json`への追記として正しくマージされた

**scan（3パターン）**:
- クリーンな状態での`scan --all`: 検出0件
- stagedに合成シークレット（`ghp_...`形式）を仕込んだ状態での`scan`（無指定）: secretlint/gitleaks両方が検出、`--redact`で値も伏せられることを確認
- シークレットをコミット後に作業ツリーから削除した状態での`scan --all`: gitleaksが全履歴スキャンで正しく検出（secretlintは作業ツリーのみが対象のため0件、仕様通り）。`verify`のヘルスチェックが失敗する状態（hook未配線）でも`scan`は問題なく動作することも確認

## 学び

- `verify.js`の早期return（331-333行目）を実際にコードで確認したことで、「scanが独立して必要な理由」が推測ではなく実証された。決定事項の裏付けを、常にコードから取り直す価値を再確認した
- install.js/scanのどちらも、「既存のコード（`install-gitleaks.js`、`findGitleaksBinary()`、`copyRecursiveSkipExisting`のアルゴリズム）を車輪の再発明せず再利用する」という方針が、実装量を抑えつつ一貫性を保つ上で有効だった

## 関連ドキュメント

- [setup-securecheck v3.1.0 着手前合意](./2026-09-24-00-12-39-setup-securecheck-v3.1.0-pre-implementation-agreement.md)
- [setup-securecheckの確定的チャンクと3層の証拠構造](./2026-09-23-23-13-19-setup-securecheck-deterministic-chunks-and-evidence-layers.md)
- [docs-structure v1.3.0のinstall.js実装の記録](./2026-09-23-12-05-25-docs-structure-v1.3.0-install-js-implementation.md)

---

**最終更新**: 2026-09-24
**作成者**: AI
