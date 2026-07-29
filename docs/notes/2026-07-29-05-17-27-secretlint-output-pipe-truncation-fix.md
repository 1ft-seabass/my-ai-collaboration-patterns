---
tags: [setup-securecheck, secretlint, pre-commit, bug-fix, pipe-buffer]
---

# secretlint出力のパイプ経由読み取り切り詰めによるコミット誤ブロックの修正 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-29
**関連タスク**: setup-securecheckパターンを導入した下流プロジェクトからのバグ報告対応、v3.0.1リリース

## 問題

ユーザーが、`setup-securecheck`パターン（`.security-check/lib/pre-commit.js`）を導入した別プロジェクトで、Bootstrap/jQueryのvendorファイル（57ファイル、合計約10MB）を一括コミットしようとした際に、secretlintの検出結果パースに失敗しコミットが誤ってブロックされる事象を報告してくれた。

```
❌ secretlint の出力を解析できませんでした（想定外のエラー）
```

少数のファイルでは再現せず、大量ファイル・大容量コミット時のみ発生していた。

## 調査・原因

ユーザー側で既に原因調査・再現条件の切り分けまで済ませた状態で報告があった。

`pre-commit.js`は`execSync`でsecretlintを呼び、戻り値の文字列としてJSON出力（`--format json`）を受け取っていた。

```js
// 修正前
output = execSync(`npx secretlint --format json ${files...}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
```

secretlintの`--format json`出力はスキャン対象ファイルの全文（`sourceContent`）を毎回含む仕様のため、対象ファイル数・サイズが増えると出力が数MB〜十数MBに達する。

ユーザーの調査により、この環境ではNode.jsの`execSync`/`execFileSync`が子プロセスの標準出力をパイプ経由で大量に読み取ると、`maxBuffer`の設定値に関わらず出力が途中（体感約210KB付近）で切れる現象が確認された（`npx`経由・直接バイナリ経由・シェル文字列経由のいずれでも再現する一方、シェルから直接`> file`にリダイレクトすると全量が正常に書き出される）。Node.js側のpipe capture実装、または環境固有の制約が疑われるが、根本原因の完全特定はできていない。

切り詰められた不完全なJSON文字列を`JSON.parse`しようとして例外になり、`parseFailed = true` → `secretlintOk = false`となってコミットがブロックされていた。フェイルクローズ（安全側）の挙動であり実際の情報漏洩ではなかったが、誤検知によりvendorファイルの一括コミットができない状態だった。

このリポジトリ自身（`.security-check/lib/pre-commit.js`）およびテンプレート側（`patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/pre-commit.js`）にも同一の実装があることを確認し、同じ修正を反映することにした。

## 解決策

gitleaks側が既に使っている「`--report-path`でファイルに書き出し`fs.readFileSync`で読む」パターンに倣い、secretlint側も`--output`でJSONを一時ファイルに書き出す方式に変更した。`execSync`の戻り値としてパイプ経由で受け取るのをやめたことで、出力サイズに関わらず安定して読み取れることを確認した。

**実装場所**: `.security-check/lib/pre-commit.js:136-158` および `patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/pre-commit.js` 同箇所

```js
// 修正後（要旨）
const secretlintReportPath = path.join(os.tmpdir(), `pre-commit-secretlint-report-${process.pid}.json`);
for (const files of chunk(secretlintScanTargets, 100)) {
  try {
    execSync(`npx secretlint --format json --output "${secretlintReportPath}" ${files...}`, { stdio: 'pipe' });
  } catch (e) {
    // secretlintは検出ありの場合exit code 1で終了するが、--output指定時はファイルには正常に書き出される
  }
  let output = '';
  try {
    output = fs.existsSync(secretlintReportPath) ? fs.readFileSync(secretlintReportPath, 'utf8') : '';
  } finally {
    try { fs.rmSync(secretlintReportPath, { force: true }); } catch (e) { /* ignore */ }
  }
  // 以降は既存のJSON.parseロジックをそのまま利用
}
```

**主なポイント**:
1. secretlintの`--output`フラグの存在は`npx secretlint --help`で確認してから使用した
2. デプロイ済みコピー（`.security-check/`）とテンプレート（`patterns/setup-pattern/setup-securecheck/templates/.security-check/`）は修正前後で内容が完全一致していることを`diff`で確認しながら進めた
3. 修正後のファイルをこのリポジトリで実際にステージし、`node .security-check/cli.js pre-commit`を実行して、secretlint・gitleaks双方のカナリア自己検証を含めて正常に通ることを確認した
4. VERSION/CHANGELOGを更新し、v3.0.1としてリリース

## 学び

- 子プロセスの出力をパイプ経由（`execSync`の戻り値）で受け取る実装は、出力サイズが大きくなる場面で環境依存の切り詰めリスクを持つ。`maxBuffer`を大きく設定しても防げない場合があり、確実性を求めるならファイル出力経由（`--output`/`--report-path`等のオプション）に統一する方が安全
- 本パターンではgitleaks側が先にこの問題（カナリア判定のプロセス追加起動回避）でファイル出力方式を採用済みだった。同じコードベース内で似た処理が異なる方式を取っている場合、非対称性自体が将来のバグの温床になりうる
- ユーザーが実環境で再現条件・原因切り分けまで行った上で報告してくれたため、AI側はソース確認・同一修正の反映・動作確認に専念できた

## 今後の改善案

- パイプ経由での子プロセス出力切り詰めの根本原因（Node.jsのバージョン/環境固有か）は未特定のまま。余裕があれば再現条件を最小構成で切り分け、Node.js側の既知issueかどうか確認してもよい
- gitleaks・secretlint以外にも同種のexecSync戻り値パース箇所がないか、`.security-check/lib/`全体を横断的に再点検する余地がある

## 関連ドキュメント
- [Windows実機検証で発見された2件のバグ修正](./2026-07-14-23-04-54-setup-securecheck-windows-verification-bugfixes.md)

---

**最終更新**: 2026-07-29
**作成者**: Claude
