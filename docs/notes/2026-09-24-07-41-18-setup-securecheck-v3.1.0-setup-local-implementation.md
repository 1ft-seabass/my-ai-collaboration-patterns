---
tags: [setup-securecheck, v3.1.0, setup-local, fail-close, verification]
---

# setup-securecheck v3.1.0 - setup-local実装

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-24
**関連タスク**: [setup-securecheck v3.1.0 着手前合意](./2026-09-24-00-12-39-setup-securecheck-v3.1.0-pre-implementation-agreement.md)の③の実行編、[setup-localの超精密作業計画](./2026-09-24-02-00-21-setup-local-precise-work-plan.md)の実装

## 問題

着手前合意ノートで決めた3つの実装（①install.js相当、②scan、③setup-local）のうち、前セッションで①②は実装・検証済みだった。残る③setup-local（手順書Phase3の3.1・3.3〜3.6に相当する、確定的チャンク⑤への命名）を、事前に作成済みの超精密作業計画ノートに従って実装する必要があった。

## 解決策

`patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/setup-local.js`を新設し、`cli.js`のSUBCOMMANDSとヘルプに追加した。精密作業計画ノート通り、以下7ステップを1コマンドに集約している。

1. **simple-git-hooksインストール**: `package.json`のdevDependenciesに無ければ`npm install -D simple-git-hooks`（install.js相当・setup-localのどちらにも実装されていなかった漏れを拾う）
2. **前提チェック**: `package.json`の`simple-git-hooks.pre-commit`が`node .security-check/cli.js pre-commit`と実質一致するか確認。`docs-structure-and-securitycheck/setup-all.js`の`isEffectivelyCorrectPreCommitValue()`と判定基準を揃え、実装をコピー（requireでの共有はできないため）。満たされていなければ、何を書くべきか具体的に示してエラー終了
3. **フック有効化**: `npx simple-git-hooks`
4. **`.gitignore`更新**: `templates/gitignore.example`と同じ内容を冪等に追記。setup-local.jsはプロジェクトへ配置された後は元のパターンリポジトリ側`templates/`を参照できないため、内容を定数として直接持つ設計にした
5. **フェイルクローズ確認**（3.5.5-c相当、Node化）: `.security-check/bin/gitleaks`が存在すれば`fs.renameSync`で退避、存在しなければそのまま、`node .security-check/cli.js pre-commit`をサブプロセス実行してブロックメッセージを確認、`try/finally`で必ず復元
6. **ネガティブテスト**（3.5.5-a/b相当、最後に実行）: Node.jsでカナリアファイルを書き`git add`→実際に`git commit`を試みてブロックを確認（`pre-commit`を直接呼ぶのではなくgit経由にすることで、`npx simple-git-hooks`で配線したフック自体が実際に発火するかまで検証できる）→`gitleaks`単独でも`exit code 1`を確認→`try/finally`で後片付け
7. **最終確認**: `verify --test-run`を呼んで締める（3層目の証拠）

実装順は精密作業計画ノート通り「フェイルクローズ確認→ネガティブテスト→verify」。ネガティブテストを最後にすることで、直近の`pre-commit.log`エントリが両検出器`ok`の健全な状態になり、`verify`のcheck#15（自動カナリア自己検証の実行痕跡）が誤って警告にならないようにしている。

## 検証結果

隔離した一時ディレクトリで、このリポジトリ自身には一切触れず検証した（`git init`→`install.js`実行→`package.json`に`simple-git-hooks`設定を手動追記→`setup-local`実行）。実際のgitleaksバイナリ（v8.30.0）のダウンロード、実際の`git commit`を含む。

- **正常系**: 15/15 passed（存在・中身・動作チェック全て、テストラン含む）
- **冪等性**: 2回目実行で「simple-git-hooksインストール」「.gitignore更新」がSKIP表示になり、フェイルクローズ確認・ネガティブテスト・verifyは正常に再実行されることを確認
- **前提チェック失敗系**: `simple-git-hooks.pre-commit`未設定のプロジェクトで実行し、分かりやすいエラーメッセージとexit code 1で停止することを確認

## 学び

- **実装中に手順書自体の潜在バグを発見・修正した**: 手順書3.5.5-bに書かれている`git restore --staged .test-secret-canary`は、初回コミット前（新規プロジェクト、HEADが存在しない状態）のリポジトリで実行すると`fatal: could not resolve HEAD`で失敗する。`git restore --staged`は内部的にHEADの解決を必要とするため。この状態は「新規プロジェクトにこのパターンを最初から導入する」という、この配布パターンが最も想定している使い方の1つで普通に発生しうる。`git rm --cached --ignore-unmatch`（HEAD不要）に置き換えて解決した。この不具合は手順書に書かれたまま気づかれていなかったもので、コード化して実際に動かしたことで初めて発覚した
- 上記に伴い、「ネガティブテストでブロックされずコミットが成立してしまった場合の巻き戻し」処理（バグ時のフォールバック）も、直前が初回コミットだった場合`HEAD~1`が存在せず`git reset HEAD~1`が失敗しうることに気づき、`git rev-parse --verify -q HEAD~1`の有無で`git reset HEAD~1`／`git update-ref -d HEAD`を分岐するよう堅牢化した
- ネガティブテストを`node .security-check/cli.js pre-commit`の直接呼び出しではなく実際の`git commit`にしたことで、フック配線（`npx simple-git-hooks`が生成した`.git/hooks/pre-commit`）自体が正しく発火するかまで実地で確認できる。フェイルクローズ確認の方は配線を問わないロジックの確認が目的なので、直接呼び出しのままで役割が違う、という精密作業計画ノートの設計意図を実装時に再確認できた

## 今後の改善案

- [ ] `VERSION`（3.0.2→3.1.0）・`CHANGELOG.md`・`README.md`（install.js/scan/setup-localの反映）のバージョンアップ対応
- [ ] バージョンアップ後、実際の配布経路（`npx degit`でGitHubから取得）を通した検証
- [ ] ユーザー自身による実プロジェクトでの試用

## 関連ドキュメント

- [setup-securecheck v3.1.0 着手前合意](./2026-09-24-00-12-39-setup-securecheck-v3.1.0-pre-implementation-agreement.md)
- [setup-localの超精密作業計画](./2026-09-24-02-00-21-setup-local-precise-work-plan.md)
- [setup-securecheck v3.1.0 install.js相当/scan実装](./2026-09-24-01-59-16-setup-securecheck-v3.1.0-install-js-and-scan-implementation.md)
- [setup-securecheckの確定的チャンクと3層の証拠構造](./2026-09-23-23-13-19-setup-securecheck-deterministic-chunks-and-evidence-layers.md)
- [フェイルクローズ確認の理解とCIスタンスの整合](./2026-09-23-02-12-53-fail-close-check-and-ci-stance-alignment.md)

---

**最終更新**: 2026-09-24
**作成者**: AI
