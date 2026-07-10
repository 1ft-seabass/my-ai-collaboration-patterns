---
tags: [setup-securecheck, gitleaks, vulnerability, verification, secretlint]
---

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-09
**関連タスク**: setup-securecheck v2.0.1 の脆弱性報告調査

## 問題

前回セッションの申し送りで「セキュリティチェックの最新版自体がおかしいことになってるっぽい」という懸念が持ち越されていた。今セッション冒頭でユーザーから具体的なバグ報告（4件）を受け取った。

報告内容（要約）:
1. `templates/gitleaks.toml` に `[extend] useDefault = true` が無く、`[allowlist]` のみの設定のため検出ルール0個で動作する。gitleaks は exit 0 / no leaks found を返すため、導入者は二重チェックが効いていると誤認する
2. 指示書（`setup-securecheck.md` ステップ3.6.5）のネガティブテストのカナリア値が gitleaks.toml 自身の allowlist regexes（`xxxxxx`）に一致してしまい検出できない。さらに `pre-commit.js` は secretlint 失敗時に即座に catch へ落ち gitleaks を実行しないため、gitleaks が完全に無効でもテストは成功したように見える
3. `security-verify.js` の gitleaks.toml 中身チェックが「空でないこと」のみで、ルール0個の設定でも 11/11 passed になる
4. gitleaks 8.28 以降 `detect`/`protect` サブコマンドが `--help` から非表示（非推奨）になっている

これが「AIの応答揺れ」ではなく決定論的な設定バグである点、および実際にこのリポジトリで実害が出ていたかを検証する必要があった。

## 検証したこと

### 問題1の再現（決定論的であることの確認）

`bin/gitleaks` 8.30.0 をインストールし、同一の合成シークレット（36桁の GitHub PAT 形式）を用意して比較:

```
config指定あり(gitleaks.toml) → scanned 58 bytes / no leaks found / exit 0
config指定なし(デフォルトルール) → scanned 58 bytes / leaks found: 1 / exit 1
```

`[extend]\nuseDefault = true` を先頭に追加すると exit 1 で検出されるようになることも確認。最初の再現試行では実行パスに `/tmp/` を含めてしまい、gitleaks.toml の allowlist `tmp/.*`（当時は未アンカー）に誤爆して 0 bytes scanned になったため、パスを `/tmp` を含まない場所に変更して再検証した（この誤爆自体が後述の副次的発見につながった）。

### 問題2の再現

`setup-securecheck.md` 記載どおりの負テストカナリア（`ghp_xxxx...`）に対して:
- `npx secretlint` 単体 → GITHUB_TOKEN ルールで検出、exit 1
- 修正後の gitleaks（rules有効）でも同じカナリアをスキャン → allowlist の `xxxxxx` に一致し検出されず、exit 0

`pre-commit.js` の実装（try/catch 構造）を確認し、secretlint の execSync が投げた時点で catch に落ち、gitleaks セクション（当時の実装で69〜94行目）が一度も実行されないことをコードレベルで確認。

### 問題3・4

`security-verify.js` の該当チェック（当時148〜153行目）が `gitleaksToml.trim().length > 0` のみであることをコードで確認。`gitleaks --help` の出力から `detect`/`protect` が Available Commands に表示されないこと、しかし `gitleaks protect --help` / `gitleaks detect --help` は実行できる（動作はする）ことを確認。

### 実害調査（このリポジトリ自身への影響）

修正版の gitleaks.toml（`[extend] useDefault = true` を追加した一時ファイル）でこのリポジトリの全履歴（196コミット）をスキャン:

```
現状の運用設定（壊れたルール） → no leaks found
修正版設定（デフォルトルール有効） → leaks found: 1
```

検出1件の中身を `git show <commit>:<path>` で確認したところ、`setup_securecheck.md` の「パターンB: 値を明確なダミーに変更」という説明で使われている Before/After のサンプル値（`sk-` 接頭辞を持つ16桁の16進数風ダミー値）であり、本物の資格情報ではなかった。

**結論**: このリポジトリの履歴に実際に漏洩したシークレットは見つからなかった。ただし、このリポジトリ自身の `gitleaks.toml`（ルート、`setup-securecheck` 導入時に配置されたもの）も同じ理由（`[extend]`/`[rules]` 無し）で検出ルール0個のまま、導入コミット（`5deb59d`）以来ずっと動いていたことが判明した。実際にこのリポジトリを守っていたのは secretlint（`preset-recommend`）のみであり、gitleaks は「二重チェック」という触れ込みに反して常に green を返すだけの飾りだった。

## 学び

- 決定論的な設定バグ（トグル1つの有無で結果が確定する）は、AIの応答揺れとは別カテゴリの障害であり、再現性を武器に「実データでの実害有無」を機械的に検証できる
- 「検出ルールが機能しているように見える」（exit 0 / no leaks found）は「検出ルールが実際に機能している」ことの証明にはならない。プレースホルダーが安全に除外されているのか、そもそもルールが0個で何もスキャンしていないのかは、出力だけからは区別できない
- ネガティブテストのカナリア値は、その設定ファイル自身の allowlist と衝突していないか必ず確認する必要がある。「テストに使うダミー値」と「日常運用で無視したいプレースホルダー」が同じ語彙（`xxxxxx`, `YOUR_API_KEY`等）を使い回すと、テスト自体が無力化する

## 関連ドキュメント

- [修正実装ノート](./2026-07-09-23-14-00-setup-securecheck-v2-0-2-gitleaks-fixes-implementation.md)
- [副次的発見ノート](./2026-07-09-23-15-00-setup-securecheck-additional-discoveries-during-fix.md)

---

**最終更新**: 2026-07-09
**作成者**: Claude
