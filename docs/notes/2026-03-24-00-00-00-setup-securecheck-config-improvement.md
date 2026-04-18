---
tags: [setup-securecheck, husky, simple-git-hooks, security, design]
---

**作成日**: 2026-03-24
**関連タスク**: setup-securecheck v2.0.0 設計検討

## 問題

Node.js プロジェクトでのシークレットスキャン構成（gitleaks + husky + secretlint）について、以下の課題が顕在化していた。

### husky のしんどさ
- `.husky/` ディレクトリが増えて設定が散らかる
- `husky install` を prepare スクリプトに書き忘れると新メンバーがハマる（自分でも再現）
- CI 環境で prepare が余計に走ることがある
- v7 → v8 → v9 でバージョンごとに設定の書き方が変わった

### スクリプト過多・依存チェーンが長い
- `install-gitleaks.js` / `pre-commit.js` / `security-verify.js` が連動していて全体把握が難しい
- secretlint → lint-staged → husky という依存が、やりたいことに対して大げさ

---

## 検討した選択肢

### Betterleaks（本命候補・様子見）
- Gitleaks 作者（Zachary Rice / Aikido Security）が 2026/2/3 に開発開始した後継ツール
- BPE トークナイゼーションによる高精度検出（リコール率 98.6% vs gitleaks 70.4%）
- `.gitleaks.toml` をそのまま読み込めるドロップイン互換
- **懸念**: まだ若い（2026/2 開始）、GitHub Actions 等エコシステムが未整備
- **判断**: Ubuntu/Debian/Windows でパッケージマネージャーが整うまで様子見

### simple-git-hooks（採用）
- package.json だけで完結、依存ゼロ・軽量
- `postinstall` で `npm install` 後に全員の hooks が自動有効化（prepare 書き忘れ問題を解消）
- CI での余計な実行なし

### secretlint 単体化（不採用）
- Node.js だけで完結でシンプルだが git 履歴スキャンができない
- gitleaks との補完関係（エントロピー検出 + サービス特化検出）を維持したいため見送り

---

## 決定事項

### 構成

| ツール | 変化 |
|---|---|
| simple-git-hooks | 🔄 husky から変更 |
| secretlint | ✅ そのまま |
| gitleaks | ✅ そのまま |
| 実行ログ `.logs/pre-commit.log` | 🆕 新規追加 |

### 実行ログの仕様
- 出力先: `.logs/pre-commit.log`（.gitignore 管理）
- フォーマット: JSONL（1実行1行）
- 記録内容: `timestamp + result（passed/failed）+ branch` のみ
- ローテーション: 最新 50 件

「動いていると思ったら実は無効だった」という事故を防ぐため。
検出内容・ファイル名はログに残さない（ログ経由での漏洩を防ぐ）。

### secretlint の ignore 管理方針
- 個別値の ignore をやめて**ファイルパターンで ignore する**
- 理由: 個別値の ignore は経緯が記録されず時間が経つと負債化する

```json
{
  "ignores": [
    "docs/examples/**",
    "**/*.example.*"
  ]
}
```

---

## 未決事項（次回以降）

- [ ] setup-securecheck.md を simple-git-hooks + ログ設計ベースに書き直す（→ v2.0.0 として実施）
- [ ] Betterleaks は Ubuntu/Debian/Windows でパッケージマネージャーが整ったタイミングで再検討

---

## 関連ドキュメント

- [setup-securecheck v2.0.0 設計判断](./2026-04-18-12-00-00-setup-securecheck-v2-design.md)
- [setup-securecheck README](../../patterns/setup-pattern/setup-securecheck/README.md)

---

**最終更新**: 2026-03-24
**作成者**: （ユーザー記録をノート化）
