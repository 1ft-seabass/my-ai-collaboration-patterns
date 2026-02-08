---
tags: [setup-securecheck, wizard, redesign, implementation, four-layer-architecture]
---

# setup_securecheck ウィザード化 再設計・実装 - 開発記録

## 背景

前ノート（`2026-02-08-10-04-21-setup-securecheck-problem-analysis.md`）で明らかになった問題点を解決するため、setup_securecheck をウィザード形式に全面的に再設計・実装した。

## 設計方針

### 1. 四層構造の思想を適用

**確実に動くパート**（揺れない）:
- Node.js スクリプト（OS 判定、ファイルコピー、ヘルスチェック）
- テンプレートファイル（AI が生成しない、コピーのみ）

**揺れるパート**（AI の役割）:
- ウィザード案内（コマンドを提示、結果を受けて次を案内）
- 検出結果の解釈（本物のシークレットか、プレースホルダーか）

### 2. 人間が実行、AI が案内

- AI がコマンドを提示 → 人間が叩く → 結果を報告 → AI が次を案内
- 人間に**責任と記憶が残る**（サーバーセットアップと同じ体験）

### 3. AI に任せすぎない

- **設定ファイルは AI が生成しない**（テンプレートからコピー）
- **スクリプトは AI が変更しない**（確定的に動作する）
- **verify は人間が叩く**（AI が設定 → AI が確認のループを断ち切る）

### 4. Claude Code の `!` 実行を前提とした設計

- `!` で始まるメッセージは**コマンドとして実行される**
- 人間が「`!npm install`」と入力 → Claude Code が実行 → 結果が両者に見える
- 「実行してください」のみ（「結果を報告してください」は不要）
- 汎用的でありながら Claude Code で最適

理由:
- `!` 実行はコーディングエージェント標準になりつつある（Cursor, Aider 等でも対応）
- my-ai-collaboration-patterns は Claude Code での利用が主

## 実装内容

### フェーズ1: 確定的スクリプト（揺れない層）

#### 1. install-gitleaks.js（新規作成）

**目的**: gitleaks バイナリを OS/arch に応じてダウンロード・展開・配置する。

**OS/arch マッピング**:

| process.platform | process.arch | ダウンロードファイル | 展開方法 |
|---|---|---|---|
| linux | x64 | gitleaks_X.X.X_linux_x64.tar.gz | Node.js zlib + tar |
| linux | arm64 | gitleaks_X.X.X_linux_arm64.tar.gz | Node.js zlib + tar |
| darwin | x64 | gitleaks_X.X.X_darwin_x64.tar.gz | Node.js zlib + tar |
| darwin | arm64 | gitleaks_X.X.X_darwin_arm64.tar.gz | Node.js zlib + tar |
| win32 | x64 | gitleaks_X.X.X_windows_x64.zip | PowerShell Expand-Archive |

**配置先**: `./bin/gitleaks`（Windows は `./bin/gitleaks.exe`）

**特徴**:
- バージョン番号はスクリプト先頭に定数で持つ（AI が変えない）
- 既にインストール済みなら何もしない（冪等性）
- 追加の npm パッケージ: なし（依存ゼロ）

#### 2. security-verify.js（新規作成）

**目的**: セキュリティチェック体制の健全性を確認し、✅/❌ 一覧を出力する。

**チェック項目（10項目）**:

**存在チェック（4項目）**:
- .secretlintrc.json
- gitleaks.toml
- .husky/pre-commit
- package.json の lint-staged 設定

**中身チェック（3項目）**:
- .secretlintrc.json に `preset-recommend` が含まれているか
- gitleaks.toml が空でないか
- .husky/pre-commit に `secretlint` の記述があるか

**動作チェック（3項目）**:
- secretlint コマンドが動くか
- lint-staged コマンドが動くか
- gitleaks バイナリが動くか

**`--test-run` フラグ**:
- ヘルスチェックが全て ✅ → 実際のスキャンを実行
- secretlint "**/*" を実行（全ファイル）
- gitleaks detect を実行（全履歴）※gitleaks がある場合のみ
- 検出があれば詳細表示（最初の 20-30 行）

**出力記号**:
- ✅ 正常
- ❌ 問題あり（対処が必要）
- ⚠️ 警告（gitleaks がない等。secretlint で最低限は守られている）
- ⏭️ スキップ（前提条件の ❌ によりチェック不能）

#### 3. pre-commit.js（バグ修正）

**既存のバグ**:
```javascript
execSync('npx gitleaks protect --staged', { stdio: 'inherit' });
```
→ gitleaks は npm パッケージではないため動かない

**修正後**:
- bin/gitleaks → グローバル gitleaks → 警告スキップ の3段階フォールバック
- gitleaks 不在でも exit 0（secretlint で最低限守られている）

### フェーズ2: テンプレートファイル

#### 1. .secretlintrc.json（新規作成）

```json
{
  "rules": [
    {
      "id": "@secretlint/secretlint-rule-preset-recommend"
    }
  ]
}
```

シンプルに preset-recommend のみ。プロジェクト固有の ignores はセットアップウィザードの Phase 1 で AI と人間が相談して追加する。テンプレート自体は最小構成で降ろす。

#### 2. package.json.example（更新）

```json
{
  "scripts": {
    "security:verify": "node scripts/security-verify.js",
    "security:verify:testrun": "node scripts/security-verify.js --test-run",
    "security:install-gitleaks": "node scripts/install-gitleaks.js",
    "secret-scan": "secretlint \"**/*\"",
    "secret-scan:full": "secretlint \"**/*\" && ./bin/gitleaks detect --source . -v",
    "husky:install": "husky"
  }
}
```

#### 3. gitignore.example（改善）

```gitignore
# gitleaks binary (large binary file)
bin/gitleaks
bin/gitleaks.exe

# Phase 4（個人用）の場合のみ以下を追加:
# .husky/
#
# Phase 3（チーム全員）の場合は .husky/ をコミットする必要があるため、
# 上記をコメントアウトしたまま（追加しない）にしてください。
```

Phase 3 と Phase 4 でコメントによる分岐を明示。

#### 4. bash ファイルの削除

- install-gitleaks.sh → install-gitleaks.js に置き換え
- secret-scan.sh → package.json scripts で十分

### フェーズ3: ドキュメント

#### 1. README.md（全面書き直し）

**主な改善点**:

1. **ワンショット指示を2つに分離**
   - 新規導入用: ウィザード形式で導入
   - 既存プロジェクトのヘルスチェック用: verify.js を実行

2. **既存プロジェクトを3パターンに分離**
   - パターンA: セキュリティチェック未導入 → 新規と同じウィザードを使う
   - パターンB: 既に導入済み → ヘルスチェックから始める

3. **degit → AI指示の流れを明確化**
   - docs-structure パターンとの一貫性
   - `./security-setup` というディレクトリ名に統一

4. **ウィザード形式の特徴を強調**
   - 「AI が提示 → 人間が実行 → 結果を報告」の流れ
   - 「人間に責任と記憶が残る」という価値

5. **技術的な特徴を詳細化**
   - verify の 10 項目チェックの内訳
   - テストラン（--test-run）の動作説明
   - クロスプラットフォーム対応の詳細

6. **設計思想のセクション追加**
   - 四層構造アーキテクチャの適用
   - AI に任せすぎない設計
   - ワンショット型の一貫性

#### 2. setup_securecheck.md（全面書き直し）

**ウィザード形式の構造**:

```markdown
## ステップ 1.1: テンプレートファイルをコピー

以下のコマンドを実行してください：
```bash
cp security-setup/templates/.secretlintrc.json .
cp security-setup/templates/gitleaks.toml .
```
```

**特徴**:
- 「実行してください」のみ（シンプル）
- 「結果を報告してください」は不要（AI が自動的に見る）
- 期待する結果を記載
- 検出があった場合の対処も記載

**段階的な構造（Phase 1-4）**:
- **Phase 1**: 初動スキャン（テンプレートコピー → インストール → スキャン）
- **Phase 2**: 手動運用（npm scripts + verify）
- **Phase 3 vs 4 の選択**: 人間に確認してから進む
- **Phase 3**: チーム全員（.husky/ をコミット）
- **Phase 4**: 個人用（.husky/ を .gitignore）

**充実したリファレンス**:
- 検出時の対応フロー（トークン無効化 → ファイル修正 → 履歴削除）
- よくある検出パターンと対処
- トラブルシューティング

## 72点 → 100点への改善

| 減点項目 | 改善内容 | 状態 |
|---|---|---|
| pre-commit.js のバグ | 3段階フォールバックに修正 | ✅ 解消 |
| .secretlintrc.json 欠如 | テンプレート追加 | ✅ 解消 |
| verify の仕組みなし | security-verify.js 追加（10項目 + --test-run） | ✅ 解消 |
| install script が Linux 固定 | Node.js化、OS自動判定 | ✅ 解消 |
| gitignore の Phase 3/4 矛盾 | 分岐を注記で明示 | ✅ 解消 |
| ウィザード形式への対応 | setup_securecheck.md 全面書き直し | ✅ 追加改善 |
| degit起点の明確化 | README.md 改善 | ✅ 追加改善 |

**全5項目（-28点分）を完全解消 + ウィザード化による品質向上**

## 提供されるコマンド

セットアップ完了後、以下のコマンドが使えるようになる：

| コマンド | 用途 |
|---------|------|
| `npm run security:verify` | ヘルスチェック（設定確認のみ） |
| `npm run security:verify:testrun` | ヘルスチェック + 実際のスキャンテスト |
| `npm run security:install-gitleaks` | gitleaks バイナリのインストール（OS 自動判定） |
| `npm run secret-scan` | secretlint で全ファイルスキャン |
| `npm run secret-scan:full` | secretlint + gitleaks で全スキャン |

## 実装時の技術的判断

### 1. gitleaks の npm ラッパーを使わない判断

調査の結果、Node.js エコシステムに信頼できる gitleaks ラッパーは存在しないことが判明。

| パッケージ | 状態 | 評価 |
|---|---|---|
| gitleaks-secret-scanner | jsDelivr 統計 Requests: 0 | 利用実績ほぼゼロ |
| @ziul285/gitleaks | v1.0.0、利用プロジェクト 0 | 実績なし |
| gitleaks (npm) | 6年前に v1.0.0 で放置 | 完全に死んでいる |

→ バイナリを直接ダウンロードする方式を採用

### 2. Windows の zip 展開に PowerShell を使う判断

WSL2 問題が消えたので PowerShell は確実に使える。依存パッケージゼロで実装できる。

### 3. verify の --test-run を2段階にした判断

**理論チェック（ヘルスチェック）が全部 ✅ → その後に実際のテストラン**

この流れの方が：
- 設定不備のまま実行して変なエラーが出るのを防ぐ
- ウィザードの流れとして自然（「設定OK？」→「じゃあ動かしてみよう」）
- デバッグしやすい（ヘルスチェックで ❌ が出たら、まずそっちを直す）

### 4. package.json scripts 名を `security:verify:testrun` にした判断

当初 `security:verify:test` が候補だったが、`testrun` の方が「テストランを実行する」という意味が明確。

## 未決定事項（次セッションで検討）

以下は既存プロジェクトでの試行錯誤フェーズで検討する：

1. **gitleaks の最終的な扱い**
   - ローカル維持 vs CI/CD 限定 vs 段階的移行

2. **secretlint カスタムパターンの強化方針**
   - gitleaks がカバーしていた領域をどこまで secretlint で補うか

3. **GitHub Actions 導入の判断**
   - ワンショット型の思想との折り合い

## 次のステップ

既存プロジェクトに適用して動作確認を行い、実戦での使い勝手を検証する。
