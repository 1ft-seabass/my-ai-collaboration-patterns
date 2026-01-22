# setup_securecheck - セキュリティチェック導入ガイド

> **🤖 AIへのワンショット指示（コピペ用）**
>
> ```
> https://github.com/1ft-seabass/my-ai-collaboration-patterns/tree/main/patterns/setup-pattern/setup_securecheck
> このパターンを使ってセキュリティチェック（secretlint + gitleaks）を導入したいです。
>
> npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup_securecheck ./setup_securecheck
>
> setup_securecheck.md を読んで、段階的に導入してください。
> Phase 1 から順に進め、各 Phase で判断が必要な場合は確認してください。
>
> 期待する結果：
> - Phase 1: 初動スキャン（現状把握）
> - Phase 2: 手動運用（npm scripts）
> - Phase 3 または 4: pre-commit 自動化（ユーザーに確認）
> ```

secretlint + gitleaks によるシークレットスキャンの段階的導入ガイド

## 📦 このパターンについて

AI 協働開発において、技術導入を段階的に進めるためのワンショットセットアップガイドを提供します。

### 解決する問題

- **いきなり自動化して失敗**: 現状把握せずに導入し、設定ミスやトラブル多発
- **チーム vs 個人の違い**: 全員強制か個人用か、プロジェクトに合わない導入方法
- **手順書の不足**: AI が判断に迷い、質問攻めになる

### このパターンの特徴

- **段階的導入**: Phase 1（現状把握）→ Phase 2（ライト版）→ Phase 3/4（フル版）
- **判断ポイント明示**: AI が確認すべきタイミングを明記
- **サンプルファイル完備**: すぐにコピペできる設定ファイル・スクリプト
- **環境別対応**: Docker, Windows など環境ごとの手順を記載

## 🚀 使い方

### degit で取得（推奨）

**重要**: `templates/setup_xxxx` ディレクトリを指定してください。手順書とサンプルファイルがセットで取得されます。

```bash
# セキュリティチェック（secretlint + gitleaks）
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup_securecheck ./setup_securecheck
```

### Git Clone

```bash
git clone https://github.com/1ft-seabass/my-ai-collaboration-patterns.git
cp -r my-ai-collaboration-patterns/patterns/setup-pattern/setup_securecheck ./setup_securecheck
```

### AIに読ませる

プロジェクトに配置後、AIアシスタントに以下を指示：

```
「setup_securecheck.md を読んで、段階的にセキュリティチェックを導入してください」
```

## 📂 作成される構造

```
setup_securecheck/
├── setup_securecheck.md              # 手順書（AI が読むメイン文書）
└── setup_securecheck/                # サンプルファイル集（コピペ元）
    ├── .secretlintrc.json            # secretlint 設定
    ├── .gitleaksignore               # gitleaks ignore 設定
    ├── gitleaks.toml                 # gitleaks 設定
    ├── .husky/pre-commit             # pre-commit フック
    ├── package.json.example          # package.json サンプル
    ├── gitignore.example             # .gitignore サンプル
    └── scripts/
        ├── secret-scan.sh            # 手動スキャンスクリプト
        ├── install-gitleaks.sh       # gitleaks インストール
        └── pre-commit.js             # Node.js 版 pre-commit
```

### 役割

| ファイル | 役割 |
|---------|------|
| **setup_securecheck.md** | AI が読む手順書（メイン） |
| **setup_securecheck/** | サンプルファイル集（補助・コピペ元） |

## 🎯 利用可能なセットアップガイド

### [setup_securecheck](./setup_securecheck.md)
secretlint + gitleaks によるシークレットスキャン導入

**対象プロジェクト**:
- AI 生成ドキュメント（letters/notes）を含むプロジェクト
- 認証情報が混入するリスクがあるプロジェクト
- プライベートリポジトリでもセキュリティを確保したい

**段階的導入の流れ**:

| Phase | 内容 | いつ止めるか |
|-------|------|------------|
| Phase 1 | 初動スキャン（現状把握） | 問題なし → Phase 2 へ |
| Phase 2 | 手動運用（npm scripts） | ピュアなコミット保持したい場合 |
| Phase 3 | pre-commit 強制（全員） | チーム全員で使う場合 |
| Phase 4 | pre-commit 強制（個人用） | 自分だけ使いたい場合 |

**環境別対応**:
- Docker / Dev Container 対応（gitleaks バイナリ配置）
- Windows 環境対応（Node.js 版 pre-commit）

## 💡 使用例

### AI に導入を依頼する

```
「setup_securecheck.md を読んで、シークレットスキャンを導入してください。
Phase 1 から順に進めて、各 Phase で判断が必要な場合は確認してください。」
```

### 手動で導入する

```bash
# 1. セットアップガイド一式を取得
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup_securecheck ./setup_securecheck

# 2. 手順書を読む
cat setup_securecheck.md

# 3. Phase 1 から順に実行
npm install -D secretlint @secretlint/secretlint-rule-preset-recommend
npx secretlint "**/*"
# ...
```

## 📖 コアコンセプト

### 段階的導入の重視

いきなり自動化せず、段階的に導入することで:

- **Phase 1 で現状把握**: 何が検出されるか確認してから方針決定
- **Phase 2 で手動運用**: 軽量な状態で様子を見る選択肢
- **Phase 3/4 で自動化**: チーム vs 個人で使い分け

### AI が判断すべきポイントの明示

手順書内で以下を明記:

- ✅ **ユーザーに確認**: Phase 3 か Phase 4 か？
- ✅ **ユーザーに確認**: Docker 環境か？
- ✅ **ユーザーに報告**: 検出結果を報告し、方針検討

### サンプルファイルは補助

- AI は手順書を読んで作業する
- サンプルファイルは「コピペ元」として参照
- 手順書内にコード例も含まれているため、サンプルファイルなしでも導入可能

## 🔗 関連パターン

- [actions-pattern](../actions-pattern/) - AI への指示テンプレート
- [docs-structure](../docs-structure/) - ドキュメント構造の説明

## 📚 今後の追加候補

プロジェクトの成熟度に応じて追加予定：

- `setup_prettier.md` - コードフォーマッター導入
- `setup_eslint.md` - ESLint + TypeScript 環境構築
- `setup_testing.md` - Jest / Vitest テスト環境
- `setup_docker_devcontainer.md` - Dev Container 環境構築
- `setup_ci_github_actions.md` - GitHub Actions CI/CD

## ⚡ 効果

### Before（パターン適用前）
- いきなり自動化して設定ミス多発
- チーム開発で全員に影響してしまう
- AI が判断に迷い、質問攻めになる

### After（パターン適用後）
- Phase 1 で現状把握してから導入
- Phase 3/4 でチーム vs 個人を使い分け
- AI が手順書を読んで自律的に作業

## 🙋 よくある質問

**Q: 既存プロジェクトに導入できる？**
A: 可能です。Phase 1 で現状スキャンしてから段階的に導入してください。

**Q: チーム開発で使える？**
A: はい。Phase 3（全員強制）または Phase 4（個人用）を選択できます。

**Q: Docker 環境でも動く？**
A: はい。gitleaks を bin/ に配置する手順が含まれています。

**Q: サンプルファイルは必須？**
A: いいえ。手順書内にコード例があるため、サンプルファイルなしでも導入可能です。

## 📝 ライセンス

MIT License - 自由に使用・改変・配布できます
