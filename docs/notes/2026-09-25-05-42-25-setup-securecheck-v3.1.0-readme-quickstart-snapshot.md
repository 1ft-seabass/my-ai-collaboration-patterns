---
tags: [setup-securecheck, v3.1.0, quickstart, snapshot, verification]
---

# setup-securecheck v3.1.0 - README再構成・quickstart.md新設・スナップショット分離の記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-25
**関連タスク**: [setup-securecheck v3.1.0のsetup-local実装の記録](./2026-09-24-07-41-18-setup-securecheck-v3.1.0-setup-local-implementation.md)の続き

## 問題

`setup-local`実装が完了した後、README.mdに新しい「Node.js前提」ワンショット指示を追加する作業で2つの問題が見つかった。

1. チェックボックス・ゴーサイン待ちを含む詳細な指示文をそのままREADMEに書こうとすると、READMEが肥大化し、既存の「詳しい手順」ブロック（`setup-securecheck.md`を読ませるだけの短い一文）と非対称な構成になる
2. v3.1.0でNode化した`install.js`/`scan`/`setup-local`が、従来のPhase 0-3ウィザード（`setup-securecheck.md`）の生コマンドを「こっそり書き換えていないか」という健全な疑いが持たれ、実地検証が必要になった

## 解決策

### quickstart.mdの分離

既存の`setup-securecheck.md`と同じ型（README側は短いポインター、詳細は別ファイル）に揃え、`patterns/setup-pattern/setup-securecheck/quickstart.md`を新設した。中身は[ワンショット指示の強制力分析](./2026-09-25-05-43-25-oneshot-instruction-enforcement-analysis.md)で整理した7機構のうち、判断ポイント2箇所（`scan`結果の解釈・`package.json`のマージ）用に薄めたチェックボックス・ゴーサイン待ちを含む。README.mdは`npx degit`＋「quickstart.mdを読んで案内してください」の2行に短縮した。

### 従来ウィザードの実地検証と、2つ目のバグ発見

`install.js`/`scan`/`setup-local`を一切使わず、`setup-securecheck.md`に書かれた生コマンドだけを隔離tmp dirで実行し、v3.1.0のコードに対しても従来通り動くか確認した。

- **結果**: `pre-commit.js`/`verify.js`/`environment.js`/`install-gitleaks.js`はdiffゼロで一切変更していないため、既存プロジェクト（コミット履歴あり）では問題なく動作した
- **発見**: 検証の過程で、手順書Phase 3.5の`git commit -m "test: pre-commit hook"` → `git reset HEAD~1`が、**このコミットがプロジェクト最初のコミットだった場合**`fatal: ambiguous argument 'HEAD~1'`で失敗することを発見した。これは`setup-local.js`実装時に見つけた`git restore --staged`のHEAD未解決バグと同根（新規プロジェクトの「まだ最初のコミットすらない」状態を、手順書の生コマンドが想定していない）だが、独立した別のコマンドで起きる、今回新たに見つけたバグである
- **実害が低かった理由**: GitHubでリポジトリ作成時にREADME/.gitignoreの初期コミットが自動生成される運用や、docs-structure等で先に1コミット作っている実態があるため、「本当にコミット0の状態でPhase 3.5に到達する」ケースが少なく、これまで顕在化しなかったと考えられる

### 現行ドキュメントは修正、凍結スナップショットは据え置き

このバグへの対応方針は非対称にした。

- **現行の`setup-securecheck.md`**（今後も使われ続けるフォールバック手順書）: 修正した。Phase 3.5に「初回コミットの場合は`git update-ref -d HEAD`を使う」注記を追加し、3.5.5-bのクリーンアップコマンドを`git restore --staged`から`git rm --cached`（HEAD不要で常に動く）に置き換えた
- **`setup-securecheck-3.0.2`**（v3.1.0より前の状態を凍結したスナップショット、新設）: バグを含めて意図的にそのまま。v3.0.2リリースコミット（`527f556`）の内容を`git archive`で複製し、`SNAPSHOT_NOTE.md`を追加して「今後更新しない・バグを含む」旨を明記した

判断の理由: スナップショットは「過去の実態の保存」が目的なので、バグ込みが正しい。踏んだ場合はその場でAIがライブに気づいて対処すればよい、という運用に倣った。一方、現行ドキュメントは今後も新規プロジェクトで使われ続けるため、既知のバグを放置する理由がない。

### PATの誤露出とその場での判断

実地検証中に`git remote -v`を実行した際、GitHub PATがツール出力に平文で表示される事故が発生した。ユーザーの環境（Tailscale + 事務所PC + コンテナ内）に基づき「リスク許容範囲」と判断され、ローテーションは行わないことになった。あわせて、この判断をAIの永続メモリに「一般化されたルール」として保存することも検討したが、**「他の種類の機密情報漏洩まで無視するようになりそう」という理由で保存しないことに決まった**。狭いスコープの安全判断を、将来のセッションが誤って広く適用してしまうリスクを避けるための選択。

## 検証結果

すべて隔離環境で、このリポジトリ自身には一切触れず検証した。

- **ローカルファイル参照ではなく実際の`npx degit`でGitHubから取得**し、`install.js`→`scan --all`→（判断: package.jsonマージ）→`setup-local`の一連を実行し、**15/15 passed**を確認
- `setup-securecheck-3.0.2`も独立して`npx degit`で取得できることを確認。バグ（`git reset HEAD~1`・`git restore --staged`）が意図通りそのまま残っていることも確認

## 関連ドキュメント

- [setup-securecheck v3.1.0のsetup-local実装の記録](./2026-09-24-07-41-18-setup-securecheck-v3.1.0-setup-local-implementation.md)
- [ワンショット指示の強制力分析](./2026-09-25-05-43-25-oneshot-instruction-enforcement-analysis.md)
- [kit構想からみたv3.1.0の振り返り](./2026-09-25-05-44-25-kit-vision-v3.1.0-retrospective.md)

---

**最終更新**: 2026-09-25
**作成者**: AI
