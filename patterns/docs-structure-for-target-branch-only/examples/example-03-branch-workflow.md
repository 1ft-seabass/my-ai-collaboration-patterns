# 例3: ブランチ開発の全体ワークフロー

ブランチ作成からマージ・削除までの全体的なワークフローの例。

## シナリオ

- プロジェクト: ECサイト
- タスク: 商品検索機能の追加
- ブランチ: `feature/product-search`
- 期間: 2週間
- チーム: 1人（AI協働開発）

## フェーズ1: ブランチ作成とセットアップ（Day 1）

### 1-1. ブランチ作成

```bash
git checkout main
git pull origin main
git checkout -b feature/product-search
```

### 1-2. パターンのセットアップ

```bash
npx degit your-username/my-ai-collaboration-patterns/patterns/docs-structure-for-target-branch-only/templates .
npm init -y
npm install
```

### 1-3. AIにブランチ開発の開始を伝える

```
「docs/README.md を読んで、feature/product-search ブランチでの開発を開始します。
このブランチでは商品検索機能を実装します」
```

### 1-4. 仕様書を作成

```
「docs/spec/product-search.md に以下の仕様を記録してください：
- キーワード検索（商品名、説明文）
- カテゴリフィルター
- 価格範囲フィルター
- 検索結果のページネーション」
```

生成される `docs/spec/product-search.md`:

```markdown
# 商品検索機能 仕様書

## 概要
ユーザーが商品を検索し、フィルタリングできる機能

## 要件

### 検索機能
- キーワード検索（商品名、説明文を対象）
- 部分一致検索

### フィルター機能
- カテゴリフィルター（複数選択可）
- 価格範囲フィルター（最小値・最大値）

### 結果表示
- ページネーション（1ページ20件）
- 検索結果件数の表示

...
```

### 1-5. 申し送り作成

```
@actions/git_commit_and_push.md
「docs/letter/ に本日の申し送りを作成してください」
```

## フェーズ2: 実装（Day 2-10）

### 2-1. セッション開始（毎日）

```
@actions/simple_start_from_latest_letter.md
```

AIが最新の申し送りを読み、前回の続きから開始します。

### 2-2. 開発サーバーの起動

```
「scripts/start/dev-server.js で開発サーバーを起動してください」
```

```bash
npm run dev
# 🚀 Dev server is running on http://localhost:3000
```

### 2-3. 実装とテスト

```
「商品検索APIエンドポイント /api/products/search を実装してください。
実装後、scripts/test/ にテストを追加してください」
```

実装例:

```javascript
// src/routes/products.js
app.get('/api/products/search', async (req, res) => {
  const { keyword, category, minPrice, maxPrice, page = 1 } = req.query;

  // 検索ロジック
  const results = await searchProducts({
    keyword,
    category,
    minPrice,
    maxPrice,
    page
  });

  res.json(results);
});
```

テスト例:

```javascript
// scripts/test/api-search.test.js
test('GET /api/products/search returns filtered results', async () => {
  const response = await request(app)
    .get('/api/products/search?keyword=laptop&minPrice=50000');

  expect(response.status).toBe(200);
  expect(response.body.results.length).toBeGreaterThan(0);
});
```

### 2-4. テスト実行

```
「scripts/test/run-all.js でテストを実行してください」
```

```bash
npm test
# ✅ All tests passed!
```

### 2-5. 試行錯誤の記録

問題に遭遇した場合:

```
「Elasticsearchのクエリ最適化について調査しました。
docs/notes/ にパフォーマンス改善の内容を記録してください」
```

生成される `docs/notes/03_elasticsearch-optimization.md`:

```markdown
# Elasticsearch クエリ最適化

## 日時
2025-10-28

## 問題
検索が遅い（平均3秒）

## 調査内容
- インデックスの最適化
- クエリのチューニング
- キャッシュ戦略

## 解決策
- multi_match クエリの使用
- インデックス再構築
- Redis キャッシュの導入

## 結果
平均0.5秒に改善

...
```

### 2-6. セッション終了

```
「今日の作業内容を docs/letter/ に申し送りとして記録してください」
@actions/git_commit_and_push.md
```

## フェーズ3: レビューと調整（Day 11-12）

### 3-1. 全体的なテスト

```
「scripts/test/run-all.js でテストを実行してください。
カバレッジレポートも確認してください」
```

```bash
npm test
# Coverage: 85% (目標: 80%以上)
```

### 3-2. ビルド確認

```
「scripts/build/prod.js で本番ビルドを実行してください」
```

```bash
npm run build
# ✅ Production build completed!
```

### 3-3. ドキュメントの整理

```
「docs/notes/ に記録されている知見をまとめて、
docs/architecture/decisions/ にADRとして記録してください」
```

生成される `docs/architecture/decisions/001-elasticsearch-for-search.md`:

```markdown
# ADR 001: Elasticsearch を商品検索に使用

## ステータス
採用

## 文脈
商品検索機能で高速な全文検索が必要

## 決定
Elasticsearchを採用

## 理由
- 全文検索に優れている
- スケーラビリティが高い
- 豊富なフィルタリング機能

## 結果
- 検索速度: 平均0.5秒
- カバレッジ: 85%

...
```

## フェーズ4: PR作成とマージ（Day 13）

### 4-1. 最終確認

```
「docs/letter/ の全ての申し送りを確認して、
このブランチで実装した内容をまとめてください」
```

### 4-2. PR作成

```bash
git push origin feature/product-search
gh pr create --title "feat: 商品検索機能の追加" --body "$(cat <<'EOF'
## 概要
商品検索機能（キーワード検索、フィルター、ページネーション）を実装

## 主な変更
- 商品検索APIエンドポイント追加 (/api/products/search)
- Elasticsearch統合
- テストカバレッジ: 85%

## 参考ドキュメント
- docs/spec/product-search.md - 仕様書
- docs/notes/03_elasticsearch-optimization.md - 最適化ノート
- docs/architecture/decisions/001-elasticsearch-for-search.md - ADR

## テスト
- npm test で全テストパス
- npm run build で本番ビルド成功

## スクリーンショット
（必要に応じて追加）
EOF
)"
```

### 4-3. レビュー対応

レビューコメントに対応:

```
「PRレビューで指摘された点を修正してください：
1. エラーハンドリングの改善
2. テストケースの追加」
```

```bash
npm test
# ✅ All tests passed!

git add .
git commit -m "fix: レビュー指摘事項の修正"
git push origin feature/product-search
```

### 4-4. マージ

```bash
# PRがマージされる（GitHubで）
# または
git checkout main
git merge feature/product-search
git push origin main
```

## フェーズ5: クリーンアップ（Day 14）

### 5-1. 知見の抽出（オプション）

mainブランチに反映すべき知見があれば抽出:

```
「docs/notes/03_elasticsearch-optimization.md の内容を、
mainブランチの docs/best-practices/elasticsearch.md に反映してください」
```

### 5-2. ブランチ削除

```bash
git checkout main
git branch -D feature/product-search
git push origin --delete feature/product-search
```

**結果**: docs/, scripts/, actions/ が全て削除される。mainブランチはクリーンなまま！

## 全体のタイムライン

| Day | フェーズ | 主な作業 | ドキュメント |
|-----|---------|---------|------------|
| 1 | セットアップ | ブランチ作成、パターン適用 | spec/product-search.md |
| 2-10 | 実装 | API実装、テスト作成 | notes/、letter/ |
| 11-12 | レビュー | テスト・ビルド確認、ADR作成 | architecture/decisions/ |
| 13 | PR作成 | PR作成、レビュー対応 | - |
| 14 | クリーンアップ | ブランチ削除 | - |

## ポイント

### ✅ Good

- **仕様から開始**: docs/spec/ に仕様を記録してから実装
- **毎日の申し送り**: セッション終了時に必ず記録
- **試行錯誤を記録**: docs/notes/ に蓄積
- **ADRで意思決定を記録**: 重要な決定は docs/architecture/decisions/
- **スクリプトで自動化**: テスト・起動・ビルドをスクリプト化
- **actionsで効率化**: 繰り返しタスクをactionsで自動化

### ❌ Bad

- 実装を始めてからドキュメントを書く
- 申し送りを書かずにセッション終了
- 試行錯誤を記録せず、同じ問題を繰り返す
- 手動でテスト・ビルドを実行

## 成果

### ブランチ封じ込めの効果

- **mainブランチがクリーン**: 実験的な変更がmainに残らない
- **文脈の分離**: 他のブランチと混ざらない
- **簡単な削除**: ブランチ削除で全て消える
- **知見の蓄積**: docs/notes/ に試行錯誤を記録
- **再現性**: scripts/ でテスト・起動・ビルドを自動化

### 生産性の向上

- **セッション開始時間**: 10分 → 2分（申し送りから即座に再開）
- **テスト実行**: 手動 → `npm test` で自動化
- **ドキュメント検索**: 散在 → docs/ に集約

## まとめ

このパターンを使うことで：
- ブランチ開発が体系的に管理される
- 知見が蓄積され、再利用可能になる
- mainブランチがクリーンに保たれる
- AIとの協働開発がスムーズになる

---

**関連ドキュメント**:
- [README.md](../README.md) - パターンの概要
- [GUIDE.md](../GUIDE.md) - セットアップガイド
- [example-01-basic-setup.md](./example-01-basic-setup.md) - 基本セットアップ
- [example-02-with-nodejs-scripts.md](./example-02-with-nodejs-scripts.md) - Node.jsスクリプト実装
