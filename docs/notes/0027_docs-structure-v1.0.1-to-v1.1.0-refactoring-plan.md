# docs-structure v1.0.1 → v1.1.0 改修計画 - 開発記録

**作成日**: 2026-01-31
**関連タスク**: docs-structure 改修

## 背景

### 現状の課題

docs-structure を3ヶ月使い込んでわかった改善点：

1. **命名規則の不統一**
   - notes: `0001_title.md`（4桁連番）
   - letters: `2026-01-21-05-48-37.md`（日時のみ）
   - tasks: 未使用
   - → 複数人作業時に連番が衝突するリスク

2. **README の肥大化と二重管理**
   - notes/README.md: 84行（一覧を手動管理）
   - letters/README.md: 78行（一覧を手動管理）
   - tasks/README.md: 185行（一覧を手動管理）
   - → AI は Grep/Glob で検索できるので一覧は不要

3. **情報の分散**
   - README.md: 役割説明・命名規則・いつ使うか
   - TEMPLATE.md: 記入用テンプレート
   - → AI が2ファイル読む必要がある（トークン消費）

4. **タグ管理の不在**
   - 250ノート、1000ノート時代を見据えた検索性が不足

### なぜこの改修が必要か

- **トークン削減**: AI が読むファイル数を減らす（64%削減見込み）
- **スケーラビリティ**: 1000ノート時代に備える
- **複数人運用**: 命名規則統一で衝突を回避
- **メンテナンス性**: 情報の一元管理

---

## 試行錯誤

### アプローチA: FrontMatter の導入検討

**検討内容**:
```yaml
---
created: yyyy-mm-dd-hh-mm-ss
tags: [api, security]
---
```

**議論**:
- created はファイル名と重複するのでは？
- tags は将来的に有用だが、今は効果が薄い？
- 運用カロリーが高くなる？

**結論**: **tags のみ導入**
- created は削除（ファイル名で管理）
- tags は将来的な検索性向上（250/1000ノート時代に有効）
- 導入コストは低い（AI が1行書くだけ）

---

### アプローチB: README vs TEMPLATE の情報集約先

**選択肢**:

1. **TEMPLATE に集約**（採用）
   - README.md: 3-5行の誘導のみ
   - TEMPLATE.md: 役割・命名規則・検索方法・テンプレート
   - メリット: AI が読むファイルが1つだけ
   - デメリット: TEMPLATE が長くなる（100行超）

2. **README に集約**
   - README.md: 全情報
   - TEMPLATE.md: 削除
   - メリット: README が「導入ドキュメント」として完結
   - デメリット: 「コピペして新規作成」が面倒

3. **現状維持**
   - README.md: 説明
   - TEMPLATE.md: テンプレート
   - メリット: 役割が明確
   - デメリット: 2ファイル読む必要（トークン増）

**結論**: **TEMPLATE に集約**
- 理由: トークン削減効果が最も高い
- AI 勘違い対策: HTML コメント + セパレーター（`---`）で分離

---

### アプローチC: 命名規則の統一形式

**検討した形式**:

1. **連番のみ**: `0001_title.md`
   - 問題: 複数人作業で衝突

2. **日時のみ**: `2026-01-31-10-23-45.md`
   - 問題: タイトルがないと識別しにくい

3. **日時 + タイトル**: `yyyy-mm-dd-hh-mm-ss-{title}.md`（採用）
   - メリット: 衝突しない、識別しやすい、時系列明確
   - デメリット: ファイル名が長い（許容範囲）

**結論**: **yyyy-mm-dd-hh-mm-ss-{title}.md**
- すべてのフォルダで統一（notes, letters, tasks）
- タイトルは30文字以内目安（厳密制限なし）
- タイムスタンプの時差は許容（UTC/JST混在OK）

---

## 最終的な解決策

### 確定仕様

#### 1. FrontMatter

**採用**: tags のみ

```yaml
---
tags: []
---
```

**適用箇所**:
- notes/TEMPLATE.md
- letters/TEMPLATE.md
- tasks/TEMPLATE.md（tags + status + priority）

#### 2. 情報集約

**採用**: TEMPLATE に集約

**TEMPLATE.md の構造**:
```markdown
---
tags: []
---

# タイトル

<!-- ============================================================
  このテンプレートの使い方（実際のノートには含めないこと）
  ============================================================ -->

## 📖 テンプレート使用ガイド
（役割・命名規則・FrontMatter・検索方法・機密情報）

<!-- ============================================================
  ここから下が実際のノートのテンプレートです
  ============================================================ -->

---

（実際のテンプレート）
```

**README.md**: 3-5行のみ
```markdown
# notes/

開発中の試行錯誤、技術的な学び、失敗と成功の記録。

詳細は [TEMPLATE.md](./TEMPLATE.md) を参照してください。
```

#### 3. 命名規則

**統一形式**: `yyyy-mm-dd-hh-mm-ss-{title}.md`

**例**:
- notes: `2026-01-26-10-23-45-api-error-handling.md`
- letters: `2026-01-26-15-30-00-session-handoff-refactoring.md`
- tasks: `2026-02-01-09-00-00-implement-authentication.md`

#### 4. AI 勘違い対策

**HTML コメント + セパレーター**:
- `<!-- ガイド開始 -->` 〜 `<!-- ガイド終了 -->`
- `---`（水平線）で実際のテンプレートと分離
- actions で「水平線より下だけをコピー」と指示

---

## Phase 2: 新規稼働用テンプレート更新（詳細計画）

### 更新ファイル一覧（12ファイル）

| # | ファイル | 現状 | 改修後 | 差分 | 主な変更 |
|---|---------|------|--------|------|---------|
| 1 | notes/TEMPLATE.md | 76行 | 65行 | -11行 | FrontMatter(tags)、ガイド集約 |
| 2 | notes/README.md | 84行 | 5行 | -79行 | 簡素化 |
| 3 | letters/TEMPLATE.md | 194行 | 175行 | -19行 | FrontMatter、トークン削除 |
| 4 | letters/README.md | 78行 | 5行 | -73行 | 簡素化 |
| 5 | tasks/TEMPLATE.md | 67行 | 110行 | +43行 | FrontMatter、ガイド集約 |
| 6 | tasks/README.md | 185行 | 5行 | -180行 | 簡素化 |
| 7 | templates/README.md | 84行 | 70行 | -14行 | 検索駆動明記 |
| 8 | actions/doc_note.md | 28行 | 35行 | +7行 | TEMPLATE参照、FrontMatter |
| 9 | actions/doc_letter.md | 63行 | 70行 | +7行 | タイトル追加指示 |
| 10 | actions/00_session_end.md | 97行 | 110行 | +13行 | 新命名規則 |
| 11 | patterns/docs-structure/README.md | - | - | 微修正 | ワンショット指示更新 |
| 12 | patterns/docs-structure/GUIDE.md | - | - | 微修正 | degit後ガイド更新 |

### トークン削減効果

**Before（現状）**:
- セッション開始時: 431行
- ノート作成時: 160行
- 申し送り作成時: 272行
- **総計**: 863行

**After（改修後）**:
- セッション開始時: 70行
- ノート作成時: 65行
- 申し送り作成時: 175行
- **総計**: 310行

**削減効果**: 863行 → 310行 = **約64%削減**

### 詳細: notes/TEMPLATE.md

**現状**: 76行
- 機密情報保護ルール（引用形式）
- 作成日・関連タスク
- 試行錯誤のテンプレート
- 関連ドキュメント
- 最終更新・作成者

**改修後**: 65行
```markdown
---
tags: []
---

# タイトル

<!-- テンプレート使用ガイド -->
## 📖 テンプレート使用ガイド

### 役割
開発中の試行錯誤、技術的な学び、失敗と成功の記録。

### 命名規則
`yyyy-mm-dd-hh-mm-ss-{title}.md`
- 例: `2026-01-26-10-23-45-api-error-handling-improvement.md`

### FrontMatter について
- tags: ノートの内容を表すタグ（3-5個推奨）
- 例: `tags: [api, error-handling, security]`

### 検索方法
- タグ検索: `@Grep pattern: "tags:.*security" path: "docs/notes"`
- キーワード検索: `@Grep pattern: "keyword" path: "docs/notes"`
- ファイル名検索: `@Glob pattern: "docs/notes/*keyword*.md"`

### 機密情報の扱い（重要）
⚠️ 以下は絶対に記載しないでください:
- パスワード、APIキー、トークン
- 個人情報
- 本番環境の詳細情報

📝 機密情報を扱う必要がある場合:
- .env ファイルを使用
- セキュリティチェックの仕組み: setup-pattern 参照

<!-- ここから実際のテンプレート -->

---

## 背景
なぜこの問題に取り組んだか

## 試行錯誤
### アプローチA: 手法名
- 試したこと:
- 結果:
- 理由:

## 最終的な解決策
採用したアプローチとその理由

## まとめ
学んだこと、今後の課題
```

**変更点**:
- FrontMatter 追加（tags のみ）
- ガイドセクション追加（役割・命名規則・検索方法）
- 作成日・関連タスク削除（FrontMatter/Git で管理）
- 構造のシンプル化

### 詳細: letters/TEMPLATE.md

**現状**: 194行
- トークン使用量チェック（削除対象）
- 次セッション検証プロトコル
- コマンド実行ルール
- セッション文脈サマリー

**改修後**: 175行
```markdown
---
tags: []
---

# yyyy-mm-dd セッション申し送り

<!-- テンプレート使用ガイド -->
## 📖 テンプレート使用ガイド

### 役割
セッション終了時に次のセッションへの引き継ぎ情報を記録。
「空気感」まで含めて文脈を継承する。

### 命名規則
`yyyy-mm-dd-hh-mm-ss-{title}.md`
- 例: `2026-01-21-05-48-37-actions-pattern-refactoring.md`
- タイトル: セッションの主要なテーマ（30文字以内目安）

### FrontMatter について
- tags: セッション内容を表すタグ
- 例: `tags: [refactoring, api, security]`

### 検索方法
- 最新の申し送り: タイムスタンプでソート（降順で最新2件）
- テーマ検索: `@Glob pattern: "docs/letters/*keyword*.md"`
- タグ検索: `@Grep pattern: "tags:.*refactoring"`

（以下、検証プロトコル、コマンド実行ルール、セッション文脈サマリーなど維持）
```

**変更点**:
- FrontMatter 追加
- タイトル追加を明記
- トークン使用量セクション削除
- ガイド集約

### 詳細: tasks/TEMPLATE.md

**現状**: 67行
- 機密情報保護ルール
- 作成日・状態・優先度・推定時間
- 確認項目・完了条件

**改修後**: 110行
```markdown
---
tags: []
status: Open
priority: Medium
---

# タスク: タイトル

<!-- テンプレート使用ガイド -->
## 📖 テンプレート使用ガイド

### 役割
セッションを跨ぐ長期タスクの管理。

### 命名規則
`yyyy-mm-dd-hh-mm-ss-{title}.md`
- 例: `2026-02-01-09-00-00-implement-user-authentication.md`

### FrontMatter について
- tags: タスク内容を表すタグ
- status: Open / In Progress / Done / Cancelled
- priority: High / Medium / Low

### 検索方法
- 未完了タスク: `@Grep pattern: "status: Open|In Progress"`
- タグ検索: `@Grep pattern: "tags:.*feature"`

### notes/letters との使い分け
- tasks: 長期タスク（数日〜数週間）
- letters: セッション単位（数時間〜1日）
- notes: 完了後の振り返り

（以下、テンプレート本文）
```

**変更点**:
- FrontMatter 追加（tags + status + priority）
- タイトルから TASK-0XXX プレフィックス削除
- ガイド集約（使い分けを明記）

### 詳細: README.md の簡素化

**すべてのフォルダで統一**:
```markdown
# フォルダ名/

1行説明。

詳細は [TEMPLATE.md](./TEMPLATE.md) を参照してください。
```

**例（notes/README.md）**:
```markdown
# notes/

開発中の試行錯誤、技術的な学び、失敗と成功の記録。

詳細は [TEMPLATE.md](./TEMPLATE.md) を参照してください。
```

### 詳細: actions/ の更新

**doc_note.md**:
- TEMPLATE.md のみ読む（README 削除）
- 命名規則: `yyyy-mm-dd-hh-mm-ss-{title}.md`
- FrontMatter 記入指示
- 「水平線より下をコピー」

**doc_letter.md**:
- TEMPLATE.md のみ読む
- タイトル追加指示
- FrontMatter 記入指示
- 通知フォーマット更新

**00_session_end.md**:
- 全ステップで新命名規則に対応
- FrontMatter 記入指示
- 通知フォーマット更新

---

## Phase 3: 既存ファイル移行（稼働中改修）

### 概要

**前提条件**: Phase 2 完了（templates/ が v1.1.0 仕様に更新済み）

**対象**:
- notes: 連番形式 `NNNN_*.md` → 日時+タイトル形式
- letters: 日時のみ形式 → 日時+タイトル形式

### 移行方法

**ワンショット AI 指示書**を別ノートで詳細設計:
- `docs/notes/0028_docs-structure-v1.0.1-to-v1.1.0-migration-oneshot-design.md`
- migration/ ディレクトリ構成の詳細設計
- MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md の完全な仕様
- migration/README.md の完全な仕様

**タイミング**: Phase 2 完成後、別セッションで実施

---

## Phase 4: 派生パターンへの波及

### 対象パターン

1. **docs-structure-for-target-branch-only**
   - templates/ を同期
   - ブランチ固有の説明は維持

2. **writing-collaborate**
   - 命名規則統一のみ反映
   - collaborate/ → docs/ への変更は別途検討

3. **actions-pattern**
   - アクション定義を同期

### 波及戦略

**手動同期**（各パターンを個別更新）

**理由**: パターン数が少ない（3個）、共通化のメリット < 複雑化のデメリット

---

## 学び

### 1. 「言語化の極致」との整合性

**FrontMatter は構造化のための「枠」**:
- 言語化の自由度を奪わない
- 検索しやすくする「インデックス」
- tags のみに絞ることで運用カロリーを抑制

### 2. AI 勘違い対策の重要性

**HTML コメント + セパレーター**:
- 現状でも混同していない（実績）
- さらに明確化することでリスク低減
- actions で「水平線より下をコピー」と明示

### 3. トークン削減の効果

**64%削減（863行 → 310行）**:
- README の簡素化が最大の貢献
- TEMPLATE への集約で情報の一元管理
- AI の読むファイル数を減らす

### 4. スケーラビリティへの備え

**250ノート時代、1000ノート時代**:
- tags による検索性向上
- アーカイブ戦略（notes_archive/）
- 削除ではなく分離（SF的な記憶改ざんを避ける）

### 5. 複数人運用への親和性

**命名規則統一の威力**:
- タイムスタンプで衝突回避
- 協業時のストレス軽減
- ハイブリッドブランチ運用（メイン統一 + 必要時分離）

---

## 今後の改善案

### Phase 5: ドキュメント整備

- patterns/docs-structure/README.md の更新
- patterns/docs-structure/GUIDE.md の更新
- examples/ の更新

### Phase 6: 他の改善案の検討

0026 で挙げた論点のうち未検討のもの：
- 論点4: actions の命名規則と発見性
- 論点5: パターン間の関係性の複雑化
- 論点6: セッション文脈サマリーの標準化
- 論点7: degit による配布と更新の仕組み

### Phase 7: メトリクス計測

改修前後での効果測定：
- セッション開始時間
- トークン消費量
- 知見の再利用頻度

---

## 関連ドキュメント

- [0026: docs-structure 改善の壁打ち](./0026_docs-structure-improvement-brainstorm.md) - 改善案の初期検討
- [0009: notes 4桁連番への変更](./0009_notes-4digit-numbering-change.md) - 命名規則変更の前例
- [0020: notes 連番の一貫性改善](./0020_notes-numbering-consistency-improvement.md) - 連番統一の経緯

---

**最終更新**: 2026-02-01
**作成者**: Claude Sonnet 4.5 (with 1ft-seabass)
