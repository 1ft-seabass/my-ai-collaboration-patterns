# setup-pattern templates

このディレクトリには、ワンショットでセットアップ可能な技術導入ガイド集が含まれています。

## 構成

各セットアップガイドは以下の構成を取ります:

```
templates/
├── setup_xxxx.md           # セットアップ手順書
└── setup_xxxx/             # サンプルコード・設定ファイル
    ├── .secretlintrc.json
    ├── .gitleaksignore
    └── scripts/
```

## npx degit での取得

```bash
# 例: セキュリティチェックセットアップのみ取得
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/templates/setup_securecheck ./setup_securecheck
```

## 利用可能なセットアップガイド

### [setup_securecheck](./setup_securecheck.md)
secretlint + gitleaks によるシークレットスキャン導入

**対象**:
- AI 生成ドキュメント（letters/notes）を含むプロジェクト
- 認証情報が混入するリスクがあるプロジェクト

**段階的導入**:
- Phase 1: 初動スキャン（現状把握）
- Phase 2: 手動運用（npm scripts）
- Phase 3: pre-commit 強制（全員）
- Phase 4: pre-commit 強制（個人用）

## 使い方

### AI へ渡す場合

1. `setup_xxxx.md` を AI に読ませる
2. AI が段階的に作業を進める（Phase 1 → Phase 2 → ...）
3. 各 Phase で判断が必要な場合は確認を求める

### 手動で導入する場合

1. `npx degit` でセットアップガイド一式を取得
2. `setup_xxxx.md` を読んで手順を確認
3. `setup_xxxx/` 配下のサンプルファイルを参照
4. プロジェクトの状況に応じて段階的に導入
