---
tags: [setup-securecheck, simple-git-hooks, security, design]
---

**作成日**: 2026-04-18
**関連タスク**: setup-securecheck v2.0.0 リリース

## 問題

setup-securecheck v1 は husky + lint-staged + secretlint + gitleaks の4ツール構成だった。
husky のバージョン間の設定変更・prepare 書き忘れ・CI での余計な実行など、hooks 管理の煩雑さが課題だった。

---

## 設計判断

### husky → simple-git-hooks

**理由**: husky は `.husky/` ディレクトリが増える、`husky install` を prepare に書き忘れると新メンバーがハマる、v7→v8→v9 で設定の書き方が変わるなど、やりたいことに対して重かった。
simple-git-hooks は package.json だけで完結し、依存ゼロ・軽量。`postinstall` に登録すれば `npm install` 後に全員の hooks が自動有効化される。

### lint-staged を削除

**理由**: secretlint → lint-staged → husky という依存チェーンがやりたいことに対して大げさだった。
`pre-commit.js` が `npx secretlint "**/*"` を直接呼ぶ構成にシンプル化。

### Phase 3/4 → Phase 3 に統合

**理由**: v1 では「チーム全員用（.husky/ をコミット）」と「個人用（.husky/ を .gitignore）」の2 Phase があったが、差分は .husky/ の gitignore の有無だけだった。
simple-git-hooks では `.git/hooks/` に書き込まれるため `.husky/` という概念が消える。package.json をコミットするかどうかだけになり、分岐不要。

### 実行ログの仕様

**フォーマット**: JSONL（1実行1行）
**記録内容**: `timestamp / result（passed/failed）/ branch` のみ
**件数**: 最新 50 件をローテーション
**保存先**: `.logs/pre-commit.log`（.gitignore 管理）

**理由**:
- JSONL は行単位でパースしやすく、ローテーション実装が単純
- 検出内容・ファイル名はログに残さない（ログ経由での漏洩を防ぐ）
- failed の件数は記録しない（件数が何件でも「対処が必要」は変わらない）
- 50 件は「最近動いているか確認できれば十分」という判断

### migration の構成（AI 指示書 + シェル補助）

**理由**: 機械的な手順（npm uninstall/install、.husky/ 削除）はシェルで自動化、package.json の構造変更や判断が必要な部分は AI ウィザードが案内する形が最適。
docs-structure の migration guide と同じスタイルで一貫性を保った。

**degit で取得できる構成**:
```
npx degit .../setup-securecheck/migration ./tmp/securecheck-migration
```
`migration/` ディレクトリに `MIGRATION_GUIDE_v1_to_v2.0.0.md` と `migrate-to-v2.sh` を同梱。

---

## 最終的な構成（v2.0.0）

| ツール | 役割 |
|---|---|
| secretlint | シークレット検出（サービス特化） |
| gitleaks | シークレット検出（entropy + 履歴） |
| simple-git-hooks | hooks 管理 |

**ヘルスチェック 11 項目**（v1 から変わった箇所）:
- `.husky/pre-commit` → `.git/hooks/pre-commit`
- `lint-staged` 設定 → `simple-git-hooks` 設定
- フック内容確認 → `pre-commit.js` 記述確認
- `lint-staged` 動作確認 → 実行ログ最終確認（新規）

---

## 関連ドキュメント

- [2026-03-24 構成改善検討ノート](./2026-03-24-00-00-00-setup-securecheck-config-improvement.md)
- [setup-securecheck README](../../patterns/setup-pattern/setup-securecheck/README.md)
- [CHANGELOG](../../patterns/setup-pattern/setup-securecheck/CHANGELOG.md)

---

**最終更新**: 2026-04-18
**作成者**: Claude
