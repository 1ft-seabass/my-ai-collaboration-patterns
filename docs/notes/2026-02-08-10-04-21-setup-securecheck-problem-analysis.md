---
tags: [setup-securecheck, security, problem-analysis, evaluation, ai-reliability]
---

# setup_securecheck 問題分析と評価 - 開発記録

## 背景

setup_securecheck パターン（secretlint + gitleaks によるシークレットスキャン）において、「指示書通りに設定しても漏れが起きる」という問題が発生。AI に全部やらせると、うまくいったようで結構揺れがあり、最悪の場合抜けてしまう状況を改善する必要があった。

## 問題の構造

### 1. AI が設定して AI が確認する再帰的信頼性の空白

```
AI がコードを書く → シークレットが混入するリスク
  ↓ だから
AI にセキュリティツールの設定を指示する
  ↓ しかし
AI が設定を間違える（toml が空、カスタムパターンが甘い）
  ↓ 結果
守るための仕組みが、守れてない
```

これは四層構造アーキテクチャの記事で見出した「AI に自由にやらせると制御できない」問題が、セキュリティツール設定にも発生している状態。

### 2. gitleaks のクロスプラットフォーム問題

Windows + WSL2 + Docker の環境で gitleaks バイナリインストールがカオス化していた。

| 環境 | 問題 |
|---|---|
| Docker (Claude Code) | Linux バイナリで動く → OK |
| Windows (Git Bash) | Linux バイナリが動かない → 別スクリプト必要 |
| VSCode + WSL2 | `bash` コマンドが WSL2 の bash を呼ぶ → Windows 用スクリプトがエラー |
| WSL2 経由 | OSTYPE=linux-gnu なので Linux バイナリが正解だが、cygpath/unzip/powershell が使えない |

結果として `.husky/pre-commit` に `exit 0`（gitleaks なしでも通す）が入り、**gitleaks 層が事実上の形骸化**。

### 3. 「セッション開始」と「npm install」の混同

当初 postinstall でセッション開始時の検知ができると思われたが、これは別物。

- **postinstall**: `npm install` 実行時のみ。既存プロジェクトの新セッションでは走らない
- **セッション開始**: Claude Code のトークン上限で新セッションが始まるたび。`npm install` は通常しない

対策のレイヤーが異なることが判明。

### 4. AI が書いたコードも守る必要がある

ドキュメント（docs/notes）だけでなく、AI が書いたコードにシークレットが混入するリスクがある。CI/CD で止まっても、リモートの git 履歴に本物のシークレットが載ってしまう。**ローカルの pre-commit で止める層は必要**。

## 既存実装の評価（72点 / 100点）

### 評価対象のファイル構成

```
patterns/setup-pattern/setup_securecheck/
├── README.md
├── setup_securecheck.md
└── templates/
    ├── gitignore.example
    ├── gitleaks.toml
    ├── package.json.example
    └── scripts/
        ├── install-gitleaks.sh
        ├── pre-commit.js
        └── secret-scan.sh
```

### 高く評価できる部分（58点分）

1. **段階的導入の設計**（+20点）
   - Phase 1（現状把握）→ Phase 2（手動運用）→ Phase 3/4（自動化）
   - 「いきなり自動化しない」「Phase 2 で止めてもOK」という逃げ道がある

2. **ワンショット指示の統一**（+10点）
   - `npx degit` で取得 → AI に読ませる、の流れが docs-structure パターンと一貫

3. **手順書の網羅性**（+15点）
   - Phase 3 vs Phase 4 の判断基準（チーム全員 vs 個人用）
   - Docker / Dev Container 環境での gitleaks 消失問題と対策
   - 検出時の対応フロー（即無効化 → ファイル修正の順序）
   - git 履歴汚染時のリカバリ手順（filter-branch / BFG）

4. **テンプレートの実用性**（+8点）
   - gitleaks.toml のプレースホルダー allowlist（YOUR_TOKEN_HERE 等）が実用的
   - secret-scan.sh の 3 段階フォールバック（bin/ → グローバル → エラー）

5. **ツール構成の明示**（+5点）
   - secretlint = メイン、gitleaks = 補助、という役割分けが明確

### 減点ポイント（-28点分）

1. **pre-commit.js に致命的バグがある**（-8点）
   ```javascript
   execSync('npx gitleaks protect --staged', { stdio: 'inherit' });
   ```
   - gitleaks は npm パッケージではないため `npx gitleaks` は動かない
   - `./bin/gitleaks` かグローバルの `gitleaks` を呼ぶべき

2. **.secretlintrc.json のテンプレートがない**（-5点）
   - templates/ に gitleaks.toml はあるのに .secretlintrc.json がファイルとして存在しない
   - AI は「コード例を読んで生成する」しかなく、ここが揺れの発生源

3. **verify の仕組みがまったくない**（-10点）
   - セットアップ後に「ちゃんと入ったか」を確認する手段がない
   - AI が設定して AI が「できました」と報告し、実は設定が抜けている状態を防げない

4. **install-gitleaks.sh が Linux 固定**（-3点）
   ```bash
   gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz
   ```
   - ダウンロード URL が linux_x64 にハードコードされており、macOS / Windows / ARM64 に対応していない

5. **gitignore.example が Phase 3/4 で矛盾する**（-2点）
   ```gitignore
   # husky (if using Phase 4 - personal setup)
   .husky/
   ```
   - Phase 4 では正しいが、Phase 3 では .husky/ をコミットすべき
   - テンプレートが 1 つしかないため、Phase 3 を選んだプロジェクトでそのまま適用すると問題になる

## 得点内訳

| 領域 | 得点 | 備考 |
|---|---|---|
| 設計思想・段階的導入 | 20/20 | 文句なし |
| 手順書の品質 | 15/20 | 網羅的だが一部矛盾あり |
| テンプレートの品質 | 12/20 | .secretlintrc.json 欠如、pre-commit.js バグ |
| 「設定漏れ」への防御 | 10/20 | verify なし、ワンコマンド setup なし |
| クロスプラットフォーム | 5/10 | install スクリプトが Linux 固定 |
| docs-structure との連携 | 10/10 | ワンショット思想の一貫性◎ |
| **合計** | **72/100** | |

## 改善の方向性

### 四層構造の思想をセキュリティ設定に適用する

四層構造アーキテクチャの核心：
- **確実に動くパート**（ビジネスロジック・API・UI）と **揺れるパート**（AI エージェント）を分離する
- AI の揺れがなく確実に動くパートで完成度を上げてから、AI を薄く載せる

セキュリティ設定に転用：
- **確実に動くパート**: secretlint（npm install だけで動く）、設定ファイルのテンプレートコピー、Node.js ベースの verify スクリプト
- **揺れるパート**: gitleaks のバイナリインストール、AI による設定生成

### ローカル pre-commit は secretlint を「確実に動く層」として固める

- `npm install` だけで動く。Windows でも WSL2 でも Docker でも関係ない
- `@secretlint/secretlint-rule-pattern` でカスタムパターンを足して gitleaks がカバーしていた領域も一部カバー
- gitleaks がローカルで動けば bonus、動かなくても secretlint で最低限は守られている状態を作る

### セットアップは AI に任せずスクリプトで確定的にやる

```
あるべきフロー:
人間が npm run security:setup を叩く
  → スクリプトが確定的に全部やる
  → 設定ファイルはテンプレートからコピー（AI に生成させない）
  → 人間が npm run security:verify で確認
```

Node.js で書けば OS 問題を踏まない。my-ai-collaboration-patterns の `npx degit` ワンショット思想と同じ。

### verify は人間が叩いて目で確認する

AI が設定 → AI が確認、というループを断ち切る。人間が `npm run security:verify` を叩いて ✅ / ❌ の一覧を見る。

verify の内容は存在チェックだけでなく「中身チェック」まで:

- `.secretlintrc.json` に `preset-recommend` が含まれているか
- `gitleaks.toml` が空ファイルでないか
- `.husky/pre-commit` に `secretlint` の記述があるか
- `package.json` の `lint-staged` 設定が存在するか

## 次のステップ

この問題分析を元に、ウィザード化による改善を実施する。詳細は別ノート `2026-02-08-10-04-21-setup-securecheck-wizard-redesign.md` を参照。
