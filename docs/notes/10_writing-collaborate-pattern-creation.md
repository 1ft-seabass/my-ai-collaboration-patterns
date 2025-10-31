# writing-collaborate パターンの作成 - 開発記録

**作成日**: 2025-11-01
**関連タスク**: patterns/writing-collaborate/ の新規作成

## 背景

### 問題意識

`docs-structure` パターンは非常に優秀だが、執筆作業（ブログ記事、Zenn books、Honkit など）では以下の課題があった：

1. **docs/ フォルダの衝突**
   - Honkit、mdBook、Zenn books などの静的サイトジェネレーターは `docs/` を GitHub Pages 用に使用
   - `docs-structure` の `docs/` フォルダと衝突してしまう

2. **開発機能が過剰**
   - ブログ記事やハンズオン資料の執筆には ADR、actions、architecture、spec は不要
   - もっとシンプルな構成で十分

3. **開発用語の違和感**
   - 「実装」「デプロイ」「テスト」などの開発用語が執筆作業にはマッチしない
   - 執筆作業に特化した用語が必要

## 解決策

### writing-collaborate パターンの作成

docs-structure をベースに、以下の方針で執筆作業向けに最適化：

1. **フォルダ名の変更**: `docs/` → `collaborate/`
2. **構成の簡素化**: 7フォルダ → 3フォルダ（notes、letters、tasks のみ）
3. **用語の調整**: 開発用語 → 執筆用語
4. **letters の複数形化**: `letter/` → `letters/`（一貫性向上）

## 実装プロセス

### Step 1: ディレクトリ構造の作成

```bash
mkdir -p patterns/writing-collaborate/templates/{notes,letters,tasks}
```

### Step 2: 各ファイルの作成

優先順位：
1. `patterns/writing-collaborate/README.md` - パターンの説明
2. `patterns/writing-collaborate/GUIDE.md` - AI向けガイド
3. `templates/README.md` - プロジェクトに配置後の使い方
4. `templates/notes/` - README.md と TEMPLATE.md
5. `templates/letters/` - README.md と TEMPLATE.md
6. `templates/tasks/` - README.md と TEMPLATE.md

### Step 3: 用語の調整

以下の開発用語を執筆用語に置き換え：

| 開発用語 | 執筆用語 |
|---------|---------|
| 実装 | 執筆 |
| コード | 原稿・記事 |
| デプロイ | 公開 |
| テスト | 確認・レビュー |
| リファクタリング | 推敲・書き直し |
| バグ | 誤字・脱字・矛盾 |
| 機能 | 章・節・コンテンツ |

## 成果物

### 作成ファイル（全9ファイル）

```
patterns/writing-collaborate/
├── README.md                          # AIワンショット指示付き
├── GUIDE.md                          # AI向け詳細ガイド
└── templates/
    ├── README.md
    ├── notes/
    │   ├── README.md
    │   └── TEMPLATE.md
    ├── letters/
    │   ├── README.md
    │   └── TEMPLATE.md
    └── tasks/
        ├── README.md
        └── TEMPLATE.md
```

### 主な特徴

1. **collaborate/ フォルダ**: docs/ と衝突しない
2. **3フォルダ構成**: シンプルで軽量
3. **執筆用語**: 開発用語を一切使用しない
4. **README駆動**: すべてのフォルダにREADME.md
5. **テンプレート**: すぐに使えるテンプレート

### 使用例

README.md に以下の具体例を記載：

- Zenn books の執筆
- Honkit プロジェクト
- ブログ記事の執筆
- ハンズオン資料の作成

## 学び

### docs-structure との使い分けが明確になった

| 用途 | 選択すべきパターン |
|------|-------------------|
| ソフトウェア開発 | docs-structure |
| 執筆作業 | writing-collaborate |

### 軽量化の重要性

執筆作業では、開発プロジェクトほど複雑な構造は不要。
必要最小限の構成（notes、letters、tasks）で十分に機能する。

### 用語の一貫性

ターゲット領域（開発 or 執筆）に合わせた用語選択が重要。
違和感のある用語は、AIと人間の両方にとってストレスになる。

### letters の複数形化

`letter/` → `letters/` への変更は、以下の理由で妥当：
- 複数のファイルを格納するフォルダは複数形が自然
- notes、tasks も複数形なので一貫性がある
- docs-structure でも今後反映すべき変更

## 今後の展開

### docs-structure への逆輸入

以下の改善を docs-structure にも反映すべき：
- [ ] `letter/` → `letters/` への変更
- [ ] 軽量化の考え方の導入（オプショナルなフォルダの明示）

### 他のパターンとの組み合わせ

- writing-collaborate + branch-only: 超軽量な執筆管理
- writing-collaborate + docs-structure: 技術書執筆（開発も含む）

## 関連ドキュメント

- [patterns/writing-collaborate/README.md](../../patterns/writing-collaborate/README.md) - パターン説明
- [patterns/docs-structure/](../../patterns/docs-structure/) - 参考元パターン
- [Note 08](./08_letters-naming-change.md) - letters 複数形化の経緯
- [Note 09](./09_notes-4digit-numbering-change.md) - 連番4桁化の経緯

---

**最終更新**: 2025-11-01
**作成者**: 1ft-seabass + Claude
