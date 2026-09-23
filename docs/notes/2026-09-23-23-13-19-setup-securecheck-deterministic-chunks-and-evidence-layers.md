---
tags: [setup-securecheck, setup-local, install-js, scan, fail-close, evidence-based-verification, kit-vision]
---

# setup-securecheckの確定的チャンク／判断の交互構造と、3層の証拠構造

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-23
**関連タスク**: setup-securecheck側の`setup-local`設計に入る前段階の掘り下げ会話

## 問題

`setup-local`の設計に入る前に、「docs-structure側でミニマムな整えをやってみて掴んだ勘所を、そのままsetup-securecheckに横展開する」という当初の想定（[Node要否・実行主体・判断主体の地図](./2026-09-23-11-36-46-runtime-executor-judgment-axes-map.md)参照）だけでは足りず、実際に現行の手順書（`patterns/setup-pattern/setup-securecheck/setup-securecheck.md`、740行）を読み込んで、kit構想原資のA〜G分類（[kit構想 Fableセッション原資](./2026-09-22-23-36-08-kit-vision-fable-session-source.md)1.3節）を現物に当てはめ直す必要があった。

## 整理（本題）

### 手順順に並べ直したA〜G分類

kit構想原資のA〜G分類は性質別にまとまっていたが、実際の手順（Phase 0〜3）の順番に並べ直すことで見え方が変わった。

| # | ステップ | 分類 | 現状 |
|---|---|---|---|
| 0.1 | ヘルスチェック実行 | 安全の定義 | ✅ Node化済み（`verify`） |
| 1.1 | テンプレートファイル配置 | A ファイル配置 | 🔴 raw（`cp`3連発） |
| 1.2 | secretlintインストール | D npm依存追加 | 🔴 raw（`npm install`） |
| 1.3 | secretlint初回スキャン | G 判断（呼び出し＋解釈） | 🔴 raw（`npx secretlint`）＋判断 |
| 1.4 | gitleaksインストール | E マシン固有 | ✅ Node化済み（`install-gitleaks.js`） |
| 1.5 | gitleaks初回スキャン | G 判断（呼び出し＋解釈） | 🔴 raw（OS別に手順書内で分岐、唯一の箇所） |
| 2.1 | package.jsonにscripts追加 | B package.jsonマージ | 🔴 raw（手動編集）＋判断 |
| 2.2 | ヘルスチェック | 安全の定義 | ✅ Node化済み |
| 2.3 | テストラン | 安全の定義 | ✅ Node化済み |
| 3.1 | simple-git-hooksインストール | D npm依存追加 | 🔴 raw（`npm install`） |
| 3.2 | package.jsonにsimple-git-hooks設定追加 | B package.jsonマージ | 🔴 raw（手動編集）＋判断（既存値一致確認・worktree例外） |
| 3.3 | フック有効化 | E マシン固有 | 🔴 raw（`npx simple-git-hooks`） |
| 3.4 | .gitignore更新 | C .gitignore追記 | 🔴 raw（手動編集） |
| 3.5 | 動作確認（テストコミット） | F 痕跡づくり | 🔴 raw（`git commit`/`reset`） |
| 3.5.5-a/b | ネガティブテスト | F 痕跡づくり | 🔴 raw（`echo`でカナリア作成） |
| 3.5.5-c | フェイルクローズ確認 | （後述） | 🔴 raw（`mv`退避） |
| 3.6 | 最終確認 | 安全の定義 | ✅ Node化済み |

### 確定的チャンク／判断の交互構造の発見

手順順の表をさらに俯瞰すると、「確定的に一気に進められる部分」と「判断で止まる境界」が交互に現れる構造が見えた。

```
確定的チャンク①: 0.1 ヘルスチェック（verify実行）
  ↓
判断①: 0.1の結果解釈（どのPhaseから再開するか）
  ↓
確定的チャンク②: 1.1テンプレ配置 + 1.2 npm install(secretlint) + 1.4 gitleaksインストール + 1.3/1.5スキャン呼び出し
  ↓
判断②: スキャン結果の解釈（本物の漏洩か／プレースホルダーか／false positiveか）
  ↓
判断③: 2.1 package.jsonへのscripts追加（既存プロジェクトのマージ判断。新規は焼き込みで消える）
  ↓
確定的チャンク③: 2.2/2.3 verify呼び出し
  ↓
確定的チャンク④: 3.1 npm install(simple-git-hooks)
  ↓
判断④: 3.2 package.jsonへのsimple-git-hooks設定追加（既存値一致確認・worktree例外の判断。新規は焼き込みで消える）
  ↓
確定的チャンク⑤ = 「setup-local」: 3.3フック有効化 + 3.4 gitignore更新 + 3.5動作確認 + 3.5.5ネガティブテスト（a/b/c全部Node化） + 3.6最終verify
```

確定的チャンクが5つ、判断の境界が4つ（うち2つは新規プロジェクトなら消える）という構造だった。**setup-localはこのうち最後の、かつ最大の確定的チャンク⑤に過ぎない**。

### 3つの名前（install.js／scan／setup-local）は同じ現象だった

上記の連動表と、`install.js`／`scan`／`setup-local`という既存の呼び名を突き合わせると、いずれも「確定的チャンクへの命名」という同じ現象で、出現する場所と大きさが違うだけだと分かった。

- **install.js相当**: チャンク②（1.1配置）とチャンク④（3.1インストール）に共通する「ファイル配置・npm依存導入」パターンへの命名
- **scan**: チャンク②の中でも「1.3/1.5の呼び出し」だけが唯一OS別に分岐する箇所だったため、同じチャンク内でも別に名前が必要だった
- **setup-local**: 判断④の後にある最後の（そして最大の）確定的チャンクへの命名

### 3層の証拠構造（AIの宣言／ミニverify／本verify）

kit構想は既に、ネガティブテストの判定を「exit codeではなく、ログの`type: canary, result: failed`が書かれたかで行う。これがhookが本当に走った唯一の証拠」という**証拠ベースの判定**にしていた（[kit構想 Fableセッション原資](./2026-09-22-23-36-08-kit-vision-fable-session-source.md)3.2節）。これを、ネガティブテストだけでなく**インストール工程全体**に一般化すると、次の3層になる。

| 層 | 中身 | 握りつぶせるか | 例 |
|---|---|---|---|
| 1. AIの宣言 | 「ちゃんと入りました」という自然言語の要約 | 握りつぶせる（ハルシネーション・誤読・楽観的要約のリスク） | 「導入完了しました！」 |
| 2. 作業範囲のミニverify | その工程のコード自身が返す、構造化された結果 | 握りつぶしにくい（コードの標準出力そのもの） | install.jsの`CREATE`/`SKIP`件数、`install-gitleaks`のバージョン確認出力 |
| 3. 本verify | `cli.js verify --test-run`の15項目総合チェック | 最も握りつぶしにくい（独立した第三者的チェック） | `15/15 passed` |

信頼を上げる設計原則は、AIの役割を「1を自分の言葉で語る」から「2と3をそのまま中継する（要約・言い換えをしない）」に変えることだと考えた。ただし、この仕組みは**証拠を出すところまでしか自動化できず、「AIの宣言と証拠が本当に一致しているか」を実際に見比べる最後の一手は結局誰か（人間か、後で読むAI）がやらないと機能しない**、という限界も確認した。

docs-structureのinstall.jsは2（CREATE/SKIP件数）までは既にあるが、3（本verify）が無いことも、この整理で改めて浮き彫りになった（[docs-structure/setup-securecheckの概念腑分け](./2026-09-23-08-57-31-docs-structure-securecheck-concept-breakdown.md)で「空き」と整理した`verify`の不在の実害）。

## 決定事項

1. **フェイルクローズ確認（3.5.5-c）はsetup-localのフローに残し、`mv`をNode化する**。以前の決定（[フェイルクローズ確認の理解とCIスタンスの整合](./2026-09-23-02-12-53-fail-close-check-and-ci-stance-alignment.md)）で「手順から削除しパターンリポジトリ側のテストへ移設」としていたが、実際に確認するとその移設先（パターンリポジトリ側のNodeテスト）は**まだ影も形もない未着手のプラン**だった。除外理由のうち「案件ごとのmv退避・復元が事故の芽になる」は`fs.renameSync`＋`try/finally`（`pre-commit.js`自身が既に持つカナリア後片付けと同じパターン）でNode化すれば解消できる。残る「コードの性質なので案件ごとの再証明は冗長」という理由も、裏を返せば「毎回のsetup-local実行が、そのクローン先が受け取ったコードのバージョンでフェイルクローズが機能しているかをその都度実地で証明してくれる」という副次効果になるため、移設よりも先にNode化して残す方を優先する。パターンリポジトリ側テストへの移設可否は別途判断とする
2. **install.jsは狭いスコープ（ファイル配置＋npm依存導入）のまま保つ**。`verify`／`scan`は独立した汎用サブコマンドのままにし、install.jsに内包しない。理由は2つ: (a) install.jsという名前と実態のズレを避けるため（内包すると実質Phase 0〜3全体のオーケストレーターになってしまう）、(b) コードに寄せすぎるとAIが介入できる柔軟さが失われるため
3. **判断の境界を削りすぎない**。判断層は「まだ自動化しきれていない残り」なだけでなく、**AIが現場の予期しない状況に適応して修復できる余地を意図的に確保しておく**という、それ自体に価値がある選択でもある

## 学び

- この一連の整理は、会話の中で段階的に見えてきたものであり、最初から見通せていたわけではなかった。「射程が狭い」という指摘、手順順に並べ直す依頼、A〜G分類とチャンク/判断構造の連動表の依頼は、いずれもユーザー起点の再構成要求がきっかけだった
- 「フェイルクローズ確認の移設先」のように、一度決めた対応方針でも、実際に「その移設先は今どこにあるか」を確認すると存在しないことが判明するケースがある。決定事項を鵜呑みにせず、都度「今も実在するか」を確認する価値を再確認した

## 今後の改善案

- [ ] install.js相当（1.1配置＋1.2/1.4のnpm/gitleaksインストール）の実装
- [ ] `scan`サブコマンドの新設（1.3/1.5の呼び出し統合、OS分岐の解消）
- [ ] `setup-local`の実装（3.3〜3.6、フェイルクローズのNode化を含む）
- [ ] フェイルクローズのパターンリポジトリ側テスト設置は、setup-localへの組み込みとは別に、改めて要否を判断する

## 関連ドキュメント

- [kit構想 Fableセッション原資](./2026-09-22-23-36-08-kit-vision-fable-session-source.md)
- [docs-structure/setup-securecheckの概念腑分け](./2026-09-23-08-57-31-docs-structure-securecheck-concept-breakdown.md)
- [Node要否・実行主体・判断主体の地図](./2026-09-23-11-36-46-runtime-executor-judgment-axes-map.md)
- [フェイルクローズ確認の理解とCIスタンスの整合](./2026-09-23-02-12-53-fail-close-check-and-ci-stance-alignment.md)
- [patterns/setup-pattern/setup-securecheck/setup-securecheck.md](../../patterns/setup-pattern/setup-securecheck/setup-securecheck.md)

---

**最終更新**: 2026-09-23
**作成者**: AI
