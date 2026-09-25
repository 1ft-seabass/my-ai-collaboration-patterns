# setup-securecheck - セキュリティチェック導入ガイド

secretlint + gitleaks によるシークレットスキャンの導入パターン。確定的な Node.js スクリプトと、判断が必要な箇所（検出結果の解釈・package.json のマージ）でのAI案内を組み合わせています。

**二重チェック体制**: secretlint と gitleaks を両方使うことで、より確実にシークレットを検出します。

---

## 🚀 新規プロジェクト / 既存プロジェクト 共通

### 1. Node.js前提でのAIワンショット指示書（推奨）

> **🤖 AIへのワンショット指示（コピペ用）**
>
> ```
> https://github.com/1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck
> このパターンを使ってセキュリティチェック（secretlint + gitleaks）を導入したいです。
>
> npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck ./tmp/security-setup
>
> tmp/security-setup/quickstart.md を読んで、案内してください。
> ```

既存にこのパターンが導入済みでも安全です（`install.js`は既存ファイルを上書きせず、不足分だけ補います）。旧バージョン（v1/v2）からの移行は下記の「旧バージョンからの移行」を使ってください。

**このフローの特徴**（詳細は`quickstart.md`参照）:
- ファイル配置・npm依存導入・gitleaksダウンロード・フック配線・動作確認（ネガティブテスト・フェイルクローズ確認・verify）は全て`install.js`/`scan`/`setup-local`というコードが実行
- AIが判断するのは2箇所だけ: `scan`結果の解釈（本物の漏洩かプレースホルダーか）と、`package.json`のマージ内容確認。この2箇所は生の`npm install`等がコード化されたのと違い、今回コード化されておらず、以前と同じ強さの判断＋確認の往復が必要（`quickstart.md`にチェックボックス・ゴーサイン待ちを明記）
- 判断ポイント以外は、AIがコマンドを提示→人間が実行して結果を報告、という往復が最小限で済む

### 2. 詳しい手順を1つずつ確認したい場合（Phase 0-3ウィザード）

Node.js が使えない環境、あるいは各ステップの意味を人間が理解しながら1つずつ進めたい場合は、こちらの詳細手順を使ってください。中身（`.security-check/`一式）は上記フローが内部で使っているものと同じで、`install.js`/`scan`/`setup-local`が自動化している各ステップも、元をたどればこの手順書のPhase 0-3に対応しています。

> **🤖 AIへのワンショット指示（コピペ用）**
>
> ```
> https://github.com/1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck
> このパターンを使ってセキュリティチェック（secretlint + gitleaks）を導入したいです。
>
> npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck ./tmp/security-setup
>
> tmp/security-setup/setup-securecheck.md を読んで、ウィザード形式で導入を案内してください。
> ```

**ウィザード形式の特徴**:
- AI が各ステップの**コマンドを提示**
- 人間が**コマンドを実行して結果を報告**
- AI と人間が**対話しながら進める**
- 人間に**責任と記憶が残る**

**導入の流れ**:
- **Phase 0**: ヘルスチェック（既存設定の確認）
  - 既に導入済み → 15/15 で完了
  - 未導入 or 設定不足 → Phase 1 へ
- **Phase 1**: 初動スキャン（現状把握）
- **Phase 2**: 手動運用（npm scripts）
- **Phase 3**: pre-commit 自動化（simple-git-hooks）

---

## 🔄 旧バージョンからの移行

> **🤖 AIへのワンショット指示（コピペ用）**
>
> ```
> https://github.com/1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck
> setup-securecheck を最新バージョンに移行したいです。
>
> npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck/version-detect ./tmp/securecheck-version-detect
>
> tmp/securecheck-version-detect/version-detect.md を読んで、現在のバージョンを検出し、該当する移行ガイドに案内してください。
> ```
>
> バージョン検出を経由せず直接ガイドを使いたい場合:
> - v1（husky + lint-staged）→ v3（`.security-check/` 集約、v2は経由しない）: `migration/MIGRATION_GUIDE_v1_to_v3.0.0.md`
> - v2.x（`scripts/` 直下レイアウト）→ v3（`.security-check/` 集約）: `migration/MIGRATION_GUIDE_v2.1.0_to_v3.0.0.md`

---

## 📦 このパターンについて

### 解決する問題

- **AI に設定を任せると揺れる**: toml が空、カスタムパターンが甘い、設定漏れ等が発生
- **クロスプラットフォーム問題**: Windows/WSL2/Docker で gitleaks のインストールがカオス化
- **確認の仕組みがない**: AI が「できました」と報告するが、実際には設定が抜けている

### このパターンの特徴

#### 四層構造の思想を適用
- **確実に動く層**: Node.js スクリプト、テンプレートファイル（AIが生成しない）
- **揺れる層**: AI によるウィザード案内（生成ではなく案内に徹する）

#### 人間が実行、AIが案内
- AI がコマンドを提示 → 人間が叩く → 結果を報告 → AI が次を案内
- 人間に**責任と記憶が残る**（サーバーセットアップと同じ体験）

#### 2段階のチェック
- **ヘルスチェック**: 設定ファイルの存在・中身・動作確認
- **テストラン**: 実際のスキャンを走らせて検出テスト

---

## 📂 作成される構造

```
tmp/security-setup/                   # 一時ディレクトリ（導入完了後に削除）
├── README.md                         # このファイル（導入ガイド）
├── quickstart.md                     # Node.js前提のAI向け手順書（推奨導線）
├── setup-securecheck.md              # 詳細な参考手順（Phase 0-3ウィザード）
├── install.js                        # Node.js版インストーラー（ファイル配置＋npm/gitleaksインストール）
└── templates/
    ├── .secretlintrc.json            # secretlint 設定テンプレート
    ├── gitleaks.toml                 # gitleaks 設定テンプレート
    ├── gitignore.example             # .gitignore 追記サンプル
    ├── package.json.example          # package.json 追記サンプル
    └── .security-check/              # プロジェクトルートに配置するツール一式
        ├── cli.js                    # 単一エントリポイント
        ├── README.md                 # .security-check/ 自身の説明
        └── lib/
            ├── environment.js        # gitleaks有無判定・v1/v2旧構成検知（pre-commit/verify共有）
            ├── pre-commit.js         # pre-commitフック本体（フェイルクローズ + 自動カナリア自己検証）
            ├── verify.js             # ヘルスチェック + テストラン
            ├── scan.js               # ヘルスチェックの合否に関係なくスキャンだけ実行
            ├── setup-local.js        # フック配線・.gitignore更新・動作確認までをまとめて実行
            ├── install-gitleaks.js   # gitleaks インストーラー（OS 自動判定）
            ├── wizard.js             # 引数なし起動時の対話ウィザード
            ├── prompt.js             # 対話ウィザードの入力ヘルパー
            └── uninstall.js          # アンインストール
```

導入後、プロジェクトルートには `.secretlintrc.json` / `gitleaks.toml`（設定ファイル、編集対象）と `.security-check/`（ツール一式、`.husky/`同様に通常は編集しない領域）が配置されます。

**注**: `tmp/` は一時ディレクトリとして使用します。導入完了後は `rm -rf tmp/security-setup/` で削除できます。

### ファイルの役割

| ファイル | 役割 | AI の扱い |
|---------|------|----------|
| **quickstart.md** | Node.js前提の手順書（チェックボックス・判断ポイント明記） | AI が読んで人間に案内（推奨） |
| **install.js** | 既存/新規プロジェクトへの安全マージ用インストーラー | **コピーして実行**（AI は変更しない） |
| **setup-securecheck.md** | 詳細な参考手順（Phase 0-3ウィザード） | Node.jsが使えない場合、AI が読んで人間に案内 |
| **templates/.secretlintrc.json** | secretlint 設定 | **コピーのみ**（AI は生成しない） |
| **templates/gitleaks.toml** | gitleaks 設定 | **コピーのみ**（AI は生成しない） |
| **templates/.security-check/** | 確定的なツール一式 | **コピーして実行**（AI は変更しない） |
| **package.json.example** | scripts 追記サンプル | AI が既存 package.json に統合（判断層） |
| **gitignore.example** | .gitignore 追記サンプル | `setup-local`が自動で追記（内容は本ファイルと同一） |

---

## 🎯 導入の流れ（Phase 0-3）

`install.js`はPhase 0-1相当、`scan`はPhase 1.3/1.5相当、`setup-local`はPhase 3.1・3.3-3.6相当を自動化しています（詳細は各Phaseの説明を参照）。

| Phase | 内容 | ここで止めてもOK？ |
|-------|------|------------------|
| **Phase 0** | ヘルスチェック（既存設定の確認） | ✅ 15/15 なら完了 |
| **Phase 1** | 初動スキャン（現状把握） | ✅ 問題発見したらまず対応 |
| **Phase 2** | 手動運用（npm scripts） | ✅ ライトに運用したい場合 |
| **Phase 3** | pre-commit 自動化（simple-git-hooks） | ✅ 自動化したい場合 |

---

## 💻 提供されるコマンド

セットアップ完了後、`package.json` には `"security": "node .security-check/cli.js"` の1行だけが追加され、以下のサブコマンドが使えるようになります：

| コマンド | 用途 |
|---------|------|
| `node .security-check/cli.js verify` | ヘルスチェック（設定確認のみ） |
| `node .security-check/cli.js verify --simple` | ヘルスチェック + staged ファイルスキャン（軽量・pre-commit相当） |
| `node .security-check/cli.js verify --test-run` | ヘルスチェック + 全ファイル + 全履歴スキャン（重い。旧 `secret-scan:full` 相当） |
| `node .security-check/cli.js scan [--all]` | ヘルスチェックの合否に関係なくスキャンだけ実行（無指定はstagedのみ、`--all`は全ファイル+全履歴） |
| `node .security-check/cli.js install-gitleaks` | gitleaks バイナリのインストール（OS 自動判定） |
| `node .security-check/cli.js setup-local` | フック配線・`.gitignore`更新・ネガティブテスト・フェイルクローズ確認・最終verifyまでをまとめて実行 |
| `node .security-check/cli.js pre-commit` | pre-commitフック本体（通常は simple-git-hooks 経由で自動的に呼ばれる） |
| `node .security-check/cli.js uninstall [--yes]` | このパターンの導入物を除去（`--yes` 無しはドライラン） |
| `node .security-check/cli.js`（引数なし、TTY） | 対話ウィザードを起動（上下キーでサブコマンドを選択） |

`npm run security -- <subcommand>` でも同じです。**必ずプロジェクトルートから実行してください**（`.security-check/`の中に`cd`してから実行すると誤動作します。ルート外から実行した場合はエラーで検知されます）。

---

## 🔧 技術的な特徴

### bash 依存を完全に排除
- 全スクリプトを **Node.js で実装**
- Windows/macOS/Linux で同じスクリプトが動く
- `process.platform` で OS 自動判定

### gitleaks のクロスプラットフォーム対応
- Linux: x64/arm64 対応（tar.gz 展開）
- macOS: x64/arm64 対応（tar.gz 展開）
- Windows: x64 対応（PowerShell Expand-Archive）
- 冪等性あり（既にインストール済みならスキップ）

### verify の 15 項目チェック
**存在チェック（6項目）**:
- .secretlintrc.json
- gitleaks.toml
- .security-check/ ディレクトリ
- .git/hooks/pre-commit
- package.json の simple-git-hooks 設定
- package.json の scripts.security

**中身チェック（3項目）**:
- .secretlintrc.json に preset-recommend が含まれているか
- gitleaks.toml に検出ルール（[extend] または [[rules]]）があるか（[allowlist] のみだと検出ルール0個で動作するため）
- .git/hooks/pre-commit に .security-check/cli.js の記述があるか

**動作チェック（6項目）**:
- secretlint コマンドが動くか
- gitleaks バイナリが動くか（.security-check/bin またはグローバル、どちらでも検出）
- gitleaks 機能的カナリアテスト（合成シークレットを実際に検出できるか）
- 実行ログの最終確認（.security-check/logs/pre-commit.log）
- ネガティブテスト実行痕跡（Step 3.5.5のネガティブテストが実際に実行されカナリアがブロックされた記録があるか）
- 毎コミット自動カナリア自己検証の実行痕跡（pre-commitが毎コミット自動でカナリアを注入し、検出器が生きているかを直近コミットで確認できているか）

### フェイルクローズ方針（v3）
gitleaksバイナリが見つからない状態は「secretlintのみで守られている」半端な状態であり、気づかれないまま運用が続くこと自体がリスクと考え、v3では警告に留めずコミットをブロックします。中途半端な状態を許容するオプトイン設定は用意していません。「全部入れる」か `uninstall` で「全部外す」かの二択です。

### pre-commit 実行ログ
- 出力先: `.security-check/logs/pre-commit.log`（.gitignore 管理）
- フォーマット: JSONL（1実行1行）
- 記録内容: `timestamp / result（passed/failed）/ branch / autoCanary`
- ローテーション: 最新 50 件を保持

### 毎コミット自動カナリア自己検証
「検出ルールが今も生きているか」を人間が意識せず**毎コミット自動で**証明する仕組み。手動ネガティブテストとは別物で、こちらは追加のプロセス起動なしに動く:
- **gitleaks**: 合成シークレットを git index にのみ blob として注入し（作業ツリーには一切書かない）、既存の `--staged` スキャン1回に混ぜて検出。直後に index から除去
- **secretlint**: ファイルパスしか受け付けないため、cwd 配下に一時ファイルを書いて既存のスキャン対象リストに混ぜ、直後に削除
- カナリアが検出できなければ「検出ルールが機能していない」と判断してコミットをブロックする（フェイルクローズ）
- ユーザーの実ステージ内容とカナリアのパス名が偶然衝突した場合のみ、自己検証をスキップし実コミットはブロックしない
- 結果は `.security-check/logs/pre-commit.log` の `autoCanary: { gitleaks, secretlint }` フィールド（各 `ok` / `failed` / `cleanup-failed` / `skipped`）に記録され、check#15がこれを確認する

### アンインストール
`node .security-check/cli.js uninstall` で導入物（`.security-check/`・package.jsonの該当エントリ・git hook）を除去できます。`gitleaks.toml` / `.secretlintrc.json` はユーザー編集対象のため自動削除されません。デフォルトはドライランで、`--yes` を付けた場合のみ実行されます。

### テストラン（--test-run）
- ヘルスチェックが全て ✅ → 実際のスキャンを実行
- secretlint "**/*" を実行（全ファイル）
- gitleaks git（全履歴）を実行
- 検出があれば詳細表示（最初の 20-30 行）

---

## 📖 設計思想

### 四層構造アーキテクチャの適用

**確実に動くパート**（揺れない）:
- Node.js スクリプト（OS 判定、ファイルコピー、ヘルスチェック）
- テンプレートファイル（AI が生成しない、コピーのみ）

**揺れるパート**（AI の役割）:
- ウィザード案内（コマンドを提示、結果を受けて次を案内）
- 検出結果の解釈（本物のシークレットか、プレースホルダーか）

### AI に任せすぎない
- **設定ファイルは AI が生成しない**（テンプレートからコピー）
- **スクリプトは AI が変更しない**（確定的に動作する）
- **verify は人間が叩く**（AI が設定 → AI が確認のループを断ち切る）

### ワンショット型の一貫性
- my-ai-collaboration-patterns の他パターンと同じ思想
- `npx degit` で一式取得 → `install.js`（推奨）または手順書をAIが実行・案内
- 人間が責任を持ってコマンドを実行

---

## 🔗 関連パターン

- [docs-structure](../../docs-structure/) - ドキュメント構造パターン
- [actions-pattern](../../actions-pattern/) - AI への指示テンプレート
- [setup-securecheck-3.0.2](../setup-securecheck-3.0.2/) - v3.1.0（Node.js製インストーラー導入）より前の状態を凍結したスナップショット。今後更新されません（詳細は同ディレクトリの`SNAPSHOT_NOTE.md`参照）

---

## 📝 ライセンス

MIT License - 自由に使用・改変・配布できます
