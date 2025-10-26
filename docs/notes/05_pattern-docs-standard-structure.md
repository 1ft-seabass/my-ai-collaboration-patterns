# パターンドキュメントの標準構造

**作成日**: 2025-10-26
**カテゴリ**: ドキュメント設計
**関連パターン**: すべてのパターン

## 📝 概要

パターンのREADME.mdとGUIDE.mdの役割分担と標準構造を確立しました。これにより、人間とAIの両方にとって使いやすく、一貫性のあるドキュメント体系が実現できます。

## 🎯 問題

パターンを追加・改善する際に、以下の問題がありました：

- README.md と GUIDE.md の役割が曖昧
- degit コマンドのユーザー名がプレースホルダー（`<username>`）で実用的でない
- AIへのワンショット指示がなく、人間が毎回説明を考える必要がある
- 導入方法（degit vs 手動作成）の優先順位が不明確

## 💡 解決策

### README.md と GUIDE.md の役割分担

| ファイル | 対象 | 目的 | 内容 |
|---------|------|------|------|
| **README.md** | 人間 → AI | 橋渡し | ・冒頭にワンショット指示<br>・人間が読めるパターン説明<br>・使い方、効果、FAQ |
| **GUIDE.md** | AI | 補足理解 | ・degit後に読む前提<br>・「なぜこの構造なのか」の説明<br>・配置された構造の意図 |

### ワンショット指示の標準フォーマット

README.md の冒頭に必ず配置：

```markdown
> **🤖 AIへのワンショット指示（コピペ用）**
>
> ```
> https://github.com/1ft-seabass/my-ai-collaboration-patterns/tree/main/patterns/パターン名
> この仕組みを導入したいです。degit で構造をそのまま持ってきましょう。
> degit するのは配下の templates フォルダの中身です。
> また、中の各 README や TEMPLATE を案件固有のものに合わせてください。
> ```
```

**ポイント:**
- 人間がコピペするだけでAIに意図を伝えられる
- GitHubリポジトリURLで文脈を提供
- degit と templates フォルダの関係を明示
- カスタマイズの必要性を明記

### degit コマンドのユーザー名

**決定**: プレースホルダー（`<username>`）ではなく、実際のユーザー名（`1ft-seabass`）をハードコード

**理由:**
- **即座に使える**: コピペで動作する
- **実用性**: ユーザーがリネームする手間がない
- **明確さ**: 「どのリポジトリか」が一目瞭然

**例:**
```bash
# ❌ 旧: プレースホルダー（使えない）
npx degit <username>/my-ai-collaboration-patterns/patterns/docs-structure/templates ./docs

# ✅ 新: 実際のユーザー名（即座に使える）
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure/templates ./docs
```

### 導入方法の優先順位

**主要な方法**: degit（推奨）

**GUIDE.md の位置づけ:**
- degit で構造を配置した**後**に読む補足資料
- 手動作成手順は含めない
- 「配置された構造」をどう理解・活用するかに焦点

**README.md での明記:**
```markdown
## 🚀 使い方

### degit で取得（推奨）

**重要**: `templates` ディレクトリを指定してください。パターン直下ではなく、`templates` 以下がプロジェクトで使用する構造です。

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/パターン名/templates ./目的地
```
```

## 📊 適用結果

### 改善したパターン

1. **docs-structure**
   - ワンショット指示追加
   - degit コマンド修正（`<username>` → `1ft-seabass`）
   - GUIDE.md: 273行 → 170行（38%削減）

2. **actions-pattern**
   - ワンショット指示追加
   - degit コマンド修正
   - templates ディレクトリの重要性を明記
   - GUIDE.md: 476行 → 242行（49%削減）

3. **docs-structure-for-target-branch-only**
   - ワンショット指示追加
   - すべての degit コマンド修正
   - GUIDE.md: 構造改善（ブランチ封じ込めの哲学を明確化）

### 一貫性の確立

すべてのパターンで統一された構造を実現：
- 冒頭のワンショット指示
- 実用的な degit コマンド
- README（人間向け）と GUIDE（AI向け）の明確な役割分担

## 🎓 学び

### README.md: 人間 → AI の橋渡し

**機能:**
1. ワンショット指示でAIに即座に意図を伝える
2. 人間が読んでパターンを理解できる
3. 使い方、効果、FAQで実用的な情報を提供

**重要性:**
- 人間がAIに「何をしてほしいか」を簡潔に伝えられる
- パターンの価値提案が明確

### GUIDE.md: AI の補足理解

**機能:**
1. degit後に配置された構造の意図を説明
2. 「なぜこの構造なのか」の哲学を伝える
3. カスタマイズ方法と運用のコツを提供

**重要性:**
- AIが構造の背景を理解することで、より適切な判断ができる
- 手動作成手順を含めない（degitが主要な方法）
- コンパクトに保つ（150-250行目安）

### ユーザー名のハードコーディング

**判断基準:**
- **ハードコード**: 公開パターン、即座に使える必要がある
- **プレースホルダー**: テンプレート、ユーザーがカスタマイズ前提

このリポジトリは**公開パターン集**なので、ハードコードが適切。

## 🔄 今後の適用

### 新しいパターンを追加する場合

1. **README.md 作成**
   - 冒頭にワンショット指示
   - 実際のユーザー名で degit コマンド
   - templates ディレクトリの重要性を明記
   - 使い方、効果、FAQを記述

2. **GUIDE.md 作成**
   - 「degit後に読む補足資料」と明記
   - 配置された構造を図示
   - コアコンセプト（なぜこの構造か）
   - カスタマイズ方法
   - 150-250行に収める

3. **templates/ ディレクトリ**
   - 実際に配置される構造を格納
   - README や TEMPLATE は汎用的に保つ

### 既存パターンを改善する場合

1. ワンショット指示がない → 追加
2. `<username>` がある → `1ft-seabass` に変更
3. GUIDE.md が長すぎる → 手動作成手順を削除、150-250行に簡略化
4. README/GUIDE の役割が曖昧 → 明確に分離

## 📚 関連ノート

- [02_pattern-structure-design.md](./02_pattern-structure-design.md) - パターン構造設計の初期検討
- [06_guide-simplification-principles.md](./06_guide-simplification-principles.md) - GUIDE.md簡略化の原則

## 🔖 タグ

`#ドキュメント設計` `#README` `#GUIDE` `#degit` `#標準化` `#一貫性`
