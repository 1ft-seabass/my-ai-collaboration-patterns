---
tags: [setup-securecheck, migration, esm, husky, bug-fix]
---

# v1→v3.0.0直行移行ガイド新設とtype:moduleバグ修正 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-08-02
**関連タスク**: 別セッションでのsetup-securecheck v1→v3移行作業（v1→v2バージョンアップ指示書が機能せずv2をスキップしてv3へ移行）を受けた観測・裏取り・修正、v3.0.2リリース

## 問題

ユーザーが、別プロジェクトでsetup-securecheckのv1→v2バージョンアップ指示書がうまく機能せず、v2をスキップしてv3へ直接移行する対応を実施した、という報告を受けた。報告は以下6項目の「想定外で対応したポイント」としてまとめられていた。

1. v2.0.1向けテンプレート（`pre-commit.js`等）がアップストリームから既に削除済み
2. `"type": "module"`のプロジェクトでCommonJS製の`.security-check/cli.js`が`require`エラー
3. `.husky/`削除後、npm操作中に`prepare: husky`スクリプトが残骸(`.husky/_/pre-commit`)を再生成
4. 既存`.gitleaks.toml`（ドット付き）がツール期待値`gitleaks.toml`と不一致、かつ検出ルール0件
5. グローバル`gitleaks`が入っておりローカル未導入でもフェイルクローズを再現できない
6. 作業用`tmp/`が`.gitignore`未登録

このリポジトリ（`setup-securecheck`パターンの本体）側に同種の欠陥が残っていないか、6項目それぞれを実際に再現・検証した。

## 調査・原因

### 項目ごとの判定

各項目をこのリポジトリの現在の状態に対して実際に検証した結果:

| # | 判定 | 根拠 |
|---|---|---|
| 1 | **確認済みの実バグ**（ガイド破損） | `templates/scripts/`を`ls`すると`patch-gitleaks-toml.js`しか残っておらず、`MIGRATION_GUIDE_v1_to_v2.0.1.md` Step 4が参照する`pre-commit.js`等はv3再構成で既に削除済み。今すぐ試しても必ず失敗する |
| 2 | **確認済みの実バグ**（移行に限らず新規導入でも発生） | `/tmp`にESM（`"type": "module"`）のダミープロジェクトを作り`.security-check/`をコピーして`node .security-check/cli.js verify`を実行 → `require is not defined in ES module scope`で即死することを再現 |
| 3 | **おそらく実バグ**（ガイドの記述漏れ） | `migrate-to-v2.sh`とガイドStep 3.1は`"husky:install": "husky"`の削除にしか触れておらず、husky標準の`"prepare": "husky"`の削除手順が存在しない |
| 4 | 判定不能・保留 | このリポジトリの過去バージョンにドット付き命名(`.gitleaks.toml`)を使っていた根拠が見当たらず、その案件固有の可能性が高いと判断 |
| 5 | パターンの欠陥ではない | フェイルクローズの検証手法（グローバルgitleaksが検証を妨げる）の話であり、パターン自体の不具合ではない |
| 6 | パターンの欠陥ではない | その案件のプロジェクト管理（`tmp/`の`.gitignore`登録漏れ）の話 |

### 項目1の詳細

`version-detect/scripts/detect-version.js`は今もv1検出時に`MIGRATION_GUIDE_v1_to_v2.0.1.md`へ誘導する設定になっていたが、そのStep 4は
```bash
npx degit .../templates/scripts ./tmp/securecheck-v2-scripts
cp tmp/securecheck-v2-scripts/pre-commit.js scripts/
```
を実行する内容。v3.0.0のリポジトリ構造集約（`.security-check/`への集約）時に、v2向けの`scripts/pre-commit.js`等のテンプレートファイルは`templates/scripts/`から削除され、`.security-check/lib/`へ移設済みだった。このコピー元パスがもう存在しないため、v1→v2.0.1の中間移行はStep 4で必ず失敗する状態になっていた。ユーザーが「Step4を省略してv3ガイドに直行」した対応は、この破損への正しい回避策だった。

### 項目2の詳細

`.security-check/cli.js`はCommonJS（`require('path')`等を使用）だが、host側の`package.json`に`"type": "module"`があると、Node.jsは同ディレクトリ以下の`.js`拡張子ファイルをESMとして解釈しようとする。`.security-check/`にはこれをCommonJSと明示する`package.json`が存在しなかった。

再現手順:
```bash
mkdir /tmp/esm-test && cd /tmp/esm-test
echo '{ "name": "esm-test", "type": "module" }' > package.json
cp -r <repo>/patterns/setup-pattern/setup-securecheck/templates/.security-check .
node .security-check/cli.js verify
# → ReferenceError: require is not defined in ES module scope
```

### 項目3の詳細

`"prepare": "husky"`をpackage.jsonに残したまま`npm uninstall husky`した状態で改めて`npm install`を実行すると`sh: 1: husky: not found`で失敗することを、スクラッチのv1相当プロジェクト（git init + husky/lint-staged導入 + `.husky/`作成）で再現・確認した。ユーザーの報告は「`.husky/`が再生成される」という症状だったが、この環境では代わりに`npm install`自体が失敗する形で再現した（npmバージョンによって挙動が異なる可能性があるが、いずれも`"prepare": "husky"`の残留が原因という点は同じ）。先に`prepare`エントリを削除しておけば、以降の`npm install`は正常終了することも確認した。

## 解決策

### 項目2の修正

**実装場所**: `.security-check/package.json`（新規）、`patterns/setup-pattern/setup-securecheck/templates/.security-check/package.json`（新規）

```json
{
  "type": "commonjs"
}
```

Node.jsは最も近い`package.json`を見てディレクトリ単位でモジュール形式を判定するため、`.security-check/`直下にこのファイルを置くだけでhost側の`"type": "module"`設定から独立してCommonJSとして解決される。新規導入（`cp -r`）・v2→v3移行（`migrate-to-v3.sh`）のどちらでもディレクトリごとコピー/配置されるため、追加の手順は不要。

### 項目1・3の修正（v1→v3直行ガイドの新設）

方針として、v1→v2.0.1という中間ステップ自体が既に死んでいるため延命せず、**v2を経由しない直行の移行ガイドを新設**することにした（v2運用中のプロジェクトへの影響は無い。v2.x→v3.0.0の既存移行ガイドはそのまま維持）。

**削除**:
- `migration/MIGRATION_GUIDE_v1_to_v2.0.1.md`
- `migration/migrate-to-v2.sh`

**新設**:
- `migration/MIGRATION_GUIDE_v1_to_v3.0.0.md` — v1(husky+lint-staged)から`.security-check/`集約構成へ直行するガイド。Step 2で「npm操作より前に`"prepare": "husky"`等のhusky関連scriptsを削除する」手順を明記（項目3の対応）
- `migration/migrate-to-v3-from-v1.sh` — `npm uninstall husky lint-staged` → `npm install -D simple-git-hooks` → `.husky/`削除 → `.security-check/`配置、を機械的に行うスクリプト

**案内先の更新**（6箇所、すべて`MIGRATION_GUIDE_v1_to_v2.0.1.md` → `MIGRATION_GUIDE_v1_to_v3.0.0.md`に張り替え）:
- `version-detect/scripts/detect-version.js`
- `version-detect/version-detect.md`
- `README.md`
- `setup-securecheck.md`
- `.security-check/lib/verify.js`（実動コピー）
- `patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/verify.js`（テンプレート）

**主なポイント**:
1. 新スクリプト`migrate-to-v3-from-v1.sh`は、スクラッチのv1相当プロジェクト（git init + husky/lint-staged導入）を用意して実際にエンドツーエンドで実行し、想定通り`.security-check/`が配置されることを確認した
2. デプロイ済みコピーとテンプレートは修正後も`diff`で完全一致することを確認
3. `docs/notes`・`docs/letters`配下の過去の記録（古いガイド名への言及を含む）は、過去の記録を書き換えない方針のため変更していない
4. 修正後、このリポジトリ自身で`node .security-check/cli.js verify`を実行し15/15 passすることを確認

## 学び

- リポジトリ構造を大きく変更する際（v3でのscripts/→.security-check/集約など）、その構造変更の対象になったファイルを直接参照している「他の移行ガイド」が連鎖的に壊れていないか、変更時点で横断的に確認する必要がある。今回は変更から約3週間後に、実際にv1ユーザーが踏んでから発覚した
- `"type": "module"`は、CommonJS前提で書かれたツール一式を配布するパターンにとって共通のリスク要因になりうる。配布物側のディレクトリに`package.json`で明示的にモジュール形式を固定しておくと、host側の設定に依存しない防御になる
- npmのライフサイクルスクリプト（`prepare`等）は、対象パッケージ（今回はhusky）をアンインストールしただけでは自動的に無害化されない。ツールの入れ替えを行うマイグレーションでは、旧ツールが登録したライフサイクルスクリプトの削除を明示的な手順として持つ必要がある
- ユーザーが実地で遭遇し原因調査まで済ませた報告（6項目）は、そのまま鵜呑みにせず一つずつ現在のリポジトリ状態に対して再現・裏取りすることで、パターン本体の欠陥（項目1・2・3）とその案件固有の事情（項目4・5・6）を正しく切り分けられた

## 今後の改善案

- 項目4（`.gitleaks.toml`ドット付き命名）は保留とした。もし他の案件でも同様の報告があれば、legacy命名として`patch-gitleaks-toml.js`側でリネーム対応を検討する余地がある
- v2.x→v3.0.0の移行ガイド（`MIGRATION_GUIDE_v2.1.0_to_v3.0.0.md`）についても、将来的な構造変更時に同様の連鎖破損が起きないよう、リリース手順に「既存の移行ガイドが参照しているファイルパスの生存確認」を組み込むことを検討してもよい

## 関連ドキュメント
- [secretlint出力のパイプ経由読み取り切り詰めによるコミット誤ブロックの修正](./2026-07-29-05-17-27-secretlint-output-pipe-truncation-fix.md)

---

**最終更新**: 2026-08-02
**作成者**: Claude
