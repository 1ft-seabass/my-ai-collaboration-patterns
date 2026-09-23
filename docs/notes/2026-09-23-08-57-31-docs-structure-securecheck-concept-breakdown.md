---
tags: [kit-vision, install-js, setup-local, verify, template, concept-breakdown]
---

# docs-structure/setup-securecheckの概念腑分け（template/install.js/setup-local/verify/判断層ウィザード/磨きこみ層/kit）

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-23
**関連タスク**: docs-structure単体の既存プロジェクト安全マージ用Node.js確定的インストーラー（install.js）の設計会話

## 問題

[メンテナンスコストのアーキテクチャ方針合意](./2026-09-22-23-20-37-maintenance-cost-architecture-direction-agreement.md)のToDoに従い、docs-structure単体の既存プロジェクト安全マージ用インストーラー（install.js）を設計する過程で、[kit構想 Fableセッション原資](./2026-09-22-23-36-08-kit-vision-fable-session-source.md)が定義していた`template` / `kit` / `setup-local`という3つの概念だけでは、実際に必要な要素を説明しきれないことが次々に判明した。

## 調査

設計を進める中で、以下の実コードを確認しながら各概念の実体を洗い出した。

- `patterns/setup-pattern/docs-structure-and-securitycheck/setup-all.js`の`copyRecursiveSkipExisting()`（既存ファイルはスキップし、無いものだけ差分で補完するアルゴリズム。ただしsetup-securecheck固有の前提（package.json必須化、git init、`.security-check/logs/`へのログ出力）を抱えており、これらはdocs-structure単体には持ち込むべきではないと判断した）
- `patterns/setup-pattern/docs-structure-for-branch/for_branch_init.md`（`node -e`埋め込み方式。方針合意ノートで既に「今後使わない旧方式」と決着済みの参考として確認）
- `patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/pre-commit.js`（フェイルクローズ分岐が既にコード化されているが、gitleaksが正常導入されている通常運用では一度も実行されない「眠っているコード」であることが判明。詳細は[フェイルクローズ確認の理解とCIスタンスの整合](./2026-09-23-02-12-53-fail-close-check-and-ci-stance-alignment.md)参照）
- `patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/install-gitleaks.js`（gitleaksバイナリが`linux_x64`/`linux_arm64`/`darwin_x64`/`darwin_arm64`/`windows_x64`の5種類のOS/アーキ別に分かれ、`.gitignore`で明示的にリポジトリから除外されている実装）
- `patterns/setup-pattern/setup-securecheck/templates/.security-check/cli.js`の`assertRunFromProjectRoot()`（cwdガードの実装。ただし「`.security-check/cli.js`という永続的にインストールされた既知の相対位置にあるファイル」という前提に依存しており、一時的に取得されて1回実行されたら消えるinstall.jsにはそのまま転用できないことが判明）
- `patterns/docs-structure/README.md`の「既存のdocs-structureを最新版に更新する場合」ブロック（diff提示→承認→上書き、というAIウィザード形式が既に存在する）

## 整理（本題）: 8概念の腑分け

### 汎用的役割

| 概念 | 汎用的な役割（目指す姿） | docs-structureでの実体 | setup-securecheckでの実体 |
|---|---|---|---|
| **template** | 材料。パターンrepo内に留まる静的な雛形 | `patterns/docs-structure/templates/` | `patterns/setup-pattern/setup-securecheck/templates/` |
| **ワンショット指示書** | AIへの入口。短い自然言語で「何を取得して何を実行するか」だけを伝える。詳細はinstall.js自身に語らせ、縮小していく方向 | README.mdのコピペブロック（縮小予定） | README.mdのコピペブロック／wizard.js起動の入口 |
| **install.js（焼き込み）** | パターンごとの決定的な配置スクリプト。OS依存のcp/echo等をNode化し、新規／既存への安全マージ（skip-existing）を同一ロジックで統一的にカバー | 新設予定（このノートの主題） | 未実装（構想のみ。現状は廃止対象の`setup-all.js`内にしか類似ロジックが無い） |
| **setup-local（かぶせ）** | マシンごと・cloneごとに再構築が必要な、gitignore領域の状態を作る1コマンド（テンプレートにはどうやっても焼き込めない残り） | **存在しない**（マシンローカルな状態を持たないので構造的に不要） | 未実装（kit構想の本題、次の本番ターゲット） |
| **verify（健康診断）** | 導入後いつでも呼べる、健全性の確定的な自己申告 | **存在しない（空き）**。install.jsの「既存検知」がその芽になりうる | `cli.js verify`（15項目、既に確立） |
| **判断層ウィザード**（まだ共通名なし） | install.js/setup-localが安全側に倒すぶんはみ出た、破壊的変更・強いマイグレーションを人＋AIの判断でガイドする受け皿 | README.mdの「既存のdocs-structureを最新版に更新する場合」ブロック | `MIGRATION_GUIDE_*.md` + `wizard.js` |
| **磨きこみ層** | 発動完了物とtemplateを照らし合わせ、templateの初期提供物自体をより強くしていく継続的な監査。AIが確定的に頑張るカロリー（トークン）を事前に減らす | 実質不要（template≒発動完了物でギャップがほぼゼロ） | 未着手（[kit構想 Fableセッション原資](./2026-09-22-23-36-08-kit-vision-fable-session-source.md)の観測a〜gは1回きりの実例。段1のsetup-local実装時にこの観点を明示的に持たせるのが良さそう） |
| **kit / build-kit.js** | 複数パターンのtemplateを合成した完成品（kit）と、その合成ロジック（build-kit.js）。新規プロジェクト専用 | 未着手 | 未着手 |

### どの軸に効くか

| 概念 | OSの揺れ排除 | AIのトークン削減 | 同期漏れ・陳腐化防止 | 安全性（壊さない/ブロック） | 実行事故防止（cwd等） | 判断範囲の明確化 |
|---|---|---|---|---|---|---|
| template | – | △ | ○ | – | – | – |
| ワンショット指示書 | – | ○ | ○ | – | – | △ |
| install.js（焼き込み） | ○ | ○ | △ | △（非破壊） | ○ | ○ |
| setup-local（かぶせ） | ○ | ○ | – | ○（フェイルクローズ／証拠判定） | △（cli.jsに既存） | ○ |
| verify（健康診断） | – | ○ | ○（安全の定義を1箇所に） | ○ | – | ○ |
| 判断層ウィザード | – | –（むしろ時間をかける場所） | – | ○（誤自動化を防ぐ） | – | ○（最大の効能） |
| 磨きこみ層 | – | ○（根本対策） | ○ | – | – | △ |
| kit / build-kit.js | – | ○（新規はAI出番ゼロに） | ○（第3の正本を作らない） | – | – | ○ |

○=直接効く／△=副次的に効く／–=対象外

## 学び

- **docs-structureの単純さが、概念の見えにくさの原因だった**。docs-structureは構造的にマシンローカルな状態を一切持たない（バイナリ導入もgit hook配線も無い）ため、`setup-local`・`verify`・`磨きこみ層`という3つの概念がいずれも「不要／ギャップほぼゼロ」になり、docs-structure単体を見ているだけではこれらの存在に気づけなかった。setup-securecheckという「複雑ゆえに強度の低い発動完了物」を扱って初めて、この3つが可視化された
- **setup-localが埋める「発動完了物とtemplateのギャップ」は、templateをどれだけ強くしても原理的に埋まらない構造的な壁が原因**。具体的には (a) gitleaksバイナリがOS/アーキ別に5種類あり、かつリポジトリへのバイナリコミット自体を避ける方針（`.gitignore`）のため、1つのtemplateに全部含めることができない、(b) `.git/hooks`はgit管理対象外なので、templateがどれだけ強くなってもそこには原理的に何も届かない、という2点。これらは実装都合ではなく構造的な制約
- **kitの必要性を先送りせず、個別の磨きこみを先にすべき**という判断は、「kit/build-kit.jsの期待値を上げすぎると、個別パターンで解決すべき問題を『kitでまとめて解決すればいい』と考えずに先送りしてしまうリスクがある」というブレーキの意味も持つ。kit構想ノート自身が「kitはdocs-structure-and-securitycheckの二の舞にならないか」という懸念を先回りして検討していたが、その答え（build-kit.jsが機械的に再生成する生成物だから大丈夫）は「build-kit.js自体が揺れない」という前提の上に成り立っており、その前提を過信すると結局同じ穴に落ちる
- 「発動完了物」という言葉自体が、この会話の中で自然発生した（templateと似ているが違う、セットアップが完了した後の実際のファイルツリー全体を指す言葉として）。templateとの差分がゼロなら磨きこみ層は不要、差分があるなら磨きこみ層が機能する、という判定軸として機能した

## 今後の改善案（未着手）

- [ ] docs-structure単体のinstall.jsを実際に設計・実装する（このノートの直接のきっかけ。cwd安全確認・degit一回取得・copyRecursiveSkipExisting相当の3ステップ、詳細はこの会話の続きを参照）
- [ ] 「判断層ウィザード」に共通の名前を与えるかどうかを検討する（パターンごとに形がバラバラなこと自体は許容してよいという合意はできている）
- [ ] docs-structure用のverify（健康診断コマンド）を新設するか検討する。`templates/`に含めて`docs/`配下に配置し、install.jsとは別の常駐ツールにする方向性まで合意済み
- [ ] setup-securecheck用のinstall.js（焼き込み層の配置スクリプト）を新設する（現状は`setup-all.js`にしか類似ロジックが無い）
- [ ] 「磨きこみ層」を、段1（setup-localの実装）着手時に明示的なチェック観点として持たせる（自動化するだけでなく、templateに直接焼き込めば手順ごと不要になる項目が無いか監査する）
- [ ] kit/build-kit.jsの要否は、docs-structure・setup-securecheckそれぞれの個別磨きこみ（install.js/setup-local/verify）が完了してから改めて判断する

## 関連ドキュメント

- [kit構想 Fableセッション原資](./2026-09-22-23-36-08-kit-vision-fable-session-source.md)
- [メンテナンスコストのアーキテクチャ方針合意（構想ノート）](./2026-09-22-23-20-37-maintenance-cost-architecture-direction-agreement.md)
- [フェイルクローズ確認の理解とCIスタンスの整合](./2026-09-23-02-12-53-fail-close-check-and-ci-stance-alignment.md)
- [構想合流ノートのToDo突き合わせ漏れ](./2026-09-23-01-38-53-confluence-note-todo-crossref-gap.md)

---

**最終更新**: 2026-09-23
**作成者**: AI
