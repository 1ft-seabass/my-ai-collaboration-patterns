---
tags: [docs-structure-and-securitycheck, setup-securecheck, v3, setup-all, idempotency]
---

# docs-structure-and-securitycheck統合インストーラーのv3対応 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-19
**関連タスク**: `patterns/setup-pattern/docs-structure-and-securitycheck/setup-all.js`のv3化（前回・前々回申し送りから持ち越されていた既知のギャップ）

## 問題

`setup-securecheck`は既に`.security-check/`への集約・`cli.js`単一エントリーポイント化（v3.0.0）を完了していたが、`docs-structure`とのセット導入を担う統合インストーラー`docs-structure-and-securitycheck/setup-all.js`は旧`scripts/`レイアウト（`bin/gitleaks`、`scripts/security-verify.js`等、`security:*`/`secret-scan:*`という6個のnpm scripts）を前提にしたロジックのままだった。このままでは統合インストーラー経由の新規導入がv2相当のファイル配置になってしまい、v3の`setup-securecheck.md`の案内と食い違う状態だった。

## 解決策

### 変更点

**実装場所**: `patterns/setup-pattern/docs-structure-and-securitycheck/setup-all.js`

1. **バージョン検出ロジックを刷新**: 旧`detectHookVersion()`（v2.0.0/v2.0.1/v2.x-unknownを細かく区別）を廃止し、`.security-check/lib/environment.js`の`detectLegacyV1()`/`detectLegacyV2()`と同一のロジックをインライン実装。v1（husky/lint-staged）・v2（`.security-check/`が無く旧`scripts/pre-commit.js`が存在）のどちらを検出しても**自動移行はせず中断**し、既存の移行ガイド（`MIGRATION_GUIDE_v2.1.0_to_v3.0.0.md`・`migrate-to-v3.sh`）取得コマンドを案内するようにした
2. **`.security-check/`丸ごと差分コピー**: 旧`scripts配置`ステップ（`scripts/security-verify.js`等を個別に`copyIfMissing`）を廃止し、`docs/`と同じ`copyRecursiveSkipExisting()`で`.security-check/`（`cli.js`+`lib/*.js`+`README.md`）をファイル単位で差分コピーする方式に変更
3. **npm scripts**: `REQUIRED_SCRIPTS`を6キー（`security:verify`等）から`{ security: 'node .security-check/cli.js' }`の1キーに削減
4. **`simple-git-hooks.pre-commit`の期待値・判定**: `node scripts/pre-commit.js` → `node .security-check/cli.js pre-commit`に変更。`isEffectivelyCorrectPreCommitValue()`の判定も`.includes('pre-commit.js')`から`/\.security-check\/cli\.js/.test(value)`に変更（新しい値は`pre-commit.js`という文字列を含まないため、旧判定のままだと誤ってFIXED扱いになる不具合を実装中に発見・修正）
5. **gitleaksバイナリパス**: `bin/gitleaks(.exe)` → `.security-check/bin/gitleaks(.exe)`。インストール呼び出しも`node scripts/install-gitleaks.js` → `node .security-check/cli.js install-gitleaks`
6. **`.gitignore`パターン**: `bin/`/`.logs/`（別々のコメント）→ `.security-check/bin/`/`.security-check/logs/`（テンプレート`gitignore.example`と同じ単一コメント）
7. **インストーラー自身のログの置き場所を変更**: `.logs/setup-all.log` → `.security-check/logs/setup-all.log`。旧パスのままだと、新しい`.gitignore`パターン（`.security-check/logs/`のみ）ではカバーされない新規の`.logs/`ディレクトリが作られてしまい、`setup-all.log`が誤ってコミットされうる状態になることに気づき、`setup-securecheck`本体の実行ログ（`pre-commit.log`）と同じ`.security-check/logs/`配下に統一した

**実装場所（README）**: `patterns/setup-pattern/docs-structure-and-securitycheck/README.md`の「自動化する部分・しない部分」表・実行ログ節・ログ例を上記の変更に合わせて更新

### 検証方法

このサンドボックス環境はGitHubへのネットワーク到達性はあるが、`setup-all.js`内部の`npx degit`は**push済みのGitHub側**を取得するため、ローカルの未pushな変更を含めた真のE2E検証はできない。そこで、`npx`をラップする一時的なフェイクバイナリ（`degit <src> <dest>`呼び出しだけをこのリポジトリのローカルパスへの`cp -r`に差し替え、それ以外の`npx`呼び出し・`npm install`・gitleaksのGitHubリリースからのダウンロードは実物のまま通す）を用意し、`/tmp`配下の使い捨てディレクトリで以下6パターンを確認した。

1. 新規リポジトリへの一発導入 → `git commit`後の`node .security-check/cli.js verify`で14/15 passed, 1 warning（残り1件はネガティブテスト未実施の想定通りの警告）
2. 同じディレクトリへの再実行 → 全項目SKIP（完全な冪等性）
3. husky検出（v1）→ 中断＋v1移行ガイド案内
4. 旧`scripts/`レイアウト検出（v2）→ 中断＋v2→v3移行ガイド案内
5. `--no-hooks`指定 → フック未登録、`.gitignore`のみ反映
6. 壊れた`gitleaks`バイナリ・`simple-git-hooks.pre-commit`に`|| true`が混入した値 → 両方ともFIXEDカテゴリで自己修復

**主なポイント**:
1. `isEffectivelyCorrectPreCommitValue()`の判定文字列を機械的に置換しただけでは通らない（新しい値が旧判定条件の部分文字列を含まなくなっていた）ことを、ローカル検証の過程で発見・修正できた
2. インストーラー自身のログ置き場所（`.logs/`）が新しい`.gitignore`設計から漏れるという問題も、ローカル検証時に手を動かして初めて気づいた（表面上のコード書き換えだけでは見落としていた）
3. `npx degit`を伴う機能は「ローカルロジックの検証」と「実ネットワーク経由の実地検証」を明確に分けて考える必要がある。今回は前者のみ完了し、後者はpush後の課題として残した

## 学び

- 統合インストーラーのような「複数パターンを横断してデグレを踏みやすい」コードは、片方のパターン（`setup-securecheck`）だけをv3化して終わりにすると、もう片方の消費者（`setup-all.js`）が古いレイアウト前提のまま取り残される。パターン間の依存関係を意識し、変更のたびに「このパターンを内部で参照している他のパターンはないか」を確認する必要がある
- 冪等性判定ロジック（`isEffectivelyCorrectPreCommitValue`等）を変更する際は、判定に使っている文字列パターン自体が新しい期待値の変化で成立しなくなっていないか、実際にコードを動かして確認するべき。レビューだけでは見逃しやすい
- ネットワーク越しの取得（`npx degit`）を含むスクリプトをローカルで検証する際は、フェイクバイナリでネットワーク依存部分だけを差し替える手法が有効。ただし「本物のネットワーク経路の検証」は別途必要であることを常に明示し、検証したことにしない

## 今後の改善案

- 今回の変更をpushした後、実際に`npx degit`経由で新規/既存リポジトリに対して実地検証すること（前回のsetup-securecheck単体のWindows実機検証と同様の「ウィザード的な」最終確認が必要）
- 余裕があれば、この検証手順（フェイクnpxラッパーによるローカル擬似実行）をスクリプト化しておくと、次回同様の統合インストーラー変更時に再利用できる

## 関連ドキュメント
- [前回申し送り: setup-securecheck v3ウィザード追加・実地検証完了](../letters/2026-07-12-13-01-39-setup-securecheck-v3-wizard-and-live-verification.md)
- [setup-securecheck Windows実機検証で発見された2件のバグ修正](./2026-07-14-23-04-54-setup-securecheck-windows-verification-bugfixes.md)

---

**最終更新**: 2026-07-19
**作成者**: Claude
