# 申し送り運用改善：次セッション用定型文の導入

**作成日**: 2025-11-16
**関連タスク**: 申し送り運用の改善

## 問題

申し送り（letters）と知見（notes）の運用が100件以上蓄積され、Gitログより遥かに精度の高い記憶追跡が可能になった。しかし、申し送り時に以下の必須事項が漏れやすい課題があった：

1. notes/letters の命名規則や作成時のルール参照
2. コミット方針（公開/プライベートリポジトリでのClaude痕跡の扱い）
3. 申し送り前の手順（ノート作成→コミット→開発コミット→申し送り作成→コミット）
4. 各ステップでの人間への計画提示と承認取得

特に、新しいClaudeセッションで申し送りを読んでも、これらの運用ルールが継承されない問題があった。

## 試行錯誤

### アプローチA: COLLABORATION.md を作成
**試したこと**: プロジェクトルートに運用ルールをまとめた `COLLABORATION.md` を配置

**結果**: 不採用

**理由**:
- ファイルが増えると管理負担が増加
- Claudeが自動で参照する保証がない（`@` で明示指定が必要）
- スラッシュコマンドや自動化はAI挙動依存で来年には動かなくなる可能性

---

### アプローチB: letters/README.md に運用フローを統合
**試したこと**: 既存の `letters/README.md` に運用ルールを追加

**結果**: 不採用

**理由**:
- プロジェクト固有ルールが混ざると汎用性が下がる
- テンプレートとしての再利用性が損なわれる

---

### アプローチC: 申し送り完了時に次セッション用定型文を提示（成功）
**試したこと**:
1. `TEMPLATE.md` に「📋 申し送り作成完了時の通知例」セクションを追加
2. Claudeが申し送り作成完了時に、次セッションで使うべき定型文をユーザーに提示
3. その定型文に運用ルールを埋め込む

**結果**: 成功

**実装例**:
```markdown
## 📋 申し送り作成完了時の通知例

申し送りを作成したら、ユーザーに以下の形式で通知してください：

```
申し送りファイルを作成しました: docs/letter/YYYY-MM-DD-HH-MM-SS.md

次のClaudeセッションでは、以下のメッセージで開始してください：

---
docs/letter/YYYY-MM-DD-HH-MM-SS.md を日本語で。

このプロジェクトの運用ルール:
- 知見は docs/notes/ (命名: 連番-{title}.md、作成時 README/TEMPLATE参照)
- 申し送りは docs/letter/ (このファイル、作成時 README/TEMPLATE参照)
- コミット: このリポジトリが公開の場合はClaude痕跡（署名・絵文字）なしで、プライベートの場合はClaude痕跡ありでOK
---
```
```

## 解決策

### 1. TEMPLATE.md への通知例追加

**実装場所**:
- `docs/letter/TEMPLATE.md`
- `patterns/docs-structure/templates/letters/TEMPLATE.md`
- `patterns/docs-structure-for-target-branch-only/templates/docs/letters/TEMPLATE.md`
- `patterns/writing-collaborate/templates/letters/TEMPLATE.md`

**主なポイント**:
1. 申し送り作成完了時に、Claudeがユーザーに次セッション用の定型文を提示
2. `@` 記号は含めない（将来的に使えなくなる可能性があるため、ユーザーが手入力）
3. 「日本語で」を含めることで、英語で始まる問題を回避
4. 運用ルールを毎回明示することで、プロジェクト固有の規約を継承

### 2. current_create_letter.md の詳細化

**実装場所**:
- `docs/actions/current_create_letter.md`
- `patterns/docs-structure/templates/actions/current_create_letter.md`
- `patterns/docs-structure-for-target-branch-only/templates/docs/actions/current_create_letter.md`
- `patterns/actions-pattern/templates/actions/current_create_letter.md`

**変更内容**:
- 4ステップ → 12ステップに詳細化
- `**太字**` を削除（AI向けなので過度な強調不要）
- 各ステップで「相談」「承認」を明示
- ルールはREADME/TEMPLATEを参照させる（メンテナンス性向上）

**12ステップのフロー**:
1. 最新2件の申し送りを確認
2. プロジェクト固有情報の把握
3. ノート作成方針の相談
4. ノートの作成
5. ノートコミットのルール把握とコミットログ方針の相談
6. ノートのコミット・プッシュ
7. 開発コミット計画の提示
8. 開発内容のコミット・プッシュ
9. 申し送りの作成
10. 申し送りコミットのコミットログ方針の相談
11. 申し送りのコミット・プッシュ
12. 申し送り作成完了の通知

### 3. 運用ルールの設計

**コミット方針**:
```
コミット: このリポジトリが公開の場合はClaude痕跡（署名・絵文字）なしで、プライベートの場合はClaude痕跡ありでOK
```

- プレースホルダー方式を廃止（`[公開/プライベート]` → 判断ロジック明示）
- 手入力ミスを回避
- Claudeが状況に応じて判断可能

## 学び

### 1. AIの挙動依存を避ける

スラッシュコマンドや自動ファイル参照は、AIの仕様変更で将来的に動かなくなる可能性がある。人間が明示的に操作できる仕組みが安定する。

### 2. 「会話上での印象付け」の重要性

ファイルが存在しても、申し送り時に会話で明示的に伝えないと見落とされる。次セッション用の定型文を提示することで、人間が自然に運用ルールを伝達できる。

### 3. フレッシュな会話の価値とのバランス

申し送りファイルがないときのフレッシュな会話は重要だが、運用ルールの継承はそれ以上に重要。定型文方式なら両立可能。

### 4. 人間の承認フローの明示

AIが自動で進めず、各段階で人間と対話しながら進める設計が重要。12ステップに分割し、「相談」「承認」を明示することで実現。

### 5. メンテナンス性の確保

ルールを複数箇所に書くと、後のメンテナンスが困難。README/TEMPLATEへの参照にすることで、単一の情報源を維持。

## 今後の改善案

### 短期
- 実際の運用でこの定型文がどれだけ機能するかをモニタリング
- 他のプロジェクトにも同じパターンを適用してフィードバック収集

### 中長期
- 大規模改修時の特別ルール運用（現状は notes に記録する運用で対応）
- プロジェクト固有の命名規則バリエーション対応（現状は「連番」で柔軟性確保）

## 関連ドキュメント

- [05_pattern-docs-standard-structure.md](./05_pattern-docs-standard-structure.md) - パターンドキュメントの標準構造
- [06_guide-simplification-principles.md](./06_guide-simplification-principles.md) - GUIDE.md 簡略化の原則
- [83_letter-template-improvement.md](./83_letter-template-improvement.md) - 以前の申し送りテンプレート改善
- [84_apply-fullspec-letter-template.md](./84_apply-fullspec-letter-template.md) - フルスペック申し送りテンプレート適用

---

**最終更新**: 2025-11-16
**作成者**: Claude Code + User (1ft-seabass)
