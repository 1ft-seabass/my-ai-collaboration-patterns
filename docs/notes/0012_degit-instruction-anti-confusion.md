# degit 指示の曖昧性解消（templatesフォルダ名問題）

**日付**: 2025-11-01
**カテゴリ**: AI指示最適化
**関連パターン**: 全パターン（writing-collaborate, docs-structure, actions-pattern, docs-structure-for-target-branch-only）

## 🎯 課題

### 問題の症状

AIへのワンショット指示で「degit するのは配下の templates フォルダの中身です」と伝えていたが、**1/3の確率でAIが誤解**して以下のような構造を作成してしまう：

**NG例1**: `templates` フォルダ名のまま配置
```
templates/
  ├── README.md
  ├── notes/
  └── letters/
```

**NG例2**: ネストした構造を作成
```
docs/templates/
  ├── README.md
  └── ...
```

または

```
collaborate/templates/
  ├── README.md
  └── ...
```

### 期待していた動作

`templates/` の**中身**を `docs/` や `collaborate/` に配置してほしい：

```
docs/
  ├── README.md
  ├── notes/
  └── letters/
```

### メタ的な難しさ

この問題は非常にメタ的で修正が難しい：
- パターン自体が「構造を作る」ためのもの
- AIに「構造の作り方」を指示している
- フォルダ名の扱いが曖昧だと、AIが混乱する

## 💡 解決策

### 改善前の指示（曖昧）

```markdown
https://github.com/1ft-seabass/my-ai-collaboration-patterns/tree/main/patterns/writing-collaborate
この仕組みを導入したいです。degit で構造をそのまま持ってきましょう。
degit するのは配下の templates フォルダの中身です。
また、中の各 README や TEMPLATE を案件固有のものに合わせてください。
```

**問題点**:
- `degit` がメジャーなコマンドではない（AIが認識しづらい）
- 「templates フォルダの中身」が曖昧
- 期待する結果が明示されていない
- NG例が示されていない

### 改善後の指示（明確）

```markdown
https://github.com/1ft-seabass/my-ai-collaboration-patterns/tree/main/patterns/writing-collaborate
この仕組みを導入したいです。npx degit で構造を持ってきましょう。

npx degit で取得した templates/ 配下のファイル群を、
templates/ というフォルダ名ではなく、collaborate/ 直下に配置してください。

期待する結果：
  collaborate/
    ├── README.md
    ├── notes/
    ├── letters/
    └── tasks/

NG例（これは避ける）：
  collaborate/templates/  ← templatesフォルダを作らない
  templates/              ← templatesという名前で配置しない

また、中の各 README や TEMPLATE を案件固有のものに合わせてください。
```

## 🎓 改善の核心ポイント

### 1. `degit` → `npx degit` に明記

- より具体的なコマンド名
- AIが認識しやすい

### 2. フォルダ構造を図示

視覚的に期待する結果を示すことで、曖昧さを排除：

```
期待する結果：
  collaborate/
    ├── README.md
    ├── notes/
    └── ...
```

### 3. NG例を明示

「これは避ける」と具体例を示すことで、誤解を防ぐ：

```
NG例（これは避ける）：
  collaborate/templates/  ← templatesフォルダを作らない
  templates/              ← templatesという名前で配置しない
```

### 4. より直接的な表現

**Before**: 「degit するのは配下の templates フォルダの中身です」
- 曖昧（「中身」とは？）

**After**: 「templates/ というフォルダ名ではなく、collaborate/ 直下に配置」
- 明確（フォルダ名を変更する指示）

## 📊 適用したパターン

全4パターンのREADMEを更新：

### 1. writing-collaborate

```
期待: collaborate/ 直下
NG: collaborate/templates/, templates/
```

### 2. docs-structure

```
期待: docs/ 直下（8フォルダ構成を明示）
NG: docs/templates/, templates/
```

### 3. actions-pattern

```
期待: actions/ 直下
NG: actions/templates/, templates/
注: templates/actions/ → actions/ に配置
```

### 4. docs-structure-for-target-branch-only

```
期待: ブランチルート直下（docs/, scripts/, actions/）
NG: templates/, docs/templates/
```

## 🔬 効果の予測

### Before（改善前）
- 成功率: 約66%（1/3の確率で失敗）
- 手戻り: フォルダ構造の手動修正が必要

### After（改善後・予測）
- 成功率: 90%以上（期待）
- 手戻り: ほぼ不要

※実際の効果は今後の運用で検証が必要

## 🎨 汎用的な原則

### AI指示における「構造」の伝え方

1. **視覚化する**: 期待する結果をツリー構造で図示
2. **NG例を示す**: 避けるべきパターンを具体的に
3. **コマンドを明示**: `degit` より `npx degit`
4. **曖昧さを排除**: 「中身」ではなく「直下に配置」

### メタ指示のアンチパターン

メタ的な指示（構造を作る指示）では特に注意：

❌ **曖昧な表現**
- 「フォルダの中身」
- 「そのまま持ってくる」
- 「いい感じに」

✅ **明確な表現**
- 「フォルダ名ではなく、X/ 直下に配置」
- 「期待する結果: (ツリー図)」
- 「NG例: (具体例)」

## 🔗 関連ノート

- [01_degit-understanding.md](./01_degit-understanding.md) - degitの基本理解
- [06_guide-simplification-principles.md](./06_guide-simplification-principles.md) - ガイド簡素化の原則

## 📝 今後の運用

### 新しいパターン追加時のチェックリスト

1. ✅ `npx degit` を明記（`degit` のみは避ける）
2. ✅ 期待する結果をツリー構造で図示
3. ✅ NG例を具体的に明示
4. ✅ フォルダ名の扱いを明確に記述（「X/ 直下に配置」）

### 検証方法

実際にAIに指示を渡して、成功率を測定：
- 5回試行して、何回成功するか
- 失敗パターンの分析
- 必要に応じて指示を再調整

## 💬 補足：なぜ1行追加だけで解決したかったか

当初の要望：「1行加えるレベルでうまく伝えたい」

→ 実際には複数行追加が必要だったが、**構造化された明確な指示**の方が、1行の曖昧な指示より効果的。

AI指示においては：
- **短さ < 明確さ**
- **簡潔さ < 視覚的明快さ**
- **1行 < 構造化された複数行**
