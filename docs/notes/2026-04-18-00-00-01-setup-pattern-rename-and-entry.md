---
tags: [setup-pattern, setup-securecheck, rename, docs-structure-for-branch, naming-convention]
---

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない

**作成日**: 2026-04-18
**関連タスク**: setup_securecheck → setup-securecheck リネーム / setup-pattern README に docs-structure-for-branch エントリ追加

## 問題

### 1. 命名規則の不統一

`setup_securecheck`（スネークケース）と `docs-structure-for-branch`（ケバブケース）が混在していた。

このリポジトリのパターン名は一貫してケバブケース（`docs-structure`, `actions-pattern` 等）を使っており、`setup_securecheck` だけが例外だった。

### 2. `patterns/setup-pattern/README.md` に `docs-structure-for-branch` が未記載

v1.2.1 で `docs-structure-for-branch` を新設したが、`setup-pattern/README.md` へのエントリ追加が申し送りの残タスクになっていた。

## 解決策

### リネーム: setup_securecheck → setup-securecheck

```
patterns/setup-pattern/setup_securecheck/         → setup-securecheck/
patterns/setup-pattern/setup_securecheck/setup_securecheck.md → setup-securecheck/setup-securecheck.md
```

更新した参照箇所:
- `patterns/setup-pattern/setup-securecheck/README.md`（内部参照）
- `patterns/setup-pattern/README.md`（全参照）
- root `README.md`（3箇所）

`docs/notes/`, `docs/letters/` 内の歴史的記録ファイルは変更しない（記録の正確性を保つため）。

### docs-structure-for-branch エントリ追加

`patterns/setup-pattern/README.md` に以下を追加:
- ガイド一覧セクション（最初のエントリとして）
- ディレクトリ構成に `docs-structure-for-branch/` を追記
- 使い方セクションの degit コマンド例に追記
- 関連パターンセクションに追記

## 変更ファイル

- `patterns/setup-pattern/setup-securecheck/` （ディレクトリリネーム）
- `patterns/setup-pattern/setup-securecheck/setup-securecheck.md` （ファイルリネーム）
- `patterns/setup-pattern/setup-securecheck/README.md` （内部参照更新）
- `patterns/setup-pattern/README.md` （リネーム対応 + docs-structure-for-branch エントリ追加）
- `README.md` （リネーム対応）

## 学び

- **ケバブケースで統一**: このリポジトリのパターン名はケバブケースに統一する。新規追加時から守れば後からのリネームコストが発生しない
- **README のエントリ追加はパターン新設と同時に**: 今回は申し送りに残タスクとして積まれていたが、パターン新設コミットと同タイミングでやるのが自然

## 関連ドキュメント

- `patterns/setup-pattern/README.md`
- `patterns/setup-pattern/setup-securecheck/README.md`
- `patterns/setup-pattern/docs-structure-for-branch/README.md`

---

**最終更新**: 2026-04-18
**作成者**: Claude
