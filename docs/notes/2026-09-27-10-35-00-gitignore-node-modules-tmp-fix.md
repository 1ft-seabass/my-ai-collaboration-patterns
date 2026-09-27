---
tags: [setup-securecheck, gitignore, windows, node_modules, idempotency]
---

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-27
**関連タスク**: setup-securecheckの`.gitignore`追記内容に`node_modules/`・`tmp/`を追加

## 問題

Windows実機での導入検証を2回行ったところ、いずれも`setup-local`実行後の`git status`で`node_modules/`と`tmp/`が未追跡ファイルとして表示され、そのままコミットしうる状態になっていた。都度AIが気づいて「Node.js標準的な`.gitignore`を追加しましょうか」と手動で提案・承認を得て対応していたが、これは`setup-local`の`.gitignore更新`ステップ（Step 4）が`.security-check/bin/`・`.security-check/logs/`のみしか追記しておらず、それ以外は対象外だったことが原因だった。

## 試行錯誤

### 検討: どこまで追加するか（高カロリーにしない線引き）

Node.js標準の`.gitignore`テンプレート（`.env`系、`dist/`・`build/`・`coverage/`等のビルド成果物、`.DS_Store`等のOSファイル）を丸ごと追加する案もあったが、これらはsetup-securecheck自身が原因を作っているものではなく、汎用的な「あった方が安全」止まりの提案になってしまう。

そこで判断軸を「setup-securecheck自身の動作が原因でリスクが生まれているか」に絞った:
- **`node_modules/`**: `install.js`が`package.json`が存在しない場合に`npm init -y`し、続けて`npm install -D`で`secretlint`等を導入する。この一連の動作自体が`node_modules/`を生み出す原因
- **`tmp/`**: `README.md`/`quickstart.md`が`npx degit ... ./tmp/security-setup`という導入コマンドを指示しており、この規約自体が`tmp/`を生み出す原因

この2つだけに絞り、それ以外の一般的なNode.js標準テンプレートは含めないことにした。

### アプローチA（成功）: 3箇所の同期修正

`.gitignore`への追記内容は`templates/gitignore.example`が正であり、以下2箇所が同一内容を持つ設計になっていることを確認した:
- `setup-local.js`の`GITIGNORE_BLOCK`（自動追記、Node.js経由の新しい導入フローで使用）
- `setup-securecheck.md`ステップ3.4（従来ウィザードで手動追記する内容として埋め込み）

この3箇所を同期して修正した。`setup-securecheck-3.0.2`（凍結スナップショット）には触れていない。

**主な変更**:
1. `templates/gitignore.example`に`node_modules/`・`tmp/`のセクションを追加
2. `setup-local.js`の`GITIGNORE_BLOCK`（単一の文字列）を`GITIGNORE_SECTIONS`（`{marker, block}`の配列）に変更し、`updateGitignore()`をセクションごとに`marker`の有無を個別チェックする実装に書き換えた
3. `setup-securecheck.md`ステップ3.4の埋め込みコピーも同内容に更新

### 冪等性の確認（テスト）

`setup-local`は「一度実行が中断されても再実行できる」ことを重視した設計のため、以下3パターンで動作確認した（`/tmp`に切り出した最小再現コードで実行）:

1. `.gitignore`が存在しない（新規プロジェクト）→ 3セクション全て追記
2. 既に3セクションとも追記済みの状態で再実行 → `SKIP`（何もしない）
3. 旧バージョンで`.security-check/bin/`・`.security-check/logs/`のみ追記済みのプロジェクトで再実行 → 不足していた`node_modules/`・`tmp/`の2セクションだけが追記される

いずれも想定通りの結果だった。

## 解決策

`.gitignore`への追記対象を「`.security-check/bin/`・`.security-check/logs/`」に加えて「`node_modules/`・`tmp/`」の計4項目とし、`setup-local.js`のチェックロジックを単一条件（AND）から項目ごとの個別チェックに変更した。

**実装場所**:
- `patterns/setup-pattern/setup-securecheck/templates/gitignore.example`
- `patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/setup-local.js`
- `patterns/setup-pattern/setup-securecheck/setup-securecheck.md`（ステップ3.4）

**主なポイント**:
1. 追加対象の判断基準は「setup-securecheck自身の動作（`npm init -y`／`./tmp/...`規約）が原因で発生するリスクか」であり、汎用的なNode.js標準テンプレート全部は意図的に含めていない
2. `GITIGNORE_SECTIONS`を配列化したことで、将来さらに項目を追加する場合も同じ形式で拡張でき、かつ既存プロジェクトの再実行時に不足分だけを補える
3. VERSION/CHANGELOGはバンプせず、既存の軽微な修正と同じ扱いとした

## 学び

- 同じ種類の見落とし（`.gitignore`不足）が2回連続で実機テスト中に発覚したことは、「AIがその場で気づいて提案する」运用に頼るのではなく、恒久的にコードへ組み込むべきというシグナルだった
- 「何でも足しておけば安全」ではなく、「このツール自身が原因を作っているか」という基準を明確にすることで、過剰な汎用テンプレート化を避けつつ、実際に発生した問題には対応できた
- 冪等性を持つ既存コードのチェック条件を変更する際は、「新しいバージョンでの新規実行」だけでなく「旧バージョンで途中まで進んだ状態からの再実行」も含めてテストする必要がある

## 今後の改善案
- 特になし

## 関連ドキュメント
- [verify.jsの実行ログ日付表示バグ修正の経緯](./2026-09-27-09-21-11-verify-log-date-timezone-fix.md)
- [verifyの人間検証ループと信頼契約の経緯](./2026-09-27-09-54-47-verify-human-loop-trust-contract.md)

---

**最終更新**: 2026-09-27
**作成者**: AI
