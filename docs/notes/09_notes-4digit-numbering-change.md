# notes 連番を2桁→4桁へ変更 - 開発記録

**作成日**: 2025-11-01
**関連タスク**: ドキュメント構造のスケーラビリティ向上

## 問題

docs-structureパターンとdocs-structure-for-target-branch-onlyパターンにおいて、開発ノートの連番が2桁（`01_`, `02_`, ...）となっていたが、以下の問題が顕在化した：

1. **スケーラビリティの不足**: 2桁（01-99）では最大99個までしか管理できない
2. **実際の知見蓄積ペース**: 良い意味で知見と経緯が大量に蓄積される
3. **tasksとの不整合**: tasksは既に4桁（`TASK-0001.md`）を採用しているのに、notesだけ2桁

## 背景

### ユーザーからのフィードバック
> 「notes の連番が 2 桁だととても足りなく、いい意味ですごく知見と経緯がたまるのでので笑
> tasks とおなじ 4 桁のルールにしてほしいです。」

このフィードバックは、以下の重要な気づきを示している：
- **知見の蓄積は想定以上**: パターンが効果的に機能している証拠
- **長期運用の視点**: 継続的な開発で知見が増え続ける
- **一貫性の重要性**: tasksとnotesで連番ルールが異なるのは不自然

## 試行錯誤

### アプローチA: 2桁のまま維持し、カテゴリ分けで対応
**検討内容**: notes を機能別にサブディレクトリ分けして、各カテゴリで01-99を使う

**結果**: 却下

**理由**:
- カテゴリ分けは構造を複雑にする
- AI が探索しにくくなる
- 時系列での参照が困難になる
- tasksとの不整合は解消されない

---

### アプローチB: 4桁に変更（採用）
**実施内容**:
1. 連番ルールを `XX_` → `XXXX_` に変更
2. 両パターンで変更を適用
3. すべてのドキュメント内の参照と例を更新

**結果**: 成功

**変更範囲**:
- パターンREADME.md: 連番例の更新
- templates/README.md: 命名規則の更新
- templates/notes/README.md: 例示ファイル名を4桁に変更
- templates/notes/TEMPLATE.md: 参照リンクを4桁に変更
- templates/tasks/TEMPLATE.md: notesへの参照を4桁に変更
- templates/ai-collaboration/AI_COLLABORATION_GUIDE.md: すべての例を4桁に変更
- templates/development/best-practices/README.md: ファイル作成例を4桁に変更

## 解決策

### 実装方法

1. **ドキュメント内の連番ルールを一括更新**

```bash
# notes のREADME内のサンプルファイル名を変更
# 例: 01_degit-understanding.md → 0001_degit-understanding.md
sed -i 's/01_degit-understanding/0001_degit-understanding/g' notes/README.md
sed -i 's/02_pattern-structure/0002_pattern-structure/g' notes/README.md
sed -i 's/03_repository-dogfooding/0003_repository-dogfooding/g' notes/README.md

# 命名規則の説明を更新
sed -i 's/XX_タイトル\.md/XXXX_タイトル.md/g' *.md
sed -i 's/連番: 2桁（01, 02, ...）/連番: 4桁（0001, 0002, ...）/g' notes/README.md

# 参照リンクの更新
sed -i 's/XX_related\.md/XXXX_related.md/g' TEMPLATE.md
sed -i 's/XX_title\.md/XXXX_title.md/g' TEMPLATE.md
```

2. **既存ファイルの移行（このリポジトリでは将来対応）**

既存のnotesファイル（01-07）は当面そのまま維持し、08以降は4桁で開始。
完全移行は別途計画的に実施。

### 移行パス

**段階的移行**:
1. ✅ ドキュメント・テンプレートを4桁に更新（今回実施）
2. ⏳ 新規ノートは `0008_` から開始
3. ⏳ 既存ノート（01-07）は後方互換性のため維持
4. ⏳ 将来的に一括リネーム（オプション）

**後方互換性**:
- 既存の2桁ノートは引き続き参照可能
- 新規は4桁で作成
- リンク切れは発生しない

## 解決策の詳細

### 4桁採用のメリット

1. **スケーラビリティ**
   - 最大9999個まで管理可能
   - 長期プロジェクトでも安心

2. **一貫性**
   - tasksと同じ4桁ルール
   - 統一された命名規則

3. **ソート性能**
   - ファイルシステムで自然にソート
   - `0001`, `0010`, `0100` が正しく並ぶ

4. **視認性**
   - 桁数が揃って見やすい
   - 連番の範囲が一目瞭然

### 実装場所

**docs-structure パターン**:
- `patterns/docs-structure/templates/notes/README.md:20-31`
- `patterns/docs-structure/templates/notes/TEMPLATE.md:61`
- `patterns/docs-structure/templates/README.md:45`
- `patterns/docs-structure/templates/tasks/TEMPLATE.md:30,36`
- `patterns/docs-structure/templates/ai-collaboration/AI_COLLABORATION_GUIDE.md:181`
- `patterns/docs-structure/templates/development/best-practices/README.md:29`

**docs-structure-for-target-branch-only パターン**:
- 同様の構造で同じファイル群に適用

## 学び

### 1. スケーラビリティは初期設計で考慮すべき
- 「99個で十分」は楽観的すぎる
- 成功するプロジェクトほど知見が蓄積される
- 将来の拡張を見越した設計の重要性

### 2. 一貫性は直感的な理解を助ける
- tasks が4桁なのに notes が2桁では混乱する
- 統一されたルールは学習コストを下げる
- 小さな不整合が積み重なると大きな問題になる

### 3. ユーザーフィードバックの価値
- 実際に使っている人からの気づきは貴重
- 「いい意味で」という表現が重要（パターンが機能している証拠）
- 早期のフィードバックで改善できた

### 4. 移行戦略の重要性
- いきなり全変更ではなく、段階的移行
- 既存ユーザーへの影響を最小化
- 後方互換性の維持

## 今後の改善案

### 短期
1. **新規ノートを4桁で作成**: 08 → 0008 から開始
2. **ドキュメント更新**: 移行ガイドの作成
3. **テンプレート活用**: TEMPLATE.md を使って一貫性を保つ

### 中長期
1. **既存ノートの一括リネーム**: 01-07 → 0001-0007（オプション）
2. **自動化ツール**: 連番採番を支援するスクリプト
3. **バリデーション**: 命名規則チェックの自動化

## 数値データ

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| 連番桁数 | 2桁 | 4桁 |
| 最大管理数 | 99個 | 9999個 |
| 例 | `01_title.md` | `0001_title.md` |
| tasksとの一貫性 | ❌ 不整合 | ✅ 統一 |
| 変更ファイル数 | - | 19ファイル |

## 関連ドキュメント
- [Note 08](./08_letters-naming-change.md) - letter → letters への変更
- [Note 07](./07_task-system-integration.md) - タスク管理システム統合
- [タスクテンプレート](../tasks/TEMPLATE.md) - 4桁連番の参考
- [開発ノートREADME](./README.md)

---

**最終更新**: 2025-11-01
**作成者**: Claude & User
