---
tags: [setup-securecheck, simple-git-hooks, security, brushup]
---

**作成日**: 2026-05-03
**関連タスク**: setup-securecheck v2.0.0 ブラッシュアップ

## 問題

v2.0.0 リリース（2026-04-18）後、2月のフィールドテストで指摘された未反映事項と、v1→v2 変換時の更新漏れが残っていた。

---

## 修正内容

### 1. `setup-securecheck.md` の Phase 0 全体像テーブルが `10/10` のまま

**場所**: `setup-securecheck.md` 70行目

**問題**: CHANGELOG には「ヘルスチェック項目を更新（10項目 → 11項目）」と明記されているにもかかわらず、ウィザード冒頭の全体像テーブルに `✅ 10/10 なら完了` が残っていた。Phase 0 のステップ本文（115行目）は正しく `11/11` を使っており、同一ファイル内で矛盾していた。

**修正**: `10/10` → `11/11`

---

### 2. `templates/gitignore.example` が個別ファイル指定のまま

**場所**: `templates/gitignore.example`

**問題**: 2026-02-12 の既存プロジェクトへの現場テストで「`bin/gitleaks` は `bin/` とすべき」と指摘されていたが、v2.0.0 リリース時に反映されなかった。

個別指定（`bin/gitleaks` + `bin/gitleaks.exe`）だと、将来的なバイナリ名変更や追加ファイルが `.gitignore` をすり抜けるリスクがある。`bin/` で一括除外する方が堅牢。

**修正**:
```
# Before
bin/gitleaks
bin/gitleaks.exe

# After
bin/
```

---

### 3. `setup-securecheck.md` ステップ 3.5 のコードブロックが旧形式

**場所**: `setup-securecheck.md` ステップ 3.5

**問題**: ウィザードの `.gitignore` 追記例が `templates/gitignore.example` と同じ内容を inline で示しているが、上記 2 の修正に合わせて更新が必要だった。

**修正**: コードブロック内の `bin/gitleaks` + `bin/gitleaks.exe` を `bin/` に統一

---

---

### 4. 移行ガイドにスキャンツール確認・インストールステップを追加

**場所**: `migration/MIGRATION_GUIDE_v1_to_v2.0.0.md`

**問題**: クローンしたての環境で移行を実施するケースがある。その場合、`bin/gitleaks` は gitignore 管理のため存在せず、場合によっては `npm install` 未実行で secretlint も入っていない。旧ガイドはこのケースを想定していなかった。

**修正**:

- **Step 1.3 を追加**: `npx secretlint --version` と Node.js ワンライナーで gitleaks バイナリの存在確認。状態把握のみ（インストールはしない）。gitleaks が ❌ でも「クローン直後は正常、Step 4.5 で対処」と案内。

- **Step 4.5 を追加**: スクリプトを最新版に差し替えた直後（Step 4 完了後）に、`npm install -D secretlint @secretlint/secretlint-rule-preset-recommend` と `node scripts/install-gitleaks.js` を実行。どちらも冪等（既存の場合はスキップ）。インストール後に同じ確認コマンドで ✅ を確認してから次へ進む。

- チェックリストに `Step 4.5: スキャンツールの確認・インストール` を追加。

**設計方針**: Step 1.3 は「現状把握」、Step 4.5 は「実際のインストール」と役割を分けた。Step 4.5 を Step 4 後にしたのは、`node scripts/install-gitleaks.js` が Step 4 で差し替えた最新版を使うため。

---

## 修正しなかった事項

### `bin/` 除外の影響
プロジェクトによっては `bin/` に CLI スクリプトを置く場合がある。ただし、setup-securecheck では `bin/` の用途は gitleaks バイナリのみであり、他のファイルを置く設計になっていない。用途が明確なため `bin/` 一括除外で問題なし。

### Windows `secret-scan:full` の `./bin/` パス問題
`"secret-scan:full"` スクリプトの `./bin/gitleaks` は Windows では `.\bin\gitleaks.exe` が必要。README に Windows 向け手順として既に注記があり、`package.json.example` の npm script 自体はクロスプラットフォームの抜本対応が必要になる。今回の brushup のスコープ外として据え置き。

### `security-verify.js` での `scripts/` ディレクトリ存在チェック
2月のフィールドテストで「`scripts/security-verify.js` や `scripts/install-gitleaks.js` の存在チェックを health check に入れる案」が挙がっていたが、現在の 11 項目で実運用上は十分カバーできており、今回は変更しない。

---

## 関連ドキュメント

- [2026-04-18 v2.0.0 設計ノート](./2026-04-18-12-00-00-setup-securecheck-v2-design.md)
- [2026-02-12 現場テスト成功記録](./2026-02-12-15-30-00-existing-project-field-test-success.md)
- [setup-securecheck CHANGELOG](../../patterns/setup-pattern/setup-securecheck/CHANGELOG.md)

---

**最終更新**: 2026-05-03
**作成者**: Claude
