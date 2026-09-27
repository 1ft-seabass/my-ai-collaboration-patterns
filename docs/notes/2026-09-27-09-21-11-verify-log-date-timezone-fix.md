---
tags: [setup-securecheck, verify, timezone, bugfix, windows]
---

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-27
**関連タスク**: setup-securecheck v3.1.0のWindows実機検証で見つかった表示バグの修正

## 問題

Windows実機でのsetup-securecheck導入検証（`setup-local`実行）中、`verify --test-run`のヘルスチェック出力に以下の表示が現れた:

```
✅ 実行ログ — 最終実行: 2026-09-26 本日 (failed)
```

このセッションの他の全てのタイムスタンプ（ファイル更新時刻、ノート名、コミット時刻）は一貫して日本時間9/27を指しており、`verify.js`のこの表示だけ1日ズレて見えた。

## 試行錯誤

### 調査（コード確認）

`templates/.security-check/lib/verify.js`の該当箇所を確認:

```js
const date = new Date(last.timestamp);
const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
const dateStr = last.timestamp.slice(0, 10);  // ← ここ
```

- `daysDiff`（「本日」か「N日前」かの判定）は実経過ミリ秒で計算しているため、タイムゾーンに関係なく正しい（動作自体は壊れていない）
- 一方`dateStr`は、ログのタイムスタンプ（`pre-commit.js`で`new Date().toISOString()`により UTC で保存）の先頭10文字をそのまま切り出しているだけだった
- 日本時間（UTC+9）の朝方に実行すると、UTC側はまだ前日の日付になるため、表示だけ1日前にズレる

同じパターン（`.timestamp.slice(0, 10)`によるUTC日付切り出し）が`verify.js`内に他に4箇所あることも確認した（ネガティブテスト実行痕跡・自動カナリア自己検証の実行痕跡の表示）。

### 解決（成功）

`toLocalDateStr()`ヘルパーを追加し、5箇所すべての`.slice(0, 10)`をこのヘルパー呼び出しに置き換えた。

**コード例**:
```js
function toLocalDateStr(isoTimestamp) {
  const d = new Date(isoTimestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

動作確認（TZ環境変数を切り替えて同じISOタイムスタンプを変換）:
```
TZ=UTC        -> 2026-09-26
TZ=Asia/Tokyo -> 2026-09-27
```

## 解決策

`verify.js`にローカルタイムゾーン変換ヘルパーを追加し、実行ログ関連の日付表示をすべて置き換えた。

**実装場所**: `patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/verify.js`

**主なポイント**:
1. `daysDiff`（経過時間の判定）と`dateStr`（表示用の日付文字列）は別物であり、後者だけがタイムゾーン変換を必要としていた
2. 判定ロジックは元々正しかったため、`toLocalDateStr()`の追加と表示箇所の置き換えのみで対応（判定ロジックには手を入れていない）
3. VERSION/CHANGELOGはバンプせず、過去の軽微な修正（Windowsパス比較、worktree誤検知の修正など）と同じ扱いとした

## 学び

- 「経過時間の判定」（`Date.now() - date.getTime()`のようなミリ秒差分）はタイムゾーンに依存しないが、「表示用の日付文字列」（ISO文字列の先頭10文字切り出し等）はタイムゾーンに依存する。この2つは別物として扱う必要がある
- UTC+9圏（日本時間）のようなプラスオフセットのタイムゾーンでは、朝方の実行がUTC上ではまだ前日になるため、UTC決め打ちの日付表示は特に朝の時間帯で誤りが目立ちやすい
- 実機（Windows、日本時間環境）で動かして初めて発覚したバグであり、開発コンテナ（UTC想定）での検証だけでは見つからなかった

## 今後の改善案

- 特になし（今回の修正で表示の問題は解消。判定ロジック自体は元から正しい）

## 関連ドキュメント
- なし

---

**最終更新**: 2026-09-27
**作成者**: AI
