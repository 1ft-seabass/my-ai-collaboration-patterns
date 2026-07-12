---
tags: [setup-securecheck, implementation, verification-protocol, gitleaks, secretlint, git-internals]
---

# 毎コミット自動カナリア自己検証の実装 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-12
**関連タスク**: 前回セッションの申し送り（[[2026-07-11-11-00-00-worktree-fix-and-canary-design-next]]）で構想・実証実験のみ完了していた「常時ネガティブチェック」の本格実装（[[2026-07-11-10-15-00-per-commit-canary-self-verification-exploration]]の実装編）

## 問題

前回セッションで、「毎コミット自動でネガティブテストを発動させる」設計（gitleaksは検出対象にカナリアblobをgit indexへ注入し既存の`--staged`呼び出し1回に混ぜる）が技術的に成立することをscratchリポジトリで実証したが、以下は未解決のまま次セッションへ持ち越されていた:

1. `scripts/pre-commit.js`（テンプレート＋デプロイ済みコピー両方）への実装
2. secretlint側の同様の実装（ファイルパスしか受け取れない方式でどう実現するか）
3. カナリア検出と実ファイルの本物の漏洩を区別する判定ロジック
4. `process.exit()`が複数箇所にある既存構造での後片付けの確実性
5. パス衝突時のフォールバック設計
6. `security-verify.js` check#11（手動の機能的カナリアテスト）との役割分担

## 試行錯誤

### アプローチA: gitleaksの検出結果をコンソール出力のテキストパースで判定

**試したこと**: 既存の`--redact`付きコンソール出力から、カナリアのパスが含まれるかを正規表現で判定しようとした

**結果**: 採用せず

**理由**: gitleaksは`-v`フラグなしだと`leaks found: N`という件数サマリーのみを出力し、個別のファイルパスをコンソールに出さない。テキストパースは脆く、`-v`を付けると出力形式の変更に強く依存してしまう

---

### アプローチB: secretlintを2回実行（実ファイル用・カナリア用で分離）

**試したこと**: 既存のstagedファイルスキャンとは別に、secretlintをカナリア内容だけに対して`echo "SECRET" | secretlint --stdinFileName=...`のstdinモードで追加実行する案を検討

**結果**: 不採用

**理由**: 実測したところ、secretlintの1プロセスあたりの起動コストは約0.55秒あり（`time npx secretlint README.md`と`time (echo x | npx secretlint --stdinFileName=...)`がともに約0.56秒）、gitleaksバイナリの起動コストと同程度。2回実行すると前回セッションで却下した「素朴な別プロセス追加」と同じ問題（毎コミット+0.5秒近く）が再発する。既存の1回のスキャン呼び出しにカナリアを混ぜ込む前回の設計方針を貫く必要がある

---

### アプローチC（成功）: `--report-format json --report-path` と secretlint `--format json` によるファイル単位判定

**試したこと**:
- **gitleaks**: 既存の`gitleaks git --staged --config gitleaks.toml --redact .`コマンドの末尾に`--report-format json --report-path <tmp>`を追加。コンソール出力（`stdio: 'inherit'`）は従来通り維持しつつ、別途JSONレポートファイルから`File`フィールドでカナリアパス（`.canary-probe`）と実ファイルを区別する
- **secretlint**: `--format json`でJSON出力させ、`filePath`フィールドでカナリア用一時ファイル（`.canary-probe-secretlint`）と実ファイルを区別する。ただし`--output`指定時は常に`exit 0`になる仕様（`npx secretlint --help`で確認）だったため、`--output`は使わず標準出力をキャプチャして自前でパースする方式にした

**結果**: 成功

**検証コマンド例（scratchリポジトリ）**:
```bash
BLOB=$(printf 'GITHUB_PAT=ghp_A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8' | git hash-object -w --stdin)  # gitleaks:allow secretlint-disable-line
git update-index --add --cacheinfo 100644,$BLOB,.canary-probe
gitleaks git --staged --config gitleaks.toml --redact . --report-format json --report-path report.json
# report.json の File フィールドで .canary-probe と実ファイルを判別できることを確認
git update-index --force-remove .canary-probe
```

実際に「.canary-probeのみ検出」「.canary-probe＋実ファイル両方検出」「検出ルールを壊して.canary-probeも検出されない」の3パターンをscratchリポジトリで再現し、レポートJSONの`File`フィールドが期待通り機能することを確認した。

## 解決策

最終的な実装方法の詳細。

**実装場所**: `scripts/pre-commit.js`（テンプレート＋デプロイ済みコピー同期）、`scripts/security-verify.js`（同）

**主なポイント**:

1. **gitleaksの自動カナリア**: `git hash-object -w --stdin`でblobを作成し`git update-index --add --cacheinfo`でindexにのみ登録（作業ツリーには一切書かない）。既存の`--staged`スキャン1回に`--report-format json --report-path`を追加してファイル単位の判定材料を得る。直後に`git update-index --force-remove`で除去
2. **secretlintの自動カナリア**: cwd配下に一時ファイル（`.canary-probe-secretlint`）を書いてstagedファイルリストに混ぜ込み、既存の1回のスキャン呼び出しに含める。`--format json`でファイル単位に判定し、直後に`fs.rmSync`で削除
3. **フェイルクローズ**: カナリアが検出できなかった場合（検出ルールが機能していない状態）はコミットをブロックする。「実際にブロックされた証拠」で判定するというこのプロジェクトの一貫した設計方針に合わせた
4. **パス衝突時のみ例外**: ユーザーの実ステージ内容がカナリアと同名だった場合のみ自己検証をスキップし、実コミットはブロックしない
5. **`process.exit()`散在構造の解消**: 既存コードは複数箇所で`process.exit()`を直接呼んでおり、そのままカナリアの後片付けコードを追加すると「`process.exit()`が呼ばれた場合、それより上の`finally`ブロックは実行されない」というNode.jsの挙動により後片付けが飛ばされる危険があった。これは前回セッションのノートで「注意点」として明記されていた（[[2026-07-11-10-15-00-per-commit-canary-self-verification-exploration]]参照）。対応として、途中の`process.exit()`呼び出しをすべて撤去し、`exitCode`変数に結果を蓄積したうえで`try/catch/finally`を1回だけ通し、最後に単一の`process.exit(exitCode)`を呼ぶ構造に変更した
6. **ログへの証拠記録**: `.logs/pre-commit.log`の各エントリに`autoCanary: { gitleaks, secretlint }`（値は`ok`/`failed`/`cleanup-failed`/`skipped`）を追加。既存の手動ネガティブテスト用`type: "canary"`フィールド（Step 3.6.5専用、`.test-secret-canary`をステージした場合のみ付与）とは独立したフィールドとして共存させた

### security-verify.js check#14の追加とcheck#11・#13との役割分担

ユーザーと相談の結果、以下の方針で合意した:

- **check#11**（`gitleaks dir`での単発の機能的カナリアテスト）はそのまま維持。コミットを介さず任意タイミングで即座に確認できる価値がある
- **check#13**（Step 3.6.5の手動ネガティブテストの実行痕跡）もそのまま維持。手動テストは「意図的に検証した」という別の証拠価値を持つ
- **check#14**を新規追加。`.logs/pre-commit.log`の直近エントリの`autoCanary`フィールドを見て、毎コミット自動自己検証が実際に機能していたかを事実で判定する。仕組みとしてはcheck#13と同じ「集計数字ではなく実際にブロックされた証拠で判定する」設計方針に沿う

ヘルスチェック項目数は13→14に増加。VERSIONは2.0.3→2.1.0（新機能追加のためminorバンプ）。

## 学び

- **プロセス起動コストの支配的要因はツール自体の起動オーバーヘッドであり、実行内容ではない**: gitleaks（Goバイナリ）・secretlint（Node CLI）ともに、スキャン対象が1ファイルでも100ファイルでも起動コスト（0.4〜0.6秒）が支配的で、スキャン内容の増分コストはほぼ無視できる。したがって「既存の1回の呼び出しに混ぜ込む」設計が有効な理由は、プロセス起動回数を増やさないことそのものにある
- **`--output`のようなCLIオプションは、指定するだけで暗黙にexit codeの意味を変えることがある**: secretlintは`--output`指定時、検出があっても`exit 0`を返す仕様だった（「ファイルに書いたので便利なように成功扱いにする」という設計判断と推測される）。ドキュメント（`--help`）を読まずに動作を仮定すると誤った判定ロジックを書いてしまうところだった
- **`process.exit()`の危険性は「知っている」だけでは防げず、構造的に排除する必要がある**: 前回セッションのノートで注意点として明記されていたにもかかわらず、実装時に個別の`process.exit()`呼び出し箇所ごとに気をつける形では見落としのリスクが残る。「try/finallyを1回だけ通し、exit()は最後の1箇所のみ」という構造上の制約に倒すことで、レビュー時にも見落としにくくなる

## 今後の改善案

- `.logs/pre-commit.log`が50件を超えてローテーションされると、check#14が参照できるのは直近のコミットのみになる。将来的に「直近N件のうち自己検証が機能していた割合」のような集計が必要になった場合は別途検討が必要（現時点では「直近1件」の事実確認で十分という判断）
- secretlint側の一時ファイル方式は、cwd配下に瞬間的とはいえ実ファイルを書く必要がある点でgitleaks側（index注入のみ、作業ツリー非汚染）と非対称。secretlintが将来的にstdin経由で複数ファイルのコンテンツを受け取れるモードを追加した場合は、そちらに置き換える余地がある

## 関連ドキュメント
- [毎コミット自動ネガティブテスト化の構想と実証実験](./2026-07-11-10-15-00-per-commit-canary-self-verification-exploration.md)
- [setup-securecheckの立ち位置についての振り返り](./2026-07-11-10-15-05-securecheck-positioning-reflection.md)
- [worktree構成でのpre-commit誤検知修正](./2026-07-11-00-00-00-worktree-precommit-detection-fix.md)
- [前回セッションの申し送り](../letters/2026-07-11-11-00-00-worktree-fix-and-canary-design-next.md)

---

**最終更新**: 2026-07-12
**作成者**: Claude
