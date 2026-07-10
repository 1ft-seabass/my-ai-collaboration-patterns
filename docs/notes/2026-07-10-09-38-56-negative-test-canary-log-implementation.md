---
tags: [setup-securecheck, verification-protocol, canary, pre-commit, security-verify]
---

# ネガティブテスト検証プロトコル実装（canaryログ + check#13） - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-10
**関連タスク**: 設計方針は [[2026-07-10-05-27-29-negative-test-verification-design]] で合意済み、本ノートはその実装記録

## 背景

過去5ヶ月の「存在確認 vs 動作確認」再発（詳細は [[2026-07-10-05-27-29-negative-test-verification-design]] 参照）のうち、「判定テーブルが集計数字だけを見て、ネガティブテストが実際に実行されたかを確認していない」という穴に対応する。「〜してください」という指示文だけでは同じ再発をするため、ネガティブテスト（Step 3.6.5）の実行を機械的に検証可能にした。

「カナリア」という比喩の意味と、check#11（gitleaks機能的カナリアテスト、gitleaksという道具単体を試す）との違い（今回はgit commit→pre-commitフック→simple-git-hooksという統合経路を試す、別のカナリアテスト）は、設計会話ノートで詳しく説明済み。

## 実装内容

### 1. pre-commit.js: canaryエントリの記録

`.test-secret-canary`（Step 3.6.5のネガティブテストが使うファイル名）がステージされているコミット試行を検知した場合、実行ログに通常のエントリと区別する `type: "canary"` を付与する。

```js
const CANARY_FILENAME = '.test-secret-canary';
// ...
isCanaryTest = staged.includes(CANARY_FILENAME);
// ...
writeLog(passed ? 'passed' : 'failed', isCanaryTest);
```

`writeLog`は`isCanary`が真の場合のみ`type: 'canary'`をログエントリに含める。通常のコミットのログ形式（`{timestamp, result, branch}`）は変えない。

### 2. security-verify.js: check#13「ネガティブテスト実行痕跡」

ログ履歴全体から`type === 'canary'`のエントリを探し、以下で判定する:

- `result: 'passed'`のcanaryエントリがある → ❌（カナリアがブロックされずコミットされた形跡＝pre-commitフックが機能していない可能性）
- `result: 'failed'`のcanaryエントリがある（かつpassedが無い）→ ✅（ネガティブテスト実行・ブロック成功を確認）
- どちらも無い → ⚠️ warning（ネガティブテストが一度も実行された形跡が無い）

ヘルスチェックの総項目数を12→13に変更（`setup-securecheck.md`内の`12/12`表記も`13/13`に統一）。

**実装場所**:
- `patterns/setup-pattern/setup-securecheck/templates/scripts/pre-commit.js` / `scripts/pre-commit.js`
- `patterns/setup-pattern/setup-securecheck/templates/scripts/security-verify.js` / `scripts/security-verify.js`
- `patterns/setup-pattern/setup-securecheck/setup-securecheck.md`（Phase 0判定基準・Step 3.6.5に説明追加）

## 検証

このリポジトリ自身で実際にStep 3.6.5のネガティブテストを実行し、エンドツーエンドで確認した:

1. 実行前: `npm run security:verify` → check#13が⚠️「実行された形跡がありません」
2. `.test-secret-canary`をステージして`git commit`実行 → secretlint・gitleaks両方が反応してブロック（コミット不成立を`git log`で確認）
3. `.logs/pre-commit.log`に`{"result":"failed","type":"canary",...}`が記録されたことを確認
4. 実行後: `npm run security:verify` → 13/13 passed、check#13が✅「ブロックされたことを確認」に変化
5. `git restore --staged .test-secret-canary && rm .test-secret-canary`でクリーンアップ

## 学び

- 「実施した」という自己申告・指示文の遵守を信じるのではなく、実施した際に**自動的に残る痕跡**（今回はログエントリ）の有無で判定する方が、集計数字ベースの判定より確実
- ネガティブテストのファイル名（`.test-secret-canary`）という「既に指示書に存在する具体的な識別子」を検知条件に使うことで、新しい設定や引数を増やさずに実装できた

## 関連ドキュメント

- [設計会話: A6方針転換とネガティブテスト検証プロトコル強化](./2026-07-10-05-27-29-negative-test-verification-design.md)
- [「握りつぶされていた」型の問題と対策](./2026-07-08-00-00-00-setup-securecheck-suppressed-tool-pattern.md)
- [再適用で見つかった2つの穴](./2026-07-08-00-00-01-setup-securecheck-reapply-idempotency-holes.md)

---

**最終更新**: 2026-07-10
**作成者**: AI (Claude) + 人間レビュー
