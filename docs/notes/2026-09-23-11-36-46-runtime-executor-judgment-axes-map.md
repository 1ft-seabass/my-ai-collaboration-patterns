---
tags: [kit-vision, install-js, setup-local, raw-commands, ai-execution, judgment-tier]
---

# Node要否・実行主体・判断主体の3軸地図（docs-structure/setup-securecheck比較）

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-23
**関連タスク**: docs-structure単体の既存プロジェクト安全マージ用インストーラー（install.js）の設計会話の続き。[docs-structure/setup-securecheckの概念腑分け](./2026-09-23-08-57-31-docs-structure-securecheck-concept-breakdown.md)の続編

## 問題

install.jsの実装方針に合意した後、「概念腑分け"（template/install.js/setup-local/verify/判断層ウィザード/磨きこみ層/kit）だけでは説明しきれない軸があることに気づいた。それぞれの概念を**どう実行するか**（Node.jsが要るか、raw（生のコマンド）で足りるか）と、**誰が実行するか**（人間かAIか）によって、同じ「確定的な処理」でも大変さや安全性が変わってくる、という指摘がきっかけだった。

## 整理（本題）

### 3層＋判断の主体という地図

実行に必要なランタイムの強さで並べると、次の3層になる。

1. **素の実行群（raw、Node.js不要）**: コマンド・ファイル操作の生の並び。人間が手でコピペしても実行できる
2. **従来型Node.jsスクリプト**: Node.jsは要るが、レガシーな前提（package.json必須化、git init等）を引きずった実装（例: `setup-all.js`）
3. **最適化されたNode.jsスクリプト**: OS依存を排除し、新規/既存を同一ロジックでカバーする、今回目指している実装（install.js/setup-local）

これとは別に、「判断の主体」という軸があり、どうしても人間またはAI＋人間の判断に残る部分がある（強いマイグレーション、プロジェクト固有の値の注入など）。

### docs-structureとsetup-securecheckでの操作別マッピング

| 操作 | Node無しでも完結するか | Node.js化の現在地 | 判断の主体 |
|---|---|---|---|
| template配置・既存への安全マージ | ○（`cp -r`可能。ただし素の`cp -r`は既存ファイルを上書きするため、skip-existingの安全性はNode版でしか出せない） | docs-structure: 設計中／securecheck: `setup-all.js`にのみ存在 | 不要（確定的） |
| 既存に`docs/`はあるが`notes/letters/actions/`が揃っていない検知 | – | – | AI＋人間（検知して報告、勝手にマージ・移設しない） |
| package.jsonマージ（scripts/hooks/devDeps追記） | △（手でJSON編集は可能だが誤りやすい） | 新規なら焼き込み可、既存は未実装 | AI（＋人間確認）。既存プロジェクトのみ発生 |
| .gitignore追記 | ○（ただしOS依存で文字コード事故の実例あり＝観測d） | `patch-gitignore.js`構想のみ、未実装 | 不要（確定的にしたいのに、まだ人力） |
| gitleaksバイナリDL | ×（OS/アーキ判定＋ダウンロードをNode無しで組むのは現実的でない） | 実装済み（`install-gitleaks.js`） | 不要 |
| git hook配線 | △（`npx simple-git-hooks`はNodeツールだが、npm標準の仕組み） | 実装済み | 不要 |
| カナリア痕跡づくり（ネガティブテスト） | ×（`echo`でのファイル書き込みがOS依存事故の実例＝観測e。Node化必須と結論済み） | 未実装（setup-local構想のみ） | 不要 |
| 初回スキャン結果の解釈 | – | 呼び出しは`scan --all`でNode化するが、解釈自体はコード化しない | AI＋人間 |
| 既存docs-structureの差分更新（バージョンアップ） | △（diffの目視比較は人力で可能） | diff検出自体は`diff`コマンドで既に確定的。上書き可否の判断だけは意図的にコード化しない | AI＋人間（判断層ウィザード） |
| 強いマイグレーション（v1→v2→v3等） | – | 意図的にコード化しない（`MIGRATION_GUIDE_*.md`） | 人間の最終承認必須、AIは補助 |
| プロジェクト固有の値の注入（例: kitの`package.json`の`name`） | ○（人間がエディタで直接書く） | コード化しない（未変更なら警告のみ） | 人間のみ。AIも介さない |

### raw層（Node無し）における実行主体（人間 vs AI）の比較

**docs-structure**

| ケース | 人間が実行 | AIが実行 |
|---|---|---|
| 新規（空のプロジェクトに`cp -r`） | 楽。2コマンドのコピペで完結、判断要素なし | 楽。ほぼ同じ難易度。cwdさえ間違えなければ問題にならない |
| 既存への安全マージ | やや注意が要るが、`docs/`の中身を見ればすぐ気づく（視覚的に気づきやすい） | 危険側。素の`cp -r`は既存ファイルを黙って上書きするため、AIが気づかず既存ファイルを壊すリスクがある |

**setup-securecheck**

| ケース | 人間が実行 | AIが実行 |
|---|---|---|
| A: ファイル配置（`.security-check/`本体のコピー） | 楽（docs-structureと同じ） | 楽（同上） |
| E: gitleaksバイナリDL＋hook配線 | 専門家でないとつらい。OS/アーキ判定、正しいリリースファイル名の特定、tar/zip展開、実行権限付与、`.git/hooks/pre-commit`の中身とsimple-git-hooksの設定形式の理解が必要 | 危険。URL・展開コマンド・パーミッション・hookの中身のどこかを微妙に間違えても、一見動いているように見えて実は配線が抜けている、といった検知しにくい失敗をしうる（観測eのクラス） |
| F: カナリア痕跡づくり | 同上、手作業だとOS依存の文字コード事故が起きうる（観測d/e） | 同上。しかも毎回微妙に異なるコマンドを書きがちで再現性が低い |

## 学び

- **「人間が大変だからAIに任せる」のではなく、「人間もAIも両方raw実行にはリスクが高すぎるので、raw層自体をやめてNode.jsコードに置き換える」というのが正確な捉え方だった**。setup-securecheckのE/F（gitleaksバイナリDL・hook配線・カナリア痕跡）は、人間の手作業（専門知識が要り時間がかかる）もAIの素実行（検知しにくい微妙な失敗をしうる）も両方リスクが高い。setup-local完成後のAIの仕事は「複雑な手順を考えて実行する」ことではなく「`node .security-check/cli.js setup-local`という1つの確定的なコードを呼び出す」ことに縮小される。つまり実際に任せている相手はコードであり、AIはその起動係に過ぎない、という整理の方が正確
- docs-structureのraw層は、新規プロジェクトなら人間でもAIでも十分に安全（判断要素がほぼ無い単純作業）。既存プロジェクトへの安全マージのケースだけ、AIが実行主体だと素の`cp -r`が既存ファイルを黙って上書きする危険があり、ここにNode化（install.jsのskip-existing）の価値が集中している。人間は視覚的に既存ファイルの存在に気づきやすいが、AIは指示通り機械的に実行しがちという違いが背景にある
- 「実行に何が要るか（Node要否）」と「誰が実行するか（人間/AI）」は独立した軸で、Node.js化で消せるのは「スクリプト自体のロジックの揺れ」だけであり、「そのスクリプトを正しく呼び出せるか」というAI実行主体特有の揺れは別に残る。install.jsのcwd安全確認や既存検知の仕組みは、まさにこのAI実行主体由来の揺れを埋めるための設計だった

## 今後の改善案

- [ ] `install.js`の実装・READMEの更新時に、この地図（特にdocs-structureの2行だけの単純な表）を参照して過剰設計を避ける
- [ ] `setup-local`の設計時に、この地図のsetup-securecheck側の表（特にE/Fの「人間もAIも両方リスクが高い」という整理）を、なぜNode化するかの根拠として参照する

## 関連ドキュメント

- [docs-structure/setup-securecheckの概念腑分け](./2026-09-23-08-57-31-docs-structure-securecheck-concept-breakdown.md)
- [kit構想 Fableセッション原資](./2026-09-22-23-36-08-kit-vision-fable-session-source.md)
- [メンテナンスコストのアーキテクチャ方針合意（構想ノート）](./2026-09-22-23-20-37-maintenance-cost-architecture-direction-agreement.md)

---

**最終更新**: 2026-09-23
**作成者**: AI
