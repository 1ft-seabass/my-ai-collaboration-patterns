---
tags: [setup-securecheck, v3.1.0, install-js, scan, setup-local, pre-implementation]
---

# setup-securecheck v3.1.0 - install.js相当／scan／setup-local 着手前合意

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-24
**関連タスク**: [setup-securecheckの確定的チャンクと3層の証拠構造](./2026-09-23-23-13-19-setup-securecheck-deterministic-chunks-and-evidence-layers.md)の実装フェーズ

## 問題

前ノートで整理した設計（確定的チャンク②④⑤への命名＝install.js相当／scan／setup-local）を、実際にコードへ落とす前に、具体的な実装計画・バージョン方針・検証方針を確定させておく必要があった。

## 合意事項

### 1. 実装内容（3つ）

**① `patterns/setup-pattern/setup-securecheck/install.js`**（チャンク②の一部：1.1配置＋1.2/1.4インストール）
- `templates/`と同じ階層に配置（docs-structureのinstall.jsと同じ構造）
- 手順: 配置先の絶対パス出力 → `.secretlintrc.json`/`gitleaks.toml`/`.security-check/`を`copyRecursiveSkipExisting`で配置 → `package.json`が無ければ`npm init -y` → `secretlint`未導入なら`npm install -D`で追加 → 配置済みの`install-gitleaks.js`をrequireして呼び出し（車輪の再発明をしない） → 結果報告

**② `scan`サブコマンド**（チャンク②の一部：1.3/1.5の呼び出し統合）
- `templates/.security-check/lib/scan.js`を新設、`cli.js`に追加
- `--staged`（軽量）／`--all`（全ファイル＋全履歴）の2モード
- gitleaks呼び出しは既存の`findGitleaksBinary()`（`environment.js`）を再利用し、手順書で唯一OS別に書き分けていた箇所を解消
- 解釈（本物の漏洩か等）はコード化せず、生出力をAI/人間の判断に委ねる

**③ `setup-local`**（チャンク⑤：3.3〜3.6、フェイルクローズNode化含む）
- `templates/.security-check/lib/setup-local.js`を新設、`cli.js`に追加
- 手順: `npx simple-git-hooks`でフック有効化 → `.gitignore`に冪等に追記 → ネガティブテスト（Nodeでカナリア作成、実際に`git commit`を試みてブロックを確認、後片付け） → フェイルクローズ確認をNode化して保持（`fs.renameSync`＋`try/finally`でgitleaksバイナリを退避→`pre-commit`実行→必ず復元。[フェイルクローズ確認の理解とCIスタンスの整合](./2026-09-23-02-12-53-fail-close-check-and-ci-stance-alignment.md)の決定通り、手順から削除せずここに残す） → 最後に`verify --test-run`を呼んで締める（3層目の証拠）

### 2. バージョン方針

既存のサブコマンド（`verify`／`pre-commit`／`install-gitleaks`／`uninstall`）は一切変更せず、`cli.js`のディスパッチテーブルに新サブコマンドを追加するのみの**純粋な追加**とする。フェイルクローズのNode化も「`pre-commit.js`を書き換える」のではなく「`pre-commit.js`を外から（サブプロセスとして）呼んで結果を確認する」形にするため、保護ロジック自体には触れない。

骨子（`.security-check/`のディレクトリ構造、`cli.js`という単一エントリポイント、`verify`の15項目という契約、`pre-commit.js`の保護ロジック）は不変のため、**マイナーバージョンアップ（3.0.2 → 3.1.0）**とする。既存に導入済みの案件は、明示的に再取得しない限り今まで通り動き続ける（移行ガイド不要）。

### 3. 検証方針

事前にGitHubへのネットワーク到達性を確認済み（`curl -sI https://github.com` で200応答）。これにより③のgitleaks実バイナリを使った本物のネガティブテストも実施できる。

3つとも**このリポジトリ自身には一切触れない、隔離した一時ディレクトリでの非破壊検証**を行う。
- ①: 一時ディレクトリで実行し配置結果を確認（docs-structure版install.jsと同じ手法）
- ②: 一時ディレクトリに`git init`し合成シークレット（プレースホルダー的な偽トークン）を含むテストファイルをステージして検出を確認
- ③: 一時ディレクトリに`git init`＋`npm init`し、実際にgitleaksバイナリをダウンロードして、hook配線・ネガティブテスト・フェイルクローズ確認を本物の`git commit`で試す

**実装順は①→②→③**。各ステップの検証が完了してから次へ進む。

## 今後の改善案

- [ ] ①install.js相当の実装・検証
- [ ] ②scanサブコマンドの実装・検証
- [ ] ③setup-localの実装・検証（フェイルクローズNode化含む）
- [ ] 実装完了後、v1.3.0の`install.js`実装ノートと同じ形式で、v3.1.0の実装記録ノートを作成しこの合意ノートから参照する

## 関連ドキュメント

- [setup-securecheckの確定的チャンクと3層の証拠構造](./2026-09-23-23-13-19-setup-securecheck-deterministic-chunks-and-evidence-layers.md)
- [フェイルクローズ確認の理解とCIスタンスの整合](./2026-09-23-02-12-53-fail-close-check-and-ci-stance-alignment.md)
- [kit構想 Fableセッション原資](./2026-09-22-23-36-08-kit-vision-fable-session-source.md)
- [docs-structure v1.3.0のinstall.js実装の記録](./2026-09-23-12-05-25-docs-structure-v1.3.0-install-js-implementation.md)

---

**最終更新**: 2026-09-24
**作成者**: AI
