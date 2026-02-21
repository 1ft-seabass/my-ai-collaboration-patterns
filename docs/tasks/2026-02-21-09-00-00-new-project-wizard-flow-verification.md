---
tags: [setup-securecheck, wizard, new-project, phase0-skip, verification]
status: open
priority: high
---

# TASK: 新規プロジェクトでの完全なウィザードフロー検証

> **⚠️ 機密情報保護ルール**
>
> このタスクに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-02-21
**状態**: Open
**優先度**: High
**推定時間**: 2-3h

## 概要

setup_securecheck を新規プロジェクトに適用し、Phase 0 がスキップされて Phase 1 から順に進む完全なウィザードフローを検証する。

## 背景・理由

### これまでの経緯

1. **既存プロジェクトでの実戦テスト成功**（2026-02-12）
   - Phase 0: 10/11 passed → Phase 2 へ直行
   - 既存設定を検出して適切にスキップできることを確認
   - 偽陽性問題の完全解消を検証済み

2. **次のステップ**
   - 既存プロジェクトでは検証できなかった「Phase 0 スキップ → Phase 1 から順に進む」パターンの検証
   - ウィザード全体の動作を確認
   - Phase 1 → Phase 2 → Phase 3 → Phase 4 の完全なフロー

### なぜ新規プロジェクトでの検証が必要か

- **Phase 0 のスキップ判定が正しく動作するか**
  - 設定ファイルが存在しない場合に Phase 1 へ進むか
  - スキップ理由が明確に表示されるか

- **Phase 1（初動スキャン）の動作確認**
  - secretlint + gitleaks でのスキャン
  - 検出結果の表示と対処フロー

- **Phase 2-4 の連続した流れ**
  - 設定ファイルのコピー
  - npm scripts の追加
  - ツールのインストール
  - pre-commit フックの設定

- **ガイドの指示網羅度の最終確認**
  - ウィザード全体を通した AI の判断が適切か
  - ユーザー確認が必要な箇所で適切に停止するか

## 確認項目・チェックリスト

### Phase 0: ヘルスチェック
- [ ] 新規プロジェクトで Phase 0 を実行
- [ ] "0/11 passed" などの結果が表示される
- [ ] Phase 1 へ進む判断が適切

### Phase 1: 初動スキャン
- [ ] secretlint でのスキャン実行
- [ ] gitleaks でのスキャン実行（またはスキップ判断）
- [ ] 検出結果の表示と対処方法の提示

### Phase 2: 設定ファイルのコピー
- [ ] `.secretlintrc.json` のコピー
- [ ] `gitleaks.toml` のコピー
- [ ] `.gitignore` への追記

### Phase 3: npm scripts とスクリプトファイルの追加
- [ ] `scripts/` ディレクトリの作成
- [ ] `security-verify.js` のコピー
- [ ] `install-gitleaks.js` のコピー
- [ ] `pre-commit.js` のコピー
- [ ] package.json への npm scripts 追加

### Phase 4: ツールのインストール
- [ ] secretlint のインストール
- [ ] lint-staged のインストール
- [ ] husky のインストール
- [ ] gitleaks のインストール（または後回し判断）

### Phase 5: pre-commit フックの設定
- [ ] husky の初期化
- [ ] `.husky/pre-commit` の作成
- [ ] フックの動作確認

### Phase 0: 最終ヘルスチェック
- [ ] 再度 Phase 0 を実行
- [ ] "11/11 passed" の確認
- [ ] テストラン（security:verify:testrun）の実行

### ガイド指示網羅度の確認
- [ ] ウィザード開始時の全体提示
- [ ] 各 Phase での実行結果報告
- [ ] 重要な判断時のユーザー確認
- [ ] 既存設定の尊重（新規なので該当なし）
- [ ] ヘルスチェック完了後のテスト実行

## 関連ドキュメント

- [申し送り: 既存プロジェクト実戦テスト完了](../letters/2026-02-12-15-30-00-existing-project-field-test-complete.md) - このタスクが作られた経緯
- [Note: 既存プロジェクト実戦テスト成功](../notes/2026-02-12-15-30-00-existing-project-field-test-success.md) - 既存プロジェクトでの検証結果
- [申し送り: 偽陽性問題修正](../letters/2026-02-09-18-40-00-security-verify-false-positive-fixed.md) - ヘルスチェック修正の経緯
- [ウィザード手順書](../../patterns/setup-pattern/setup_securecheck/setup_securecheck.md) - AI が実行するメイン文書

## 作業ログ

- 2026-02-21 09:00: タスク作成（前回申し送りから持ち越し）

## 完了条件

以下の全てが確認できたら完了とする。

- [ ] 新規プロジェクトで Phase 0 → Phase 1 → Phase 2-5 の完全なフローが動作
- [ ] 最終的に "11/11 passed" を達成
- [ ] テストラン（security:verify:testrun）が正常に動作
- [ ] ガイド指示網羅度が 9/10 以上
- [ ] 検証結果を docs/notes に記録
- [ ] 発見した問題があれば修正・コミット

---

## 完了時の記入

**完了日**:
**実際の作業時間**:
**成果物**:

**学び**:
