---
tags: [setup-securecheck, migration, idempotency, gitleaks, a6]
---

# A6実装: 既存導入プロジェクト向けの安全な再適用 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-10
**関連タスク**: 前セッション申し送りのA6。設計方針は [[2026-07-10-05-27-29-negative-test-verification-design]] で合意済み、本ノートはその実装記録

## 背景

設計会話（[[2026-07-10-05-27-29-negative-test-verification-design]]）で、A6を独立したマイグレーションガイド一式ではなく「既存のワンショット指示の再利用＋Phase 0への分岐追記」に転換する方針が決まった。加えてユーザーから「AI指示のブラッシュアップで冪等いけるのでは」という指摘を受け、`gitleaks.toml`がカスタマイズされている場合の手動パッチ部分も、AIの読み取り判断に委ねず決定論的スクリプトに置き換える追加提案が合意された。本ノートはその実装記録。

## 実装内容

### 1. 決定論的パッチスクリプト（新規）

`patterns/setup-pattern/setup-securecheck/templates/scripts/patch-gitleaks-toml.js` を新規作成。以下2点のみを機械的に行い、他の内容には一切触れない:

1. `[extend]` または `[[rules]]` が無い場合、`[extend]\nuseDefault = true\n` を追記
2. allowlist の `'''tmp/.*'''`（未アンカー）を `'''^tmp/.*'''` にアンカー

**設計判断**: TOMLパーサーを導入せず、正規表現による完全一致検出+追記のみで実装した。既存のカスタム内容（独自allowlist/rules）の構造を変えずに済み、依存も増えない。

### 2. Phase 0 への分岐追記

`setup-securecheck.md` のPhase 0判定基準に「既存導入プロジェクトで検出ルール0件バグに該当する場合」のセクションを追加:

```
1. gitleaks.toml が現在のテンプレートと完全一致するか diff で確認
2. 一致（未カスタマイズ）→ ステップ1.1の cp で上書きしてよい
3. 差分あり（カスタマイズ済み）→ 上書きせず patch-gitleaks-toml.js を実行
```

**実装場所**:
- `patterns/setup-pattern/setup-securecheck/templates/scripts/patch-gitleaks-toml.js`（新規）
- `patterns/setup-pattern/setup-securecheck/setup-securecheck.md`（Phase 0セクション）

## 検証

カスタム内容（独自allowlist・独自regex）を含み、かつ`[extend]`が欠落した`gitleaks.toml`を用意し、以下を確認した:

1. **1回目実行**: `[extend]`追加・`tmp/.*`アンカー化が行われ、カスタム内容（`my-custom-vendor-dir/.*`等）はそのまま保持される
2. **2回目実行（冪等性）**: 既に対応済みのため「変更なし」と表示され、1回目実行後の内容と完全に一致（diff無し）

## 学び

- 「手動パッチをAIに案内させる」という設計は、たとえPhase 0の分岐が正しくても、パッチ自体の実行精度がそのセッションのAIに依存する（揺れる層が残る）。決定論的スクリプトに置き換えることで、この最後の一歩まで「確実に動く層」に含められる
- TOMLの内容を丸ごとパースし直すのではなく、「必要な2箇所だけを正規表現で機械的に確認・追記する」という最小限のアプローチにしたことで、既存のカスタム内容を壊すリスクを抑えられた

## 関連ドキュメント

- [設計会話: A6方針転換とネガティブテスト検証プロトコル強化](./2026-07-10-05-27-29-negative-test-verification-design.md)
- [gitleaks検出ルール0件バグ修正 実装ノート](./2026-07-09-23-14-00-setup-securecheck-v2-0-2-gitleaks-fixes-implementation.md)

---

**最終更新**: 2026-07-10
**作成者**: AI (Claude) + 人間レビュー
