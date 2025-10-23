# 使用例

このディレクトリには、docs-structure パターンの具体的な使用例が含まれています。

## 📄 例ファイル一覧

### [01_example-letter.md](./01_example-letter.md)
申し送りの記入例。セッション終了時に作成するドキュメントの見本です。

- 現在の状況（完了・進行中・未着手）
- 次にやること
- 注意事項
- 技術的な文脈

### [02_example-note.md](./02_example-note.md)
開発ノートの記入例。技術的な問題を解決した際の試行錯誤を記録する見本です。

- 問題の定義
- 試行錯誤のプロセス
- 解決策
- 学び

### [03_example-adr.md](./03_example-adr.md)
ADR（Architecture Decision Record）の記入例。重要なアーキテクチャ決定を記録する見本です。

- 背景
- 検討した選択肢
- 決定内容
- トレードオフ

## 💡 使い方

### 申し送りを作成する時

1. `docs/letter/TEMPLATE.md` をコピー
2. [01_example-letter.md](./01_example-letter.md) を参考に記入
3. `docs/letter/YYYY-MM-DD-HH-MM-SS.md` として保存

### 開発ノートを作成する時

1. `docs/notes/TEMPLATE.md` をコピー
2. [02_example-note.md](./02_example-note.md) を参考に記入
3. `docs/notes/XX_タイトル.md` として保存（連番を付与）

### ADRを作成する時

1. [03_example-adr.md](./03_example-adr.md) を参考に新規作成
2. `docs/architecture/decisions/XXXX-タイトル.md` として保存

## 🎯 ポイント

### 申し送りのコツ
- ❌ 曖昧: "だいたい完了"
- ✅ 具体的: "ユーザー認証機能実装完了、テスト待ち"

### 開発ノートのコツ
- 失敗した試行錯誤も記録する（なぜ失敗したか）
- 最終的な解決策だけでなく、プロセスを残す
- 将来同じ問題に遭遇した時に役立つ情報を意識

### ADRのコツ
- 複数の選択肢を比較する
- トレードオフを明確にする
- 決定の理由を詳しく記録
- ステータス（提案中/承認/廃止等）を明記

## 📖 実際の例

このリポジトリの `docs/notes/` には実際の開発ノートがあります：
- `01_degit-understanding.md`
- `02_pattern-structure-design.md`
- `03_repository-dogfooding.md`

これらも参考にしてください。

---

**Tip**: AIに「examples/ の例を参考に申し送りを作成してください」と指示すると、適切な形式で作成してくれます。
