# setup-securecheck バージョン検出ウィザード（AI 向け指示書）

<!-- ============================================================
  このファイルは AI が読むウィザード指示書です
  ============================================================ -->

## このガイドの目的

プロジェクトに適用されている setup-securecheck のバージョンを検出し、
必要であれば適切な移行ガイドに案内します。

**バージョン判定はスクリプトが確定的に行います。AI は結果を受け取って案内するだけです。**

---

## 📋 この指示書の理解チェック

作業を開始する前に、以下の手順を理解したことをチェックボックスで提示してください：

- [ ] Step 1: detect-version.js をプロジェクトルートで実行する
- [ ] Step 2: 出力された「次のステップ」に従って案内する

### 重要ルール
- [ ] バージョン判定はスクリプトの出力を信頼する（AI が独自に判断しない）
- [ ] コミットは実行しない

理解できましたか？ゴーサインをください。

---

## Step 1: バージョン検出スクリプトを実行

**対象プロジェクトのルートディレクトリ**で以下を実行してください。

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck/version-detect/scripts tmp/securecheck-version-detect --force
```

```bash
node tmp/securecheck-version-detect/detect-version.js
```

出力例：
```
🔍 setup-securecheck バージョン検出
=====================================

検出バージョン : v2.x（旧 scripts/ レイアウト）
判定根拠       : simple-git-hooks あり / scripts/pre-commit.js を直接呼ぶ旧レイアウトを検出（.security-check/ 未導入）
次のステップ   : MIGRATION_GUIDE_v2.1.0_to_v3.0.0.md

=====================================
```

---

## Step 2: 結果に応じた案内

`次のステップ` の値を確認し、以下に従って案内してください：

| 検出バージョン | 次のステップ | 案内内容 |
|---|---|---|
| `v3.0.0` | `none` | ✅ 最新バージョンです。移行不要。 |
| `v2.x（旧 scripts/ レイアウト）` | `MIGRATION_GUIDE_v2.1.0_to_v3.0.0.md` | 🔧 `.security-check/` への集約・フェイルクローズ化が必要です。移行ガイドを使って進めましょう。 |
| `v1` | `MIGRATION_GUIDE_v1_to_v2.0.1.md` | 🔧 husky + lint-staged 構成から simple-git-hooks への移行が必要です。まずこちらを完了させてから、必要であれば v3 への移行ガイドに進んでください。 |
| `v2.x-unknown` | `manual` | 🔍 simple-git-hooks は導入済みですが pre-commit の実体が想定外の内容です。内容をユーザーと一緒に確認してください。 |
| `unknown` | `setup-securecheck.md` | 🆕 setup-securecheck が未導入の可能性があります。`setup-securecheck.md` から新規導入できます。 |

移行ガイドは以下のコマンドで取得できます：

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck/migration tmp/securecheck-migration --force
```

---

## クリーンアップ（任意）

作業完了後、`tmp/securecheck-version-detect/` は削除して構いません（`.gitignore` で除外済みのはずです）。

```bash
rm -rf tmp/securecheck-version-detect/
```
