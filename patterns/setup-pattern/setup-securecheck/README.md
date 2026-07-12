# setup-securecheck - セキュリティチェック導入ガイド

secretlint + gitleaks によるシークレットスキャンの**ウィザード形式**導入ガイド

**二重チェック体制**: secretlint と gitleaks を両方使うことで、より確実にシークレットを検出します。

---

## 🚀 新規プロジェクト / 既存プロジェクト 共通

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
> - v1（husky + lint-staged）→ v2: `migration/MIGRATION_GUIDE_v1_to_v2.0.1.md`
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
├── setup-securecheck.md              # ウィザード手順書（AI が読むメイン文書）
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
            ├── install-gitleaks.js   # gitleaks インストーラー（OS 自動判定）
            └── uninstall.js          # アンインストール
```

導入後、プロジェクトルートには `.secretlintrc.json` / `gitleaks.toml`（設定ファイル、編集対象）と `.security-check/`（ツール一式、`.husky/`同様に通常は編集しない領域）が配置されます。

**注**: `tmp/` は一時ディレクトリとして使用します。導入完了後は `rm -rf tmp/security-setup/` で削除できます。

### ファイルの役割

| ファイル | 役割 | AI の扱い |
|---------|------|----------|
| **setup-securecheck.md** | ウィザード手順書 | AI が読んで人間に案内 |
| **templates/.secretlintrc.json** | secretlint 設定 | **コピーのみ**（AI は生成しない） |
| **templates/gitleaks.toml** | gitleaks 設定 | **コピーのみ**（AI は生成しない） |
| **templates/.security-check/** | 確定的なツール一式 | **コピーして実行**（AI は変更しない） |
| **package.json.example** | scripts 追記サンプル | AI が既存 package.json に統合 |
| **gitignore.example** | .gitignore 追記サンプル | AI が既存 .gitignore に統合 |

---

## 🎯 導入の流れ（Phase 0-3）

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
| `node .security-check/cli.js install-gitleaks` | gitleaks バイナリのインストール（OS 自動判定） |
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
- `npx degit` で一式取得 → AI に手順書を読ませる
- 人間が責任を持ってコマンドを実行

---

## 🔗 関連パターン

- [docs-structure](../../docs-structure/) - ドキュメント構造パターン
- [actions-pattern](../../actions-pattern/) - AI への指示テンプレート

---

## 📝 ライセンス

MIT License - 自由に使用・改変・配布できます
