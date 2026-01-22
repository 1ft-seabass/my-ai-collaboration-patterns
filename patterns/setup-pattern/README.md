# setup-pattern - セットアップパターン

よく使われる技術スタックやツールの段階的導入ガイド集

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

## 🎯 利用可能なセットアップガイド

### [setup_securecheck](./setup_securecheck/) - セキュリティチェック
secretlint + gitleaks によるシークレットスキャン導入

**対象プロジェクト**:
- AI 生成ドキュメント（letters/notes）を含むプロジェクト
- 認証情報が混入するリスクがあるプロジェクト
- プライベートリポジトリでもセキュリティを確保したい

**ワンショット取得**:
```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup_securecheck ./setup_securecheck
```

**段階的導入の流れ**:
| Phase | 内容 | いつ止めるか |
|-------|------|------------|
| Phase 1 | 初動スキャン（現状把握） | 問題なし → Phase 2 へ |
| Phase 2 | 手動運用（npm scripts） | ピュアなコミット保持したい場合 |
| Phase 3 | pre-commit 強制（全員） | チーム全員で使う場合 |
| Phase 4 | pre-commit 強制（個人用） | 自分だけ使いたい場合 |

## 📂 ディレクトリ構成

```
patterns/setup-pattern/
├── README.md                           # このファイル（setup-pattern 全体の説明）
└── setup_securecheck/                  # セキュリティチェック導入ガイド
    ├── README.md                       # ワンショット指示
    ├── setup_securecheck.md            # 手順書
    └── templates/                      # サンプルファイル集
        ├── .secretlintrc.json
        ├── .gitleaksignore
        ├── gitleaks.toml
        ├── .husky/pre-commit
        ├── package.json.example
        ├── gitignore.example
        └── scripts/
```

### 構成の原則

各セットアップガイド（`setup_xxxx/`）は以下の構成を取ります:

```
setup_xxxx/
├── README.md                # ワンショット指示（コピペ用）
├── setup_xxxx.md            # 手順書（AI が読むメイン文書）
└── templates/               # サンプルファイル集（コピペ元）
```

| ファイル | 役割 |
|---------|------|
| **README.md** | ワンショット指示（npx degit のパスを含む） |
| **setup_xxxx.md** | AI が読む手順書（メイン） |
| **templates/** | サンプルファイル集（補助・コピペ元） |

## 🚀 使い方

### degit で取得（推奨）

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

プロジェクトに配置後、AIアシスタントに以下を指示:

```
「setup_securecheck.md を読んで、段階的にセキュリティチェックを導入してください」
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

## 📚 今後の追加候補

プロジェクトの成熟度に応じて追加予定:

- `setup_prettier/` - コードフォーマッター導入
- `setup_eslint/` - ESLint + TypeScript 環境構築
- `setup_testing/` - Jest / Vitest テスト環境
- `setup_docker_devcontainer/` - Dev Container 環境構築
- `setup_ci_github_actions/` - GitHub Actions CI/CD

## 🔗 関連パターン

- [actions-pattern](../actions-pattern/) - AI への指示テンプレート
- [docs-structure](../docs-structure/) - ドキュメント構造の説明

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

**Q: 複数のセットアップガイドを組み合わせられる？**
A: はい。各セットアップガイドは独立しているため、必要なものを組み合わせて使えます。

## 📝 ライセンス

MIT License - 自由に使用・改変・配布できます
