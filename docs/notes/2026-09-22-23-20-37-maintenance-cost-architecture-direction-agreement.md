---
tags: [architecture, maintenance-cost, node-js, installer, docs-structure, setup-securecheck]
---

# メンテナンスコストのアーキテクチャ方針合意（構想ノート）

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-22
**関連タスク**: v1.2.4/v1.2.5対応後の構想会話（実装はまだ）

> このノートは特定バグの修正記録ではなく、複数ターンにわたる構想会話で合意した**方針**を段階的に積み上げて記録するもの。今後の実装判断の拠り所として、内容が固まった箇所から随時参照してよい。

## 問題（検討のきっかけ）

v1.2.4/v1.2.5で見つかったバグ（引き継ぎメッセージの文言不一致、`for_branch_init.md`の残存参照、`actions-pattern`へのデッドリンク等）はいずれも「同じ内容を複数箇所に手で複製していて、修正時に同期漏れが起きる」という同型の問題だった。この根本原因への対処として、「AIウィザード的ワンショット指示書」に加えて「Node.js前提の確定的なファイルコピー処理」を導入・拡大できないか、という相談から始まった。

## 検討の経緯

### Node.jsを基準ランタイムにすることの妥当性

- 「OSを越えてどんな時でも動くもの」は存在しない。ただし「OS標準ツール（PowerShell/bash/tar/unzip等）へのシェルアウトに依存しない」ことは pure-JS npm パッケージ（`adm-zip`, `tar`等）で達成可能。揺れの実体は「OS」そのものというより「シェルアウト先のOS標準ツールの差異」
- `npx degit` 自体がNode.js前提のため、パターン取得の時点で既にNode.jsは必須。インストール処理でNode.jsを要求しても新規の依存追加にはならない
- Python は候補から除外（ユーザーの主力言語ではないため）。JavaScript（Node.js）を基準言語とする

### 発見: 決定的処理は「書いた後」も劣化しうる

- `install-gitleaks.js` のWindows向けzip解凍は、2026-06-26に「PowerShell依存 → `adm-zip`（pure JS）」へ一度修正された記録が `docs/notes/2026-06-26-...` にあるが、**v3集約リストラクチャリング（`bf9cc6c`）でファイルがまるごと再構成された際に、その修正が引き継がれず、現在のコードはPowerShell依存に戻っている**（未修正のまま、今回は着手していない）
- これは「確定的なコードを一度書けば終わり」ではなく、大規模リライトのたびに劣化しうることを示す実例。メンテナンスコストの問題は「AIのゆらぎ」だけでなく「人間・AI問わずコードの再構成時に過去の修正が失われること」にもある

### docs-structureの配布は実は既に3層になっている

1. **層1（新規導入）**: `npx degit .../templates ./docs` — 既に決定的（degit自体がコピーツール）。磨く必要性は低い
2. **層2（GUIDE.md）**: degit後にAIが読んで構造の意図を理解するための補足資料。**内容が実態と乖離している**ことを発見（`ai-collaboration/`, `development/`, `architecture/`, `spec/` 等、現行templates/には存在しない構造を説明したまま。おそらくv1.0.1以前の名残。未着手）
3. **層3（for_branch_init.md）**: 既存プロジェクトへの条件付き変更（パス書き換え）は、既に `node -e "..."` をAIにそのまま実行させる形で決定的にしている（ハイブリッド型の先行実装）

磨く余地があるのは層1ではなく、**「既存プロジェクトへの安全マージ」**（`docs/`が既にある/導入が中断した状態からの再開）。ここは現状AIの手作業判断に頼っており、`setup-all.js`の`copyRecursiveSkipExisting`相当の決定的ロジックがdocs-structure単体には無い。

### AI判断 vs 確定的ゲート（カナリア型）

半年の運用を経て、「AIは柔軟だが中身が見えにくい対応をする」ため、カナリアチェックのような確定的ゲートが必須という考えに至った。カナリアチェックの利点は「それ自体が壊れたら壊れたことが分かりやすい」「AIが騙しにくい」こと（100%の保証にはならないが）。この思想から、**AIの判断に委ねる部分（揺れの元）はできるだけコード（Node.js）に置き換えていく**方針とする。

### Node.js版ワンショットの形式: 独立スクリプトファイル

- `node -e` ワンライナー埋め込み方式（for_branch_init.md方式）ではなく、**独立スクリプトファイル方式**（setup-all.js方式）を標準とする
- 詳細ファイル（lib/配下など）の名前は実務的でよいが、**起点となるファイル名は誰が見ても分かりやすくする**（例: `setup-all.js` のような命名規則の横展開を検討中、具体的な統一名は未確定）

### docs-structure-and-securitycheck の位置づけ変化

- `docs-structure-and-securitycheck`（複数パターンの統合インストーラー）は**密結合**であり、疎結合にしないと存続しない可能性が高い。実際、一度も使われた実績がない
- 今後の方向性: **各パターンはフォルダ内で完成度を磨ききり、パターン間の連携は薄く保つ**（これはルートREADME/SETUP.mdをカタログ化せず各フォルダに説明を厚くする、というドキュメント面の方針とも一致する共通原則）
- ただし `setup-all.js` 内の決定的コピーロジック（`copyRecursiveSkipExisting`, `readJson`/`writeJson`, `runOrAbort`, `degitFetch`, ログ記録パターン, `resolveGitHookPath`等）は現状最も進化した参考実装であり、今後の単体インストーラー設計の参考にする

### ルートREADME.md / SETUP.md / GUIDE.md の位置づけ転換

- ルートの一覧的README.md/SETUP.mdは形骸化しやすく、メンテナンスコストが高い「一覧追従」をやめる方向
- 各フォルダの説明を厚くし、GitHubのフォルダ名から推測して各フォルダを見に行くUXを大切にする
- 各GUIDE.mdについても、当初は「AIが開発中に迷わないための強いコンテキスト」として必要だったが、管理とインストール（AIワンショット指示）が安定してきた今、内容の精査（削減）が必要という認識（未着手）

## 現時点の合意事項（解決策）

1. Node.jsを基準ランタイムとする（Python/Deno等への分岐は行わない）
2. Node.js版の確定的インストーラーは独立スクリプトファイル方式。起点ファイル名は分かりやすさを重視（具体名は未確定）
3. AIの柔軟な判断に頼る箇所は、可能な限りカナリア型の確定的ゲートやコードに置き換えていく
4. `docs-structure-and-securitycheck`のような密結合パターンは今後作らない方向。各パターンはフォルダ内で完結させ、パターン間連携は薄く保つ
5. ルートREADME/SETUP.mdは「カタログ」から「入口」に縮小し、各パターンフォルダの説明を厚くする方向
6. Node.js不在環境向けの「AIウィザード的ワンショット指示書（GUIDE.md方式）」は残しつつ、Node.jsありきの確定的ワンショットを併設する

## 学び

- 同期漏れ型のバグ（今日繰り返し見つけたもの）とメンテナンスコストの根本原因は同型で、「ドキュメントの一覧化」にも「インストーラーコードの密結合化」にも同じ形で現れる
- 確定的なコードを書いても、大規模リライト時に過去の修正が失われることがある（install-gitleaks.jsの例）。決定的処理には回帰を検知する仕組み（カナリア型の自己検証等）が実質的に必要
- 「AIが自由に読んで理解する」形式のドキュメント（GUIDE.md）は、書いた時点では有効でも、実装が進むにつれて実態と乖離しやすい

## 今後の改善案（未着手ToDo）

- [ ] `install-gitleaks.js` のPowerShell依存回帰を修正（adm-zipへ再度置き換え）
- [ ] `patterns/docs-structure/GUIDE.md`（ja/en）の陳腐化した構造説明を現行templates/に合わせて精査・修正
- [ ] ルートREADME.md/SETUP.mdの「カタログ」的記述を最小化する具体案を作る
- [ ] docs-structure単体の「既存プロジェクトへの安全マージ」用Node.js確定的インストーラーを設計・実装
- [ ] Node.js版ワンショットの起点ファイル名規約を決定する
- [ ] `docs-structure-and-securitycheck`の将来的な廃止・疎結合化を検討する
- [ ] Node.js不在環境向けに、AIがどこまで翻訳してよいか（単純なコピー処理は可、バイナリ配布等の複雑な処理はNode.js必須で止める）の方針をドキュメント化する

## 関連ドキュメント

- [patterns/setup-pattern/docs-structure-and-securitycheck/setup-all.js](../../patterns/setup-pattern/docs-structure-and-securitycheck/setup-all.js)
- [patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/install-gitleaks.js](../../patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/install-gitleaks.js)
- [docs/notes/2026-06-26-00-00-00-setup-securecheck-windows-zip-adm-zip.md](./2026-06-26-00-00-00-setup-securecheck-windows-zip-adm-zip.md)
- [前回ノート: v1.2.5](./2026-09-22-22-47-13-docs-structure-v1.2.5-check-my-security-deprecation.md)

---

**最終更新**: 2026-09-22
**作成者**: AI
