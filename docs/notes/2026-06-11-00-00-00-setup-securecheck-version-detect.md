---
tags: [setup-securecheck, version-detect, wizard, simple-git-hooks, security]
---

# setup-securecheck version-detect ウィザードの追加

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-06-11
**関連タスク**: setup-securecheck バージョン判定ウィザードの新規追加

## 問題

v1 / v2.0.0 / v2.0.1 と複数バージョンが存在するようになり、既存プロジェクトがどのバージョンを適用しているか判断しにくくなっていた。移行ガイドを使う前に「どこから移行するか」を特定するステップが必要だった。

## 解決策

`version-detect/` フォルダを独立して追加。スクリプト（確定的処理）とウィザード（案内ロジック）を役割分担させた。

**実装場所**:
- `patterns/setup-pattern/setup-securecheck/version-detect/scripts/detect-version.js`
- `patterns/setup-pattern/setup-securecheck/version-detect/version-detect.md`

### 設計判断：確定的処理はスクリプトに任せる

バージョン判定を AI のプロンプト判断に依存させると、ファイルの読み取り漏れや解釈のブレが起きうる。スクリプトにやらせることで判定が確定的になる。AI はスクリプトの出力を受け取って案内するだけでよい。

この構造は既存の `security-verify.js`（ヘルスチェック）+ ウィザードの関係と同じパターン。

### 判定ロジック（detect-version.js）

| 検出条件 | 判定 |
|---|---|
| `husky` or `.husky/` or `lint-staged` あり | v1 |
| `simple-git-hooks` あり + `pre-commit.js` に `secretlint "**/*"` | v2.0.0 |
| `simple-git-hooks` あり + `pre-commit.js` に `git diff --cached` | v2.0.1 |
| `simple-git-hooks` あり + それ以外 | v2.x-unknown |
| どれも該当なし | unknown |

`次のステップ` に移行ガイド名または `none` を出力するため、AI がそのまま案内に使える。

### 使い方

対象プロジェクトのルートで：

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck/version-detect/scripts tmp/securecheck-version-detect --force
node tmp/securecheck-version-detect/detect-version.js
```

## 学び

- **AI に判断させる部分と、プログラムに任せる部分を意識して分ける**。「どのバージョンか」は条件分岐が明確なのでスクリプト向き。「どう案内するか」はコンテキスト依存なのでウィザード向き。
- 既存パターン（`security-verify.js` + ウィザード）を踏襲することで、利用者が構造を直感的に理解しやすい。

## 関連ドキュメント

- [setup-securecheck パターン](../../patterns/setup-pattern/setup-securecheck/)
- [v2.0.0→v2.0.1 移行ガイド](../../patterns/setup-pattern/setup-securecheck/migration/MIGRATION_GUIDE_v2.0.0_to_v2.0.1.md)
- [v1→v2.0.1 移行ガイド](../../patterns/setup-pattern/setup-securecheck/migration/MIGRATION_GUIDE_v1_to_v2.0.1.md)

---

**最終更新**: 2026-06-11
**作成者**: AI (Claude) + 人間レビュー
