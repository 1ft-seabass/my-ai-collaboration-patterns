---
tags: [mcp, guide-tools, mental-index, session-handoff, implementation-complete]
---

# 申し送り（2026-02-21-09-46-00-mcp-guide-tools-complete）

> **⚠️ 機密情報保護ルール**
>
> この申し送りに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない
> - コミット前に git diff で内容を確認
> - プッシュはせずコミットのみ(人間がレビュー後にプッシュ)

## 🔔 Compact前チェックリスト

### トークン使用量の目安
トークン予算の**75-85%**を超えたら申し送り作成を検討しましょう。

- **75%超**: 余裕を持って検討開始
- **85%超**: 早急に申し送り作成
- **100%**: auto compactが発火（文脈が失われる前に記録を！）

> 💡 **トークン使用量の確認方法**
> 会話中に表示される `Token usage: X/Y; Z remaining` を参照
> 例: Claude Codeの場合は予算200,000トークン

### 記録すべき内容を確認
- [x] 現在のセッションで決定した重要事項を記録したか？
- [x] 議論の流れと理由を記録したか？
- [x] 次のセッションで必要な「文脈」「空気感」を言語化したか？
- [x] 技術的な決定の「なぜ」を明記したか？
- [x] 注意事項に新しい学びを追加したか？

---

## 🔍 次のセッション開始時の検証プロトコル

**次のAIへ: セッション開始時に必ず以下を実行してください**

### 1. 前セッションの完了状態を検証
下記の「検証コマンド」を実行し、申し送りの「完了」が実態と一致しているか確認してください。

### 2. 検証結果を人間に報告
- ✅ **全て成功**: 「前セッションの完了状態を確認しました。guide 系ツールの動作確認から開始します。」
- ⚠️ **失敗あり**: 「MCP サーバーが起動しませんでした（理由: [エラー内容]）。トラブルシューティングから再開します。」

### 3. 実態ベースで進める
- 申し送りの「完了」は参考程度
- 検証結果が真実

---

## 🔧 コマンド実行ルール

**次のAIへ: コマンド実行前に必ず確認すること**

### 原則：プロジェクトの標準実行方法を探す
このプロジェクトは静的なパターン集のため、起動・停止の概念はありません。

### MCP サーバーの動作確認方法
```bash
# 1. ログファイルの確認
tail -20 patterns/setup-pattern/docs-structure-mcp-server/mcp-server.log

# 2. Claude Code を再起動
# （MCP サーバーの変更を反映するため）

# 3. MCP ツールの呼び出しテスト
# Claude Code で「セッション終了したい」と指示して guide_session_end が呼ばれるか確認
```

---

## 現在の状況

### docs-structure MCP サーバー: guide 系ツール実装
**ステータス**: ✅ 実装完了（動作確認待ち）

**完了内容**:
- ✅ **7つの guide 系 MCP ツールを実装**
  - guide_session_end - セッション終了時の申し送り作成ガイド
  - guide_note_creation - ノート作成ガイド
  - guide_letter_creation - 申し送り作成ガイド
  - guide_task_creation - タスク作成ガイド
  - guide_note_and_commit - ノート作成＋コミットガイド
  - guide_git_commit - git コミットガイド
  - guide_git_push - git push 前の最終チェックガイド
- ✅ **action-loader.ts を作成**（actions/*.md を読み込む汎用ヘルパー）
- ✅ **既存 prepare 系ツールを削除**（prepare-note.ts, prepare-task.ts, prepare-letter.ts）
- ✅ **src/index.ts に全ツール登録**
- ✅ **TypeScript 型チェック完了**（エラーなし）
- ✅ **2つのノート作成**
  - 実装面: mcp-guide-tools-implementation.md
  - 思想面: mcp-as-mental-index-externalization.md
- ✅ **3つのコミット完了**（プッシュは未実施）
  - `4b73110`: ノート追加
  - `8e7475e`: prepare 系削除
  - `69c44b0`: guide 系追加

**未完了内容**:
- ⚠️ **Claude Code を再起動して動作確認**（最重要）
- ⚠️ **guide 系ツールが自発的に呼ばれるか検証**
  - 「セッション終了したい」→ guide_session_end を呼ぶか？
  - 「ノート作りたい」→ guide_note_creation を呼ぶか？
  - 「コミットしたい」→ guide_git_commit を呼ぶか？
- ⚠️ **必要に応じて description を改善**
- ⚠️ 前回からの残件: prepare_task, list_letters, help の動作確認
- ⚠️ 前回からの残件: README の更新
- ⚠️ 前回からの残件: package-lock.json のコミット判断

**検証コマンド** (次のセッションのAIが実行):
```bash
# 1. MCP サーバーのログを確認
tail -30 patterns/setup-pattern/docs-structure-mcp-server/mcp-server.log

# 2. Claude Code を再起動

# 3. guide 系ツールの動作確認
# - 「セッション終了したい」と指示
# - Claude が guide_session_end を自動で呼ぶか観察
# - 返り値に actions/00_session_end.md の内容が含まれているか確認
```

**検証が失敗した場合の対処**:
- Claude が guide 系を呼ばない → description を改善（「『セッション終了』と言われたらこのツールを呼ぶ」）
- MCP サーバーが起動しない → mcp-server.log でエラー確認

---

## 次にやること

### 優先度: 最高
1. **Claude Code を再起動**
   - MCP サーバーの変更を反映
2. **guide 系ツールの動作確認**
   - 「セッション終了したい」と指示して guide_session_end が呼ばれるか確認
   - 「ノート作りたい」と指示して guide_note_creation が呼ばれるか確認
3. **Claude の自発性を観察**
   - MCP ツールを自動で選ぶか？
   - それとも「actions を読んでください」とユーザーに聞くか？

### 優先度: 高
4. **必要に応じて description を改善**
   - Claude がツールを選びやすくする
   - ただし actions/*.md には手を入れない（独立性を保つ）

### 優先度: 中
5. **前回からの残件対応**
   - prepare_task, list_letters, help の動作確認
   - README の更新（トークン削減実測値、トラブルシューティング）
   - package-lock.json のコミット判断

---

## 注意事項

### 1. 「脳内インデックスの外部化」という設計思想

**重要**: guide 系 MCP ツールの価値は「actions/*.md を返すこと」ではなく、**「ファイルパスを覚えなくて良いこと」**

**従来の方法:**
```
ユーザー: 「セッション終了したい」
       ↓ ユーザーが覚えている必要がある
       ↓ セッション終了 = actions/00_session_end.md
ユーザー: 「@actions/00_session_end.md を見て」
```

**MCP による解決:**
```
ユーザー: 「セッション終了したい」
       ↓ Claude が自動で選ぶ
Claude: [guide_session_end ツールを呼ぶ]
       ↓ ファイルパス不要！
```

### 2. actions/*.md の独立性を保つ

**原則:**
- ❌ actions/*.md に「`guide_session_end` ツールを呼べ」と書く → MCP に依存してしまう
- ✅ actions/*.md は MCP がなくても機能する → 自然言語プロンプトとして完結

**理由:**
- 上位（自然言語）に下位（MCP）の仕様を流出させない
- MCP がなくても `@actions/00_session_end.md` で動く
- 両方の選択肢を残すことで柔軟性を保つ

### 3. MCP の3つの価値

1. **検索系** - grep/find の代替
2. **アクション系** - **脳内インデックスの代替** ← これが今回の新しい価値
3. **作成系** - ファイル名生成 + 日本語検証 + 脳内インデックスの代替

### 4. Claude の自発性に期待する

- guide 系ツールを実装しても、Claude が呼ばない可能性がある
- その場合は description を改善する
- ただし、actions/*.md は変更しない（独立性を保つ）

---

## 技術的な文脈

### プロジェクト構成
```
patterns/setup-pattern/docs-structure-mcp-server/
├── src/
│   ├── index.ts                  # 全ツール登録（7つの guide 系を追加）
│   ├── utils/
│   │   ├── action-loader.ts      # 新規作成（actions/*.md 読み込み）
│   │   ├── naming.ts
│   │   ├── template.ts
│   │   ├── search.ts
│   │   └── logger.ts
│   └── tools/
│       ├── help.ts
│       ├── guide-session-end.ts        # 新規作成
│       ├── guide-note-creation.ts      # 新規作成
│       ├── guide-letter-creation.ts    # 新規作成
│       ├── guide-task-creation.ts      # 新規作成
│       ├── guide-note-and-commit.ts    # 新規作成
│       ├── guide-git-commit.ts         # 新規作成
│       ├── guide-git-push.ts           # 新規作成
│       ├── list-letters.ts
│       ├── search-docs-titles.ts
│       └── search-docs-content.ts
```

### 使用技術
- **MCP SDK**: `@modelcontextprotocol/sdk` v1.0.4
- **バリデーション**: zod v3.24.1
- **環境変数**: dotenv v16.4.7
- **ランタイム**: Node.js、実行は `npx tsx src/index.ts`

### 重要ファイル
- `src/index.ts` - patterns/setup-pattern/docs-structure-mcp-server/src/index.ts:28 - guide 系ツール全7種を登録
- `src/utils/action-loader.ts` - patterns/setup-pattern/docs-structure-mcp-server/src/utils/action-loader.ts:16 - actions/*.md 読み込み
- `docs/actions/*.md` - 手順書（理解チェック、承認フロー、実行手順）

### 関連ドキュメント
- [ノート: MCP guide ツール実装](../notes/2026-02-21-08-50-00-mcp-guide-tools-implementation.md) - 実装詳細
- [ノート: 脳内インデックス外部化の思想](../notes/2026-02-21-08-51-00-mcp-as-mental-index-externalization.md) - 設計思想
- [前回の申し送り](./2026-02-21-08-21-00-mcp-server-implementation-complete.md)

---

## セッション文脈サマリー

### 核心的な設計決定

#### 1. MCP を「脳内インデックスの外部化」として捉える

- **決定事項**: guide 系ツールの価値は「ファイルパスを覚えなくて良いこと」
- **理由**: ユーザーの認知負荷を軽減する
- **影響範囲**: MCP ツールの設計思想全体

#### 2. actions/*.md の独立性を保つ

- **決定事項**: actions/*.md に MCP ツール名を明記しない
- **理由**: 上位（自然言語）が下位（MCP）に依存しないようにする
- **影響範囲**: actions/*.md の記述方針

#### 3. guide 系ツールを削除しない

- **決定事項**: 当初「価値が低い」と判断したが、再評価して削除しない
- **理由**: 脳内インデックスの外部化という新しい価値を発見
- **影響範囲**: MCP ツールのラインナップ

### 議論の流れ

1. **最初の問題認識**:
   - actions/*.md を MCP から発動したい
   - ファイルパス指定（`@actions/...`）が面倒

2. **検討したアプローチ**:
   - 案A: prepare 系を拡張 → 却下（命名が不適切）
   - 案B: actions 全てを MCP 化 → 部分採用（優先度高のみ）
   - 案C: guide 系ツールを実装 → 採用

3. **途中の疑問**:
   - 「guide 系は actions/*.md を返すだけ。価値があるのか？」
   - 「検索系の方が価値が高いのでは？」
   - 「削除すべきでは？」

4. **転換点**:
   - ユーザーから「脳内インデックスを MCP で外部化できないか」という気づき
   - guide 系の真の価値は「認知負荷の軽減」だと理解

5. **最終決定**:
   - guide 系は削除せず、そのまま実装を進める
   - actions/*.md の独立性を保つ（MCP に依存させない）
   - Claude の自発性に期待し、動作確認で検証

### 次のセッションに引き継ぐべき「空気感」

- **このプロジェクトの優先順位**:
  1. **ユーザーの認知負荷軽減** - ファイルパスを覚えなくて良い
  2. **自然言語プロンプトの独立性** - MCP がなくても動く
  3. **柔軟性** - 両方の選択肢を残す（`@actions/...` と MCP ツール）

- **避けるべきアンチパターン**:
  - 上位レイヤー（actions/*.md）に下位レイヤー（MCP）の仕様を書く
  - ツールの価値を「何を返すか」だけで判断する
  - 性急に削除する（再評価の機会を逃す）

- **重視している価値観**:
  - **認知負荷の可視化**: 「何を覚える必要があるか」を意識する
  - **レイヤー間の依存関係**: 上位は下位に依存しない
  - **柔軟性**: 複数の選択肢を残す

- **現在の開発フェーズ**: 実装完了、動作確認待ち
  - 次のセッションで Claude が guide 系を自発的に呼ぶか検証
  - 必要に応じて description を改善（actions は変更しない）

---

**作成日時**: 2026-02-21 09:46:00
**作成者**: Claude Sonnet 4.5
