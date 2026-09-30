---
tags: [kit-vision, kit-my-basic-start, docs-structure, setup-securecheck, maintenance-cost]
---

# kit-my-basic-start新設の経緯

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-30
**関連タスク**: kit構想「段2」の議論（[前回申し送り](../letters/2026-09-28-22-33-15-v3.1.0-cross-platform-validation-and-kit-vision-cleanup.md)からの継続）

## 問題

前回申し送りの「次にやること」で最優先候補としていた kit構想の「段2」（[Fable原資](./2026-09-22-23-36-08-kit-vision-fable-session-source.md)が想定していた `kits/starter/` + `scripts/build-kit.js`：2パターンの`templates/`を糊付けして package.json 焼き込み済みの生成物を作り、スモークテストで検証する仕組み）に進むかどうかの検討。ユーザーから「各パターンが結構磨かれたので、本当に接点だけ作ればいい感じがする」という見立てが事前に出ていた。

## 検討

### 原資の「段2」が重かった理由は、今はもう解消されている

Fable原資が`build-kit.js`のような重い合成装置を必要とした理由は、当時（2026-09-22時点）の観測b/c（`docs-structure`内部・v1世代のまま同期漏れ）のような「ファイル配置・OS依存処理の未成熟さ」だった。しかし段1（`setup-securecheck` v3.1.0）・段1'（`docs-structure` v1.3.0）を経て、両パターンはそれぞれ:

- `install.js`が冪等かつクロスプラットフォーム検証済み（Windows x2・Linux）
- `setup-securecheck/install.js`は`npm init -y`で新規`package.json`も自動生成済み

という状態まで磨かれており、残る判断ポイントは`setup-securecheck`側の「scan結果の解釈」「package.jsonマージ確認」の2つだけ（新規プロジェクトでもマージ確認自体は律儀に挟まれる、という小さな無駄はあるが）。原資が警戒していた「同期漏れ」「OS依存」のリスクは既に段1側で解消済みで、重い生成物（`kits/starter/`・`build-kit.js`・スモークテスト・`KIT_MANIFEST.json`）を新たに持つ動機が薄くなっていた。

### 「接点」に何を持たせ、何を持たせないか

2パターンの内部（`docs-structure`のREADME、`setup-securecheck`のquickstart.md）は既にそれぞれの判断ポイントに応じた強さのゲート（チェックボックス・【判断】マーカー・「はい」待ち等）を持っている。接点側でこれを複製すると、以前削除した`docs-structure-and-securitycheck`の`setup-all.js`が`.security-check/lib/environment.js`と手動同期していて実際に乖離した（[削除の経緯](./2026-09-27-21-10-03-setup-pattern-mcp-server-and-securitycheck-removal.md)）のと同じ構造のリスクを持ち込むことになる。

そのため、接点（`kit-my-basic-start`）には**各パターン内部の判断ゲート機構は複製せず、それぞれのワンショット本文に委譲**し、接点自身が新規に持つルールは以下の1つだけに絞った:

> 1つのパターンが完了しても、ノート＋コミットの完了報告を人間から受け取るまで、次のパターンに進まない

これは`docs-structure`単体のワンショットには無い締め（`setup-securecheck`のquickstart.md Step 6は既に持っている）であり、かつ2パターンをまたぐ順序そのものは接点でしか表現できない、唯一「複製ではなく新規」な部分だった。

### ルートREADME.mdは更新しない

新パターン追加のたびにルートREADME.mdの4箇所（5秒で使う／パターン一覧／詳細ガイド／Quick Start）を更新する運用は[過去のノート](./2025-11-17-23-47-37-readme-sync-with-new-patterns.md)（2025-11-01）で確立されていたが、[メンテナンスコストのアーキテクチャ方針合意](./2026-09-22-23-20-37-maintenance-cost-architecture-direction-agreement.md)（2026-09-22）で「ルートREADME.md/SETUP.mdは『カタログ』から『入口』に縮小し、各パターンフォルダの説明を厚くする方向」と明確に上書きされている。今回はこの新しい方針に従い、ルートREADME.mdは更新しないことをユーザーと確認した。

## 解決策

`patterns/kit-my-basic-start/README.md`を新設。

**構成**:
- `templates/`・`install.js`は持たない。README.md（順序＋1つの待ちルール）のみで完結
- ワンショット指示は「① `docs-structure`導入 → ノート＋コミット完了報告を待つ → ② `setup-securecheck`導入（quickstart.md使用）→ ノート＋コミット完了報告を待つ → ③完了報告」という順序を明示
- 各パターンの判断ポイント・締めの案内は、それぞれのワンショット指示・quickstart.mdへのリンクで委譲するのみで、内容を書き写さない

## 学び

- kit構想の「段2」は、原資が想定した重い生成物（build-kit.js/kits/starter/スモークテスト）ではなく、「順序と1つの待ちルールだけを持つ薄い接点」という形で決着した。各パターンが段1で十分磨かれていれば、合成装置は不要という実例
- 「判断ゲートを複製しない」原則は、`docs-structure-and-securitycheck`の反省がそのまま接点設計にも適用できた
- ルートREADME.mdの「カタログ化しない」方針は2026-09-22に既に合意済みだったが、実際に新パターンを追加する場面で初めてその方針を適用する機会になった

## 今後の改善案

- kit構想の残り（Fable原資が想定していた`README.example`同梱・`package.json.example`のバージョン表記更新等）は、今回のスコープでは着手していない。必要になった時点で個別判断
- `install-gitleaks.js`のPowerShell依存回帰の修正は引き続き積み残し

## 関連ドキュメント

- [kit構想 Fableセッション原資](./2026-09-22-23-36-08-kit-vision-fable-session-source.md)
- [メンテナンスコストのアーキテクチャ方針合意](./2026-09-22-23-20-37-maintenance-cost-architecture-direction-agreement.md)
- [setup-pattern MCPサーバー/統合インストーラー削除の経緯](./2026-09-27-21-10-03-setup-pattern-mcp-server-and-securitycheck-removal.md)
- [ルートREADME.mdの最新パターンへの同期（旧方針）](./2025-11-17-23-47-37-readme-sync-with-new-patterns.md)
- [v3.1.0クロスプラットフォーム検証とkit構想整理の申し送り](../letters/2026-09-28-22-33-15-v3.1.0-cross-platform-validation-and-kit-vision-cleanup.md)

---

**最終更新**: 2026-09-30
**作成者**: AI
