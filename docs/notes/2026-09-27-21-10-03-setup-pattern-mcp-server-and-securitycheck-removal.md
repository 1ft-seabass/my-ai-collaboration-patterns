---
tags: [setup-pattern, kit-vision, cleanup, docs-structure-mcp-server, docs-structure-and-securitycheck]
---

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-09-27
**関連タスク**: kit構想の肥大化防止のための`setup-pattern`配下パターンの整理（1回目: `docs-structure-mcp-server`・`docs-structure-and-securitycheck`の削除）

## 問題

v3.1.0のクロスプラットフォーム検証完了後、ユーザーから「今後メンテが必要になりそうな4つの懸念」が共有された:

1. `patterns/setup-pattern/README.md`が各パターンのREADMEと内容重複しており、追従メンテ・重複解消がしにくい
2. `docs-structure-mcp-server`は結局AIがプロンプトで回るものなので、うまく機能しなそう
3. `docs-structure-and-securitycheck`は旧式に依存していて密結合。kit構想に進む前に削除するかもしれない
4. `docs-structure-for-branch`はNode.jsがある前提のツール感が強く、より確定的にNode化できる可能性がある

「kit自体を肥大化させない」という観点から、まず実コードを見て観測し、その結果を踏まえて着手できるものから整理することにした。

## 試行錯誤

### 観測: 4項目それぞれの実態確認

実コードを読んで確認した結果:

- **①README重複**: `docs-structure-and-securitycheck`・`docs-structure-for-branch`の`npx degit`コマンドが、親README（`patterns/setup-pattern/README.md`）と各パターンのREADMEの両方に同一内容で存在。今は一致しているが、片方だけ更新すれば乖離するリスクが構造的に存在
- **②`docs-structure-mcp-server`**: `prepare_note`/`prepare_letter`等のツールは「テンプレート＋ファイルパスを返す」だけで、実際のファイル書き込みはAIが行う設計（README使用例にも明記）。`install.js`のように「コードが最後まで確定的に完結する」形になっておらず、AIの実行判断を経由する一段が必ず残る。MCPサーバー自身の導入（`npm install`→`.env`作成→`.mcp.json`手動編集→再起動）も全部手動で、README自身が「今後の拡張: setup.js（ブートストラップ）」を積み残し扱いにしていた（未着手のまま）
- **③`docs-structure-and-securitycheck`**: `setup-all.js`（490行）は`.security-check/lib/environment.js`の`detectLegacyV1()`/`detectLegacyV2()`と「判定ロジックを同一に保つこと」という前提のコード（二重管理）。実際に**既に乖離が発生していた**: このセッションで`setup-local.js`に追加した`.gitignore`の`node_modules/`・`tmp/`除外が、`setup-all.js`側の`.gitignore`追記ロジックには反映されておらず、旧内容のままだった
- **④`docs-structure-for-branch`**: `for_branch_init.md`（188行）はスクリプトを一切持たない、AIが読んで手動で実行する手順書のみの構成（`install.js`登場以前の旧スタイル）。ディレクトリ作成・テンプレートコピー・パス書き換えは機械的な作業に見え、Node化の余地がありそう

### 決定: ②③を削除、①は②③削除の副産物として対応、④は次回検討

②`docs-structure-mcp-server`と③`docs-structure-and-securitycheck`について、削除前にサルベージすべき知見がないかを確認した:

- `setup-all.js`の"FIXED"相当ロジック（壊れた`pre-commit`値の自動修正）は、既に`setup-local.js`の`isEffectivelyCorrectPreCommitValue()`として移植済みだった
- `docs-structure-mcp-server`の「今後の拡張: setup.js」は未着手のまま、実現しなかったロードマップ

いずれも独自に残すべき知見はないと判断し、削除を決定した。①（README重複解消）は、②③を削除すれば該当セクションが自然に消えるため、今回はその範囲で対応し、`docs-structure-for-branch`を含めた本格的な構成見直しは次回以降とした。

### アプローチA（成功）: 削除と参照クリーンアップ

**実施内容**:
1. `git rm -r`で`patterns/setup-pattern/docs-structure-mcp-server/`・`patterns/setup-pattern/docs-structure-and-securitycheck/`を削除
2. `patterns/setup-pattern/README.md`から`docs-structure-and-securitycheck`の紹介セクションとディレクトリ構成図の該当行を削除（`docs-structure-mcp-server`は元々親READMEに掲載されていなかった）
3. `setup-local.js`の`isEffectivelyCorrectPreCommitValue()`直前にあった、削除対象への古い比較コメントを整理

**確認**: 削除後、`patterns/`配下に両パターンへの生きた参照が残っていないことをgrepで確認。`docs/notes/`・`docs/letters/`・`CHANGELOG.md`の過去の言及は履歴としてそのまま残した（意図的に触らない）。

**結果**: 成功。

## 解決策

`patterns/setup-pattern/docs-structure-mcp-server/`と`patterns/setup-pattern/docs-structure-and-securitycheck/`を削除し、生きた参照（`README.md`・`setup-local.js`のコメント）を整理した。

**実装場所**:
- `patterns/setup-pattern/docs-structure-mcp-server/`（削除）
- `patterns/setup-pattern/docs-structure-and-securitycheck/`（削除）
- `patterns/setup-pattern/README.md`（該当セクション削除）
- `patterns/setup-pattern/setup-securecheck/templates/.security-check/lib/setup-local.js`（コメント整理）

**主なポイント**:
1. 削除の判断基準は「サルベージすべき独自の知見が残っているか」で確認してから実施した
2. `docs-structure-and-securitycheck`の密結合リスクは、今回の`.gitignore`修正が反映されていなかったという**具体的な乖離の実例**として既に顕在化していた
3. 過去のドキュメント（notes/letters/CHANGELOG）は歴史的記録として意図的に触らなかった

## 学び

- 「密結合による同期漏れ」というリスクは、抽象的な懸念で終わらせず、実際にコードを読むと具体的な実例（今回のセッションで直した`.gitignore`修正の未反映）としてすぐに見つかった。設計判断は実コードを見て裏取りするのが有効
- 削除前の「サルベージすべき知見の確認」は、削除の意思決定とは独立した手順として毎回やる価値がある（今回は両方とも「既に移植済み」「未着手のまま」で、実際には失うものがなかった）
- kit構想において「パターンを増やす」だけでなく「役目を終えた・設計とミスマッチのパターンを削除する」ことも、肥大化を防ぐ意味で対称的に重要な作業

## 今後の改善案

- `docs-structure-for-branch`のNode化検討（次のセッション/作業として着手予定）
- `patterns/setup-pattern/README.md`のより踏み込んだ構成見直し（各パターンのREADMEへの委譲）は、`docs-structure-for-branch`の扱いが決まってから改めて検討

## 関連ドキュメント
- なし（本ノートが本件の最初の記録）

---

**最終更新**: 2026-09-27
**作成者**: AI
