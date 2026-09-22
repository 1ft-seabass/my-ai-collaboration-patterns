---
tags: [kit, build-kit, setup-local, docs-structure, setup-securecheck, fable]
---

# セキュリティチェック × 経緯システムの俯瞰構想 (kit 構想) - Fableセッション原資

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-22
**関連タスク**: kit構想（Fableとの別セッションより）

> このノートは、Fable（別セッション）との高カロリーな構想会話で作成された原資を、体裁のみ整えてそのまま移植したものです。内容は加筆・修正していません（Claude Codeセッション側での検証・決着は [構想合流ノート](./2026-09-22-23-36-30-kit-vision-confluence-with-maintenance-cost-note.md) を参照）。

---

**セッション参加者**: 田中正吾、Claude
**位置づけ**: 地道に磨いてきた setup-securecheck / docs-structure を俯瞰し、「AI 開発がすぐはじめられるフォルダ一式 (kit)」へ引き上げる構想。観測 → 構想 → 責務の遷移 → 疎結合の順で整理し、末尾に決定事項と完成形の一枚絵を置く。

---

## 1. 原資と観測の要点

### 1.1 原資

| 原資 | バージョン | 役割 |
|---|---|---|
| docs-structure | 1.2.3 (2026-08-22) | 経緯システム。`templates/` → `docs/` に配置 |
| setup-securecheck | 3.0.2 (2026-08-02) | セキュリティチェック。`templates/` → ルートに配置 |
| ibm-bob-codeengine-sample-02 | 適用例 (Windows / PowerShell / Bob) | 2026-09-21 に両方導入 |
| tokaiec-port-forward-tool-web | 適用例 (Linux コンテナ / Claude) | 2026-09-09 に両方導入 |

### 1.2 最大の事実: 成果物はテンプレートと byte 単位で完全一致

| 対象 | ibm-bob (Win) | tokaiec (Linux) |
|---|---|---|
| `docs/` 配下 20 ファイル | 完全一致 | 完全一致 |
| `.security-check/` 一式 | 完全一致 | 完全一致 |
| `.secretlintrc.json` / `gitleaks.toml` | 完全一致 | 完全一致 |

プロジェクト固有化されたのは `package.json` と `.gitignore` の追記だけ。ウィザードのうち「ファイルを置く」部分は OS を問わず決定論的で、AI が介在する意味がなかった。

### 1.3 ウィザードの手順を性質で腑分け

| 分類 | 手順 | コピーで代替 | clone ごとに必要 |
|---|---|---|---|
| **A. ファイル配置** | 1.1 テンプレ 3 点コピー | ○ | — |
| **B. package.json マージ** | 2.1 `scripts.security`、3.2 `simple-git-hooks` + `postinstall` | △ 新規なら例をそのまま、既存ならマージ | — |
| **C. .gitignore 追記** | 3.4 | △ 追記操作 | — |
| **D. npm 依存追加** | 1.2 secretlint、3.1 simple-git-hooks | △ package.json に書いておけば `npm install` で吸収 | — |
| **E. マシン固有** | 1.4 gitleaks DL、3.3 hook 有効化 | × | ○ (hook は postinstall で自動、gitleaks は手動) |
| **F. 痕跡づくり** | 3.5 テストコミット、3.5.5 ネガティブテスト | × | ○ (logs/ が gitignore なので clone 直後は空) |
| **G. 判断** | 1.3 / 1.5 初回スキャン結果の解釈 | × | 初回のみ |

### 1.4 git clone 直後に verify がどう見えるか

`bin/` `logs/` が gitignore されている前提で 15 項目を追うと:

- `npm install` → `postinstall` で hook 復活 → #4 #5 #6 #9 は通る
- **落ちる 5 項目**: #10 gitleaks バイナリ、#11 機能的カナリア (未導入でスキップ)、#12 実行ログ、#14 ネガティブテスト痕跡、#15 自動カナリア痕跡
- E+F の 3 手 (`install-gitleaks` → 1 コミット → ネガティブテスト) を踏むと 15/15 に戻る

「OS 非依存でいつでも再開できる」は事実だが、verify 15/15 = 再開完了という判定にはならない設計。

### 1.5 「経緯システム → セキュリティチェック」の順序の理由

- docs-structure は package.json 不要、securecheck は package.json 必須 (tokaiec では `npm init -y` が挟まった)
- securecheck の背景説明は「`docs/notes` に経緯を残す運用では本物が紛れやすい」と docs-structure の存在を前提に書かれている
- docs-structure 側には `check_my_security_prepare_level.md` と `01_git_push.md` (機密スキャン) が入っている

順序は「前提の少ないほうが先」で自然に決まっており、両者は既に 3 箇所で片方向依存している (完全な疎結合ではない)。

### 1.6 観測で見つかったズレ

| # | 内容 | 影響 |
|---|---|---|
| a | Phase 0.1 の `node tmp/security-setup/templates/.security-check/cli.js verify` は v3 の cwd ガードで必ず落ちる (tokaiec ノートで実証済み) | ウィザードの入口が壊れている |
| b | `check_my_security_prepare_level.md` が v1 世代のまま (husky / `./bin/gitleaks` / `secret-scan` / Phase 4)。docs-structure 1.2.3 と securecheck 3.0.2 の同期漏れ | 「まとめたい」痛みの実体の一つ |
| c | `docs/README.md` (templates/README.md) の actions 名が旧名、存在しない `SETUP.md` を参照 | docs-structure 内部の同期漏れ |
| d | ibm-bob の `.gitignore` が非 UTF-8 (PowerShell の追記で Shift_JIS 化)。tokaiec は UTF-8 | 「OS 非依存」の唯一の破れ。コピーではなく追記操作が OS 依存を持ち込んだ |
| e | ibm-bob のネガティブテスト「ブロックされなかった」の Bob の診断 (自動カナリアと同値だからスルー) はコードと矛盾。pre-commit.js はパス (`.canary-probe`) で判定しており値では判定しない。真因候補は Windows 側 (PowerShell 5.1 の `>` が UTF-16LE を吐く、または手順書末尾の `# gitleaks:allow secretlint-disable-line` がファイルに混入)。未確定 | Windows 経路の検証が 1 段甘い可能性 |
| f | tokaiec の README は 1 行のみ。clone 後の再開手順がリポジトリ内に無い | 再開の再現性が README 次第 |
| g | `package.json.example` の secretlint `^8` vs 実際 `^12`/`^13` | 軽微 |

### 1.7 仮説への観測からの反応

- **経緯システムはコピペで素直に入る** → YES。`docs/` に固有化ゼロ。差分は AI が書く導入ノート 1 本だけ
- **セキュリティチェックは新規なら筋がいい** → ファイル部分は YES。新規なら B〜D も焼き込めるので、残るのは E+F の 3 手だけ
- **既存 Node.js プロジェクトは AI が臨機応変** → AI が本当に必要なのは B (package.json マージ) と G (初回スキャンの解釈) の 2 点だけ

---

## 2. 構想の骨子: 焼き込み / かぶせ / 判断の 3 層

AI ウィザードを軽くするのではなく、**ウィザードから決定論的な部分を引き剥がして、残ったものだけを AI に渡す**。

| 層 | 性質 | 時制 | 対応する手順 | 担い手 |
|---|---|---|---|---|
| **焼き込み** | リポジトリに残る。全プロジェクトで同一 | 過去 (immutable) | A ファイル配置、B/C/D (新規なら) | フォルダ一式のコピー |
| **かぶせ** | マシンごと・clone ごと。gitignore 領域 | 現在 (ローカル) | E gitleaks DL・hook 有効化、F 痕跡づくり | 1 コマンド (決定論) |
| **判断** | 中身を読んで決める | セッション | B マージ (既存のみ)、G 初回スキャン解釈 | AI + 田中さん |

letters/notes の「時制で分ける」整理と同じ構造。焼き込みは repo に、かぶせは .gitignore 配下に、判断は会話に、と置き場所が性質で決まる。

### 2.1 用語の対比: template / kit / setup-local

混同しやすい 3 語を品詞で分ける。

| 語 | 品詞 | 何か | 置き場所 | いつ使う |
|---|---|---|---|---|
| **template** | 名詞 | 材料。各パターンが持つ `templates/` | パターン repo | build-kit や既存向けウィザードが読む |
| **kit** | 名詞 | **出来上がり済みの器**。template を糊付けした新規プロジェクトの初期状態 | `kits/starter/` → degit で案件へ | 新規プロジェクト作成時に 1 回 |
| **setup-local** | 動詞 | 器の中で走らせる **1 コマンド**。gitleaks DL・hook 配線・カナリア痕跡をそのマシンに作る。`install-gitleaks` を拡張した位置づけ | `.security-check/cli.js` のサブコマンド | clone のたび、マシンごとに |

糊付けする**動作**が `build-kit.js`、糊付けされた**結果**が kit。kit は意見を持たない。

---

## 3. 3 つの決定

### 3.1 kit の置き場所と名前

`my-ai-collaboration-patterns/kits/starter/`。`patterns/` と並列に「成果物」置き場を新設し、生成物であることを構造で示す。

kit は手で保守しない。2 つのパターンから `build-kit.js` で生成する成果物にする。理由は観測 b/c: docs-structure 内部ですらずれていた。kit を第 3 の正本にしたら、ずれる場所が 3 つになる。

kit を「間に挟む」価値は、**2 つのパターンが合成できることを、案件で試す前に 1 箇所で検証できる**こと。

```
build-kit.js
  1. docs-structure/templates → kit/docs/
  2. securecheck/templates/{.security-check, .secretlintrc.json, gitleaks.toml} → kit/
  3. package.json.example + 骨組み → kit/package.json
  4. gitignore.example + Node 標準 → kit/.gitignore  (UTF-8 で生成)
  5. README / KIT_MANIFEST.json を生成
  6. スモークテスト: 一時 dir に展開 → git init → npm install → setup-local → verify 15/15
```

kit の正体は「合成テストに通った状態のスナップショット」。

差分の流れは 2 本に分け、kit は片方にしか関与させない:

```
(a) パターン → kit          build-kit.js で機械的に再生成。判断なし
(b) パターン → 導入済み案件  既存の update ワンショット / version-detect / migration。判断あり
```

### 3.2 `setup-local` = かぶせの 1 コマンド

clone 直後に落ちる 5 項目はすべて「マシンローカルの不在」なので、`cli.js` のサブコマンドに畳める。

**名前について**: 「焼き込み = repo」「かぶせ = local」の対比をそのまま名前にした。当初は一般名詞の bootstrap (自力で動く状態まで立ち上げる) を使ったが、CSS フレームワークの Bootstrap と混同しやすいため `setup-local` に改名した。

```
node .security-check/cli.js setup-local
  1. install-gitleaks         (冪等・既存コードそのまま)
  2. npx simple-git-hooks      (冪等)
  3. ネガティブテスト
       - Node が .test-secret-canary を UTF-8 で書く
       - git add → git commit を試み、ブロックされることを確認
       - secretlint / gitleaks それぞれの検出を個別に判定 (旧 3.5.5-b 相当)
       - 後片付け (unstage・削除)
       → logs に type:canary が残る = #14 が立つ
  4. verify                    → 15/15 を表示して終了
```

**ネガティブテストの 2 方式**:

| 方式 | 内容 | 証明できること |
|---|---|---|
| **A: 本物の commit を試みる (採用)** | git が `.git/hooks/pre-commit` → simple-git-hooks → cli を呼び、検出 → exit 1 → git がコミット中止。履歴には残らない | hook ファイルが存在し、実行権限があり、cli に配線され、検出器が生きている = 配線全部 |
| B: `cli.js pre-commit` を直接叩く | git を通さず Node から検出器を呼ぶ | 検出器が生きていることだけ。`core.hooksPath` のずれ・実行ビット落ち・`npx simple-git-hooks` 忘れは見えない |

方式 A で気をつける点 (setup-local 側で機械的に扱う):

- index に既存のステージ済み変更があれば実行を拒否する (`git diff --cached --quiet` で判定)
- 「ブロックされた」の判定は exit code ではなく、logs に `type: canary, result: failed` が書かれたかで行う。これが hook が本当に走った唯一の証拠

トレードオフ: 手順書 3.5.5-a の「人間が実行して記憶に残す」価値は消える。ただし観測上、実行者は既に AI で人間の記憶には残っていない。「人間に責任と記憶が残る」原則は G (初回スキャンの解釈) に絞って残す。

手順書のネガティブテストは唯一「シェルのリダイレクトでファイルを書く」ステップで、観測 e の温床だった。Node で書けば「bash 依存を完全に排除」の設計思想が最後の 1 手まで貫通する。

**フェイルクローズ確認 (旧 3.5.5-c) は setup-local に含めない**。「gitleaks バイナリ不在時にコミットをブロックする」のは `pre-commit.js` のコードの性質であり、マシンごとに変わらない。他の項目 (バイナリの有無・hook の配線・検出器の動作) はマシンごとに変わるので案件ごとに確認する価値があるが、フェイルクローズはパターン repo で 1 回証明すれば済む。案件ごとにバイナリを退避・復元する手順は、途中で落ちると `.bak` のまま残り「常にブロック」状態になる事故の芽でもある。→ 手順書から削除し、パターン repo に Node のテストとして置く。

### 3.3 kit に `package.json` を含める

含めると、degit した瞬間に `scripts.security` / `postinstall` / `simple-git-hooks` / devDependencies が揃った状態で着地し、`npm install` で依存が入り hook が配線される。B・C・D が「最初からある」に変わり、新規では AI の出番が消える。

コストは「既存プロジェクトに degit すると `package.json` を上書きして壊す」こと。**含めること自体が、kit を新規専用と割り切る根拠になる**。

中身は最小骨組み。Hono や Vite の選択は含めない。`"type"` は指定しない (v3.0.2 で `.security-check/package.json` が host の `"type":"module"` を吸収済み)。`name` は `CHANGE_ME` にして setup-local が未変更なら警告する程度。

---

## 4. 時間軸の手順表

| 段 | 対象 | やること | 完了の合図 | 導入済み案件への影響 |
|---|---|---|---|---|
| **1** | setup-securecheck **3.0.2 → 3.1.0** | `setup-local` / `scan` 追加 / Phase 0 の順序反転 (cp → verify) / `install.js`・`patch-gitignore.js` で cp・echo を Node 化 / フェイルクローズ確認をパターン側テストへ / `README.example` 同梱 / `package.json.example` のバージョン表記更新 | 既存案件を clone し直して `setup-local` 一発で 15/15 | `.security-check/` を上書きコピーするだけ。移行ガイド不要 (追加のみなのでマイナー版) |
| **1'** (並行可) | docs-structure **1.2.3 → 1.3.0** | `check_my_security_prepare_level.md` を「cli を呼んで報告」に痩せさせる / `docs/README.md` の旧 action 名・`SETUP.md` 参照を修正 | action が cli の結果だけで Level を出す | 既存の update ワンショットで取り込める |
| **2** | kit **新設** | `build-kit.js` + スモークテスト / `kits/starter/` を生成 | スモーク (一時 dir → git init → npm install → setup-local) が 15/15 | なし (kit は新規専用) |
| **3** | 運用 | 新規のワンショット指示を kit に書き換え / 既存向け wizard を「既存専用」に改稿して手厚く | README のワンショット指示が 2 系統に分かれる | なし |

依存は「1 の `setup-local` が無いと 2 のスモークが書けない」だけ。1' はいつでも。

### 4.1 OS で揺れる処理を全部 Node に — 棚卸し

原則: **OS で挙動が変わりうる処理 (ファイル書き込み・コピー・移動・削除・バイナリ呼び出し) は、手順書に書かずすべて Node のサブコマンドにする**。手順書に残るのは `npm install` と `node .security-check/cli.js <verb>` だけ。

| 手順 | 今 | 行き先 | 備考 |
|---|---|---|---|
| 1.1 テンプレ配置 | `cp` / `cp -r` | `install.js` | Windows は今 `Copy-Item` に読み替えている |
| 1.3 secretlint 初回スキャン | `npx secretlint "**/*"` | **`cli.js scan --all`** (新設) | 呼び出しは Node、結果の解釈は AI + 人 |
| 1.5 gitleaks 初回スキャン | `./.security-check/bin/gitleaks git . ...` と Windows 用 `.\...\gitleaks.exe` の 2 系統併記 | 同上 `scan --all` に統合 | 手順書で唯一 OS 別に書き分けている箇所 |
| 3.4 .gitignore 追記 | 手で追記 (Shift_JIS 化した) | `patch-gitignore.js` | 観測 d |
| 3.5.5-a カナリア | `echo '...' > ファイル` | `setup-local` | 観測 e |
| 3.5.5-b gitleaks 単独確認 | `./.security-check/bin/gitleaks git --staged ...` | `setup-local` の内部で個別判定 | 既に pre-commit.js が secretlint / gitleaks を分けて記録している |
| 3.5.5-c フェイルクローズ | `mv` で退避・復元 | パターン側テストへ | 手順書から消える |
| クリーンアップ | `rm -rf tmp/security-setup/` | **手順ごと削除** | `tmp/` は gitignore 済みなので残しても無害。消す手順そのものが不要 |

**`scan` サブコマンドについて**: 今の `verify --test-run` は 15 項目が通らないとスキャンに進まない (tokaiec が Phase 2 でハマった点) ので、導入途中では使えない。「ヘルスチェックに関係なく、今あるものでスキャンだけする」入口として `scan --staged` / `scan --all` を新設する。判断層 (G) への材料出しを Node に寄せるもので、判断そのものは AI + 人のまま。主戦場は既存案件 (履歴に何が眠っているかを見る)。新規は履歴が空なので出番はほぼない。

---

## 5. 責務の遷移表

列が時間、行が責務。太字が担い手の変化。

| 責務 | 現状 (3.0.2) | 段 1 後 (3.1.0) | 段 2〜3 後 (kit あり) |
|---|---|---|---|
| テンプレ配置 | AI が `cp` を案内 | **`install.js` (Node)** | 新規: **kit に同梱** / 既存: install.js |
| package.json マージ | AI | AI | 新規: **kit に同梱** / 既存: AI |
| .gitignore 追記 | AI が echo (**ここが Shift_JIS 化した**) | **`patch-gitignore.js` (UTF-8)** | 新規: kit 同梱 / 既存: patch |
| gitleaks DL | cli `install-gitleaks` | setup-local 内 | 同左 |
| hook 有効化 | 人が `npx simple-git-hooks` | setup-local 内 | 同左 |
| ネガティブテスト | 人が echo > ファイル (**シェル依存**) | **setup-local 内 (Node で書く)** | 同左 |
| フェイルクローズ確認 | 人が `mv` で退避・復元 | **パターン側テスト** (案件では行わない) | 同左 |
| 初回スキャンの呼び出し | 人が secretlint / gitleaks を OS 別に叩く | **`scan --all` (Node)** | 同左 (既存のみ) |
| 「安全」の定義 (15 項目) | cli `verify` | cli `verify` | 同左 |
| Level 0/1/2 判定 | docs-structure の action が**散文で独自判定 (v1 世代)** | (1' で) **cli の結果を読み替えるだけ** | 同左 |
| clone 後の再開手順 | 案件 README 次第 (tokaiec は無い) | securecheck が **`README.example`** を持つ | kit README に**最初から載る** |
| 初回スキャンの解釈 | AI + 人 | AI + 人 | 既存のみ AI + 人 (新規は履歴が無いので不要) |
| 導入ノート | AI | AI | AI |
| 新規 / 既存の分岐 | **1 本の wizard で両方** | 1 本 | **kit (新規) と wizard (既存) に分離** |

段 1 で消えるのは「シェル依存」と「人の手作業」、段 2〜3 で消えるのは「新規案件での AI の出番」。

---

## 6. フォルダの入れ方の遷移

変わるのはリポジトリ側の塊の種類。案件側は変わらない。

```
my-ai-collaboration-patterns/        現状               →  完成形
├── patterns/
│   ├── docs-structure/              正本                  正本 (+ README.example)
│   └── setup-pattern/
│       └── setup-securecheck/       正本                  正本 (+ setup-local, scan, install.js, README.example, フェイルクローズのテスト)
├── kits/                            (無い)                ★ 成果物置き場 (新設)
│   └── starter/                                           build-kit の出力。手で触らない
│       ├── KIT_MANIFEST.json                              { docs-structure: 1.3.0, setup-securecheck: 3.1.0 }
│       └── ...
└── scripts/
    └── build-kit.js                 (無い)                ★ 合成ロジック (新設)

案件側 (my-project/)                 現状               →  完成形
├── docs/                            同じ                  同じ
├── .security-check/                 同じ                  同じ
├── .secretlintrc.json, gitleaks.toml  同じ                同じ
├── package.json, .gitignore         AI が追記             kit 由来 (新規) / patch (既存)
└── README.md                        案件次第              「再開」節が最初からある
```

塊は 2 種類から 3 種類になる: **正本 (patterns/)・成果物 (kits/)・合成ロジック (scripts/)**。3 つ目は「どう合わせるか」だけを持ち、内容は持たない。

---

## 7. 独立・疎結合の観点

「kit が 2 つをまとめるなら、kit は 2 つのことを知っていなければならない = 結合では?」への答えは、**知っているのは kit ではなく build-kit.js で、しかも知っているのは置き場所だけ**。kit はただ繋げるだけで、意見は持たない。

### 7.1 契約は 1 本

```
契約: node .security-check/cli.js <verb>   (verify / setup-local / scan / pre-commit / ...)
      exit code と 15 項目の出力形式を安定させる

依存の向き:  docs-structure ──(任意・契約経由のみ)──→ setup-securecheck
             setup-securecheck は docs/ の存在を知らない (背景説明の散文は除く)
```

「安全とは何か」の定義を 1 箇所にする。今は cli の `verify` (15 項目) と `check_my_security_prepare_level.md` の散文 (Level 0/1/2、husky で判定) の 2 箇所にあり、だからずれた。寄せた後は action が「`verify` を実行して結果を Level に読み替えて報告する」だけになり、Level の判定基準も「cli が無い = 0 / あるが落ちる = 1 / 15 の 15 = 2」と機械的に決まる。docs-structure 側は呼ぶ・報告するしか持たない。

### 7.2 誰が何を知っているか

| | docs-structure | setup-securecheck | build-kit.js | kit (成果物) |
|---|---|---|---|---|
| 相手の**存在** | 「`.security-check/cli.js` があれば呼ぶ」(任意) | 知らない (散文の背景説明のみ) | 両方の `templates/` の場所 | 何も知らない (ただのファイル群) |
| 相手の**ファイル構造** | 知らない | 知らない | 知らない (丸ごとコピー) | — |
| 相手の**判定ロジック** | 知らない (呼んで結果を見るだけ) | — | 知らない | — |
| 相手の**バージョン** | 知らない | 知らない | 読んで MANIFEST に書く | 刻まれている |

### 7.3 独立が保たれている試金石

| 問い | 答え |
|---|---|
| securecheck を単独で入れられるか | ○ (今と同じ) |
| docs-structure を単独で入れられるか | ○ (今と同じ) |
| securecheck をバージョンアップしたら docs-structure を直す必要があるか | × (verb 名が変わらない限り) |
| kit を丸ごと消したら両パターンは無傷か | ○ (出力物なので) |
| 片方を uninstall したらもう片方は動くか | ○ (action は「cli が無い = Level 0」と報告するだけ) |

### 7.4 合成の仕組み: 「破片は各パターンが持つ、kit は継ぎ合わせるだけ」

疎結合を保ったまま束ねる核。README をどちらが持つかもこれで決まる。

| 破片 | docs-structure が持つ | securecheck が持つ | build-kit がすること |
|---|---|---|---|
| `README.example` | 「セッション開始」節 | 「clone 後の再開」節 | 連結 |
| `gitignore.example` | (無し) | 3 行 | Node 標準 + 連結 |
| `package.json.example` | (無し) | scripts / hooks / devDeps | 骨組みに差し込み |
| ファイル本体 | `templates/` | `templates/` | コピー |

各パターンは自分の破片しか持たず、相手の破片の存在を知らない。継ぎ合わせ方だけ build-kit にある。

### 7.5 独立が壊れる兆候 (先に決めておくルール)

| やってはいけないこと | なぜ |
|---|---|
| kit に、どちらのパターンにも無い手書きの内容を足す | kit が第 3 の正本になり、ずれる場所が増える |
| securecheck が `docs/` に何かを書く (導入ノートの自動生成など) | 依存の向きが逆転する |
| docs-structure の action に 15 項目を書き写す | 「安全」の定義が再び 2 箇所になる (観測 b の再発) |

時間軸で見ると「段 1 = 各パターンが自分の破片を整える」「段 2 = 破片を継ぎ合わせる装置を作る」「段 3 = 入口を分ける」で、パターン同士が互いに近づく段はどこにもない。

### 7.6 射程の外に置くもの (意図的に)

| 置かないもの | 理由 | 代わりに |
|---|---|---|
| **CI の設定ファイル** | 肥大化する。パターン repo が CI の都合を知り始めると、CI のためのコードが増える | **中のコマンドが素直に CI に等しい**状態を保つ。`npm run build:kit` (生成 + スモーク) と `setup-local` (末尾の verify) がそのまま CI 相当。将来 CI に載せたい人はこの 2 つを呼ぶだけで、リポジトリ側は何も知らない |
| **特定の AI ツールへの依存** | Bob でも Claude Code でも Cursor でも同じに回る抽象さを保つ (docs-structure が既に掲げている線) | 手順書は「`node .security-check/cli.js <verb>` を実行して結果を報告」の形に揃える。ツール固有の `!` や `@` 記法に頼らない |
| **Windows 実機での個別検証** | setup-local が経路を Node に固定するので「検証すべき OS 差」自体が小さくなる | 実運用 (Bob 案件など) で回る。観測 e の真因は追わず、CHANGELOG に「echo によるカナリア作成は Windows で信頼できない疑いがあり Node 化で経路を廃止」と 1 行残す |

---

## 8. 既存向けウィザードを手厚くする方向

kit を作ることで初めて手厚くできる。今の手順書は新規と既存の両方を 1 本で相手にしているから、どちらにも最適化できていない。新規が kit に抜ければ、ウィザードの読者は既存案件だけになる。

| 現行 | 縮小後 |
|---|---|
| Phase 0 ヘルスチェック (入口が cwd ガードで壊れている) | ① `install.js` でコピー先行 → `verify`。Phase 0 の順序反転で観測 a が消える |
| Phase 1 テンプレ配置・npm・初回スキャン | ② `package.json` / `.gitignore` のマージ (AI の判断。gitignore は `patch-gitignore.js` で UTF-8 追記) → `npm install` |
| Phase 2 npm scripts | ③ `setup-local` (決定論) |
| Phase 3 hooks・ネガティブテスト・最終確認 | ④ `scan --all` で履歴を含む初回スキャン → 結果の解釈 (AI + 田中さんの判断)。定期監査は従来通り `verify --test-run` |

「手厚く」の中身は、手順を増やすことではなく判断が要る分岐を丁寧にすること:

- husky/lint-staged 検知 (既にある) に加えて、`"type":"module"`・monorepo (`package.json` がルートに無い)・worktree・`.gitignore` の文字コード
- 既存 `docs/` があるが `notes/ letters/ actions/` が揃っていない場合は、**検知して状況を報告し、田中さんの判断を待つ** (勝手にマージ・移設しない。docs-structure の update ワンショットの「無ければ停止」と同じ線)
- 履歴に本物が見つかった時の対応フロー (BFG・トークン無効化)。既存案件で一番判断が重く、AI と人間が一緒にいる価値が最大の場所

### ワンショット指示の Before / After

**新規 (Before)**: docs-structure ワンショット → securecheck ワンショット → Phase 0〜3 を対話で 15 ステップ前後 → 導入ノート

**新規 (After)**:
```
npx degit 1ft-seabass/my-ai-collaboration-patterns/kits/starter my-project
cd my-project && git init && npm install
node .security-check/cli.js setup-local
```
AI に渡す一文は「kit を入れた。`docs/notes` に導入ノートを 1 本書いて」だけ。セッション開始時のウィザードは消える。

**clone 再開 (After)**: `npm install && node .security-check/cli.js setup-local`。README に最初から書いてある。

---

## 9. 決定事項

| # | 論点 | 決定 | 根拠 |
|---|---|---|---|
| 1 | かぶせコマンドの名前 | **`setup-local`** | 「焼き込み = repo」「かぶせ = local」の対比。`bootstrap` は CSS の Bootstrap と混同、`resume` は新規初回に合わず、`init` は git/npm と紛れる |
| 2 | 具体化の順序 | **`setup-local` → `build-kit.js`** | 段 1 → 段 2 の依存そのもの。既存案件 (tokaiec / ibm-bob) が今すぐ恩恵を受ける |
| 3 | フェイルクローズ確認 (`--full`) | **作らない。手順書から消し、パターン repo の Node テストへ** | コードの性質でありマシンごとに変わらない。案件ごとの退避・復元は事故の芽 |
| 4 | 観測 e (Windows 真因) | **追わない。OS で揺れる処理は全部 Node に** | setup-local で経路ごと消える。棚卸しは 4.1 |
| 5 | `scan` サブコマンド | **段 1 に含める** | 手順書から OS 別の書き分けが完全に消える。主戦場は既存案件 |
| 6 | CI | **射程外 (意図的)** | 肥大化を避ける。中のコマンドが CI に等しい状態を保つ (7.6) |
| 7 | 既存 `docs/` が別構造 | **検知して止まる、まで** | 判断層の領分。ウィザードは報告して待つ |

---

## 10. 完成形の一枚絵

```
┌─ my-ai-collaboration-patterns ──────────────────────────────────────────────┐
│                                                                              │
│   patterns/docs-structure (正本)        patterns/setup-securecheck (正本)    │
│     templates/ + README.example           templates/ + README.example        │
│     actions は cli を呼ぶだけ ─────契約────▶ cli.js: verify / setup-local /    │
│                                              scan / pre-commit / ...         │
│            │                                        │                        │
│            └──────────┐   ┌─────────────────────────┘                        │
│                       ▼   ▼                                                  │
│              scripts/build-kit.js  (糊付けの動作。置き場所しか知らない)         │
│                       │  生成 + スモーク (= CI 相当、CI 設定は持たない)          │
│                       ▼                                                      │
│              kits/starter/  (糊付けの結果。意見を持たない。手で触らない)          │
│                KIT_MANIFEST.json に元バージョンを刻む                           │
└──────────────┬───────────────────────────────────────────┬──────────────────┘
               │ degit (新規)                               │ install.js + 既存向けウィザード
               ▼                                            ▼
      ┌─ 新規プロジェクト ─┐                        ┌─ 既存プロジェクト ─┐
      │ docs/              │                        │ docs/ (あれば)      │
      │ .security-check/   │   ← 焼き込み層 →       │ .security-check/   │
      │ package.json 済み  │   (repo に残る)         │ package.json マージ │ ← AI の判断
      │ README に再開手順  │                        │ scan --all → 解釈  │ ← AI + 人の判断
      └─────────┬──────────┘                        └─────────┬──────────┘
                │                                             │
                └──────────────┬──────────────────────────────┘
                               ▼  マシンごと・clone ごと
                  node .security-check/cli.js setup-local     ← かぶせ層 (gitignore 領域)
                    gitleaks DL → hook 配線 → カナリア痕跡 → verify 15/15
```

読み方:

- **上半分**がパターン repo。正本 2 つは互いに近づかず、契約 1 本 (docs-structure → cli) だけで繋がる。build-kit は置き場所しか知らず、kit は何も知らない
- **下半分**が案件。新規は kit を degit するだけ、既存はウィザード (判断を含む) を通る。どちらも最後は同じ `setup-local` に合流する
- **AI の出番**は既存側の「マージ」と「解釈」の 2 箇所だけ。新規側には無い
- どの箱にも CI 設定は無く、特定の AI ツール名も無い

---

## 関連リンク

- [my-ai-collaboration-patterns](https://github.com/1ft-seabass/my-ai-collaboration-patterns)
- 原資 (セッションフォルダ内): `setup-securecheck.zip` / `docs-structure.zip` / `ibm-bob-codeengine-sample-02-main.zip` / `tokaiec-port-forward-tool-web-main.zip`

---

**最終更新**: 2026-09-22
**作成者**: Fable + 田中正吾（原資） / Claude Code（移植）
