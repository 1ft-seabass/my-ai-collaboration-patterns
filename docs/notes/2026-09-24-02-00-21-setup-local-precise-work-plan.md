---
tags: [setup-securecheck, setup-local, v3.1.0, fail-close, work-plan]
---

# setup-localの超精密作業計画

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-24
**関連タスク**: [setup-securecheck v3.1.0 着手前合意](./2026-09-24-00-12-39-setup-securecheck-v3.1.0-pre-implementation-agreement.md)の③（次セッションの本題）

> このノートは次セッション開始時に最初に読む前提で書かれています。①②（install.js相当／scan）は既に実装・検証完了済みです（[実装記録](./2026-09-24-01-59-16-setup-securecheck-v3.1.0-install-js-and-scan-implementation.md)参照）。

## 1. そもそもsetup-localとは何か（概要）

「かぶせ」層（マシンごと・cloneごとに再構築が必要な、gitignore領域の状態を作る1コマンド）に付けられた名前。手順書のPhase3（3.3〜3.6）に相当する、確定的チャンク⑤への命名。

「焼き込み＝repo」「かぶせ＝local」という対比からこの名前になった（`bootstrap`はCSSのBootstrapと混同、`resume`は新規初回に合わない、`init`はgit/npmの`init`と紛れるため却下された経緯がある）。

docs-structureには対応するものが存在しない（マシンローカルな状態を持たない構造的な理由）。setup-securecheckが持つ「gitleaksバイナリ（OS/アーキ別に5種、かつgit管理外）」「hook配線（`.git/hooks/`はgit管理対象外）」という、**templateをどれだけ強くしても原理的に埋まらないギャップ**を埋める役割を持つ。

### 関連ドキュメント
- [kit構想 Fableセッション原資](./2026-09-22-23-36-08-kit-vision-fable-session-source.md) — 2.1節（template/kit/setup-localの用語対比）、3.2節（setup-localの決定事項・名前の由来）
- [setup-securecheckの確定的チャンクと3層の証拠構造](./2026-09-23-23-13-19-setup-securecheck-deterministic-chunks-and-evidence-layers.md) — チャンク⑤としての位置づけ、確定的チャンク/判断の交互構造全体図
- [Node要否・実行主体・判断主体の地図](./2026-09-23-11-36-46-runtime-executor-judgment-axes-map.md) — setup-localがマシンローカルの復旧を担う理由（人間もAIもraw実行にはリスクが高すぎるため）

## 2. このあとやる方針

手順書のPhase3のうち、以下を`setup-local`サブコマンドに集約する。

- 3.1 simple-git-hooksインストール（`npm install -D simple-git-hooks`。install.js相当・setup-localのどちらにも入っていなかった漏れを、ここで拾う）
- 3.3 フック有効化（`npx simple-git-hooks`）
- 3.4 `.gitignore`更新
- 3.5 動作確認（テストコミット）
- 3.5.5-a/b ネガティブテスト（pre-commit全体のブロック確認、gitleaks単独確認）
- 3.5.5-c フェイルクローズ確認（**削除ではなくNode化して残す**。詳細は次節）
- 3.6 最終確認（`verify --test-run`）

実装順は「simple-git-hooksインストール → フック有効化 → gitignore → **フェイルクローズ確認** → **ネガティブテスト** → verifyで締め」。フェイルクローズ確認とネガティブテストの順序は当初「ネガティブテスト→フェイルクローズ確認」で考えていたが、`pre-commit.js`は呼び出しのたびに`autoCanary`ログを書くため、フェイルクローズ確認（gitleaks退避・何もステージしない状態）を最後にすると、直近ログが両検出器`skipped`のまま残り、`verify`のcheck#15（自動カナリア自己検証の実行痕跡）が直近コミットの状態を見て警告になり得る。**検出器が生きている状態の呼び出し（ネガティブテスト）を最後にすることで、直近ログを健全な状態にしてから`verify`を呼ぶ**、という順序に変更した。

検証は①②と同じ手法（隔離した一時ディレクトリで`git init`し、実際にgitleaksバイナリをダウンロードして本物の`git commit`を試す。このリポジトリ自身には一切触れない）。

### 関連ドキュメント
- [setup-securecheck v3.1.0 着手前合意](./2026-09-24-00-12-39-setup-securecheck-v3.1.0-pre-implementation-agreement.md) — 実装順・バージョン方針・検証方針の合意
- [setup-securecheck v3.1.0 install.js相当/scan実装](./2026-09-24-01-59-16-setup-securecheck-v3.1.0-install-js-and-scan-implementation.md) — 再利用できるヘルパーパターン（`copyRecursiveSkipExisting`、`runOrAbort`、`findGitleaksBinary`）

## 3. 認識が誤解しやすいポイントの再掲

このセッション中に何度か行き来した判断があるため、次セッションでの再混同を避けるために再掲する。

**a. フェイルクローズ確認（3.5.5-c）はsetup-localに含める**
当初（kit構想原資）は「手順から削除してパターンリポジトリ側のNodeテストへ移設」と決めていた。しかし実際に確認すると、移設先（パターンリポジトリ側のテスト）は**まだ影も形もない未着手のプラン**だったため、「`fs.renameSync`＋`try/finally`でNode化し、setup-localのフローにそのまま残す」に変更した。理由: (1) 案件ごとの`mv`退避・復元が事故の芽になるという除外理由は、Node化（`try/finally`で必ず復元）すれば解消する。(2) 「コードの性質なので案件ごとの再証明は冗長」という残る理由も、裏を返せば「毎回のsetup-local実行が、そのクローン先が受け取ったコードのバージョンでフェイルクローズが機能しているかをその都度実地で証明してくれる」という副次効果になる。パターンリポジトリ側テストへの移設可否は**別途判断のまま**（今回のスコープではない）。

**b. install.jsはsetup-localを内包しない**
install.jsは狭いスコープ（ファイル配置＋npm依存導入）のまま保つ。`verify`／`scan`も独立サブコマンドのまま。setup-localが「Phase 0〜3全体のオーケストレーター」になってしまうと、名前と実態がズレる。

**c. package.jsonのマージ（2.1/3.2）はsetup-localに含めない**
既存プロジェクトでは判断層（B分類）のまま残る。**setup-localは「package.jsonの`simple-git-hooks.pre-commit`設定が既に正しく書かれている前提」で、フックを「有効化」するだけ**（`npx simple-git-hooks`）。実装時は、`setup-all.js`が持つ`isEffectivelyCorrectPreCommitValue()`相当のチェックで、実行前に前提が満たされているか確認し、満たされていなければ分かりやすいエラーで止める設計にする（silentに壊れた状態へ進めない）。

**d. 判断の境界を削りすぎない**
コードに寄せすぎるとAIが現場の予期しない状況に適応できる柔軟さが失われる。setup-localも「確定的にできる部分だけ」に留め、全部を自動化しようとしない。

**e. バージョンはv3のまま（v4ではない）**
既存のサブコマンド（`verify`/`pre-commit`/`install-gitleaks`/`uninstall`）は一切変更せず、追加のみ。骨子（`.security-check/`構造、`cli.js`という単一エントリポイント、`verify`の15項目契約、`pre-commit.js`の保護ロジック）は不変。3.0.2 → 3.1.0のマイナーバージョンアップ。

### 関連ドキュメント
- [フェイルクローズ確認の理解とCIスタンスの整合](./2026-09-23-02-12-53-fail-close-check-and-ci-stance-alignment.md) — aの経緯の大元（フェイルクローズがコードの性質である理由、パターンリポジトリ側テストが未着手である発見）

## 4. 実際にやる予定の要点

### 実装対象ファイル
- `patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/setup-local.js`（新設）
- `patterns/setup-pattern/setup-securecheck/templates/.security-check/cli.js`（`setup-local`をSUBCOMMANDSとヘルプに追加）

### `setup-local.js`の内部手順（案）

1. **simple-git-hooksインストール**: `package.json`に`simple-git-hooks`が devDependencies に無ければ`npm install -D simple-git-hooks`（install.js相当・setup-localのどちらにも実装されていなかった漏れ。ここで拾う）
2. **前提チェック**: `package.json`の`simple-git-hooks.pre-commit`が`node .security-check/cli.js pre-commit`と実質一致するか確認（`setup-all.js`の`isEffectivelyCorrectPreCommitValue()`と同じロジックを移植。`require`で共有はできないので実装をコピーする）。満たされていなければ、何をpackage.jsonに書くべきか具体的に示してエラー終了
3. **フック有効化**: `npx simple-git-hooks`を実行
4. **`.gitignore`更新**: `templates/gitignore.example`の内容が含まれていなければ追記（冪等。既に含まれていればスキップ）
5. **フェイルクローズ確認**（3.5.5-c相当、Node化）:
   - `fs.renameSync`で`.security-check/bin/gitleaks`を`.bak`に退避
   - `node .security-check/cli.js pre-commit`をサブプロセス実行
   - 期待: ブロックされ、出力に「フェイルクローズ方針によりコミットをブロックします」が含まれる
   - `try/finally`で必ず`.bak`を元に戻す（既存のcanary後片付けパターンと同じ設計）
6. **ネガティブテスト**（3.5.5-a/b相当、**最後に実行**）:
   - Node.jsで`.test-secret-canary`ファイルを書く（`echo`は使わない。観測eの再発防止）
   - `git add`でステージ
   - `git commit`を試みる（`execSync`、失敗を期待）
   - 期待: ブロックされる（非ゼロexit）。出力に`=== secretlint ===`と`=== gitleaks ===`の両方が含まれることを確認
   - gitleaks単独確認: ステージしたまま`gitleaks git --staged ...`を直接実行し`exit code 1`を確認
   - 後片付け: `git restore --staged`＋ファイル削除（`try/finally`で確実に）
   - **この呼び出しが直近の`pre-commit.log`エントリになるため、`autoCanary`が両方`ok`で記録され、次のverifyがcheck#15で健全な状態を見ることになる**
7. **最終確認**: `node .security-check/cli.js verify --test-run`を呼び出して締める（3層目の証拠。ここで15/15になることを最終的な合格ラインとする）

### 検証方法
- 隔離した一時ディレクトリで`git init`→`install.js`実行→`package.json`に`simple-git-hooks`設定を手動追記（テストのための前準備、本来は判断層でAIが行う部分）→`setup-local`実行→上記5・6が正しく機能することを確認
- このリポジトリ自身には一切触れない

## 関連ドキュメント（全体）

- [setup-securecheck v3.1.0 着手前合意](./2026-09-24-00-12-39-setup-securecheck-v3.1.0-pre-implementation-agreement.md)
- [setup-securecheck v3.1.0 install.js相当/scan実装](./2026-09-24-01-59-16-setup-securecheck-v3.1.0-install-js-and-scan-implementation.md)
- [setup-securecheckの確定的チャンクと3層の証拠構造](./2026-09-23-23-13-19-setup-securecheck-deterministic-chunks-and-evidence-layers.md)
- [フェイルクローズ確認の理解とCIスタンスの整合](./2026-09-23-02-12-53-fail-close-check-and-ci-stance-alignment.md)
- [kit構想 Fableセッション原資](./2026-09-22-23-36-08-kit-vision-fable-session-source.md)

---

**最終更新**: 2026-09-24
**作成者**: AI
