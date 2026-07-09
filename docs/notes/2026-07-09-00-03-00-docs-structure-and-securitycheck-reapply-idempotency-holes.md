---
tags: [docs-structure, setup-securecheck, installer, idempotency, gitleaks]
---

# docs-structure-and-securitycheck 再適用時の冪等性の穴

**作成日**: 2026-07-09
**関連タスク**: [統合インストーラー実装](./2026-07-09-00-02-00-docs-structure-and-securitycheck-installer-implementation.md)後の「既存の壊れたプロジェクトに再度投げたら自己修復するか」検証

## 問題

[実装ノート](./2026-07-09-00-02-00-docs-structure-and-securitycheck-installer-implementation.md)で新規プロジェクトへの導入・再実行の冪等性は確認できていたが、[前回セッションの学び](./2026-07-08-00-00-01-setup-securecheck-reapply-idempotency-holes.md)（「バグ修正後は再適用シナリオで再検証する」）に従い、「既存の壊れた状態に `setup-all.js` をもう一度投げたら本当に自己修復するか」を個別に検証したところ、**2つの穴**が見つかった。

## 試行錯誤

### 穴1: docs-structure がディレクトリの存在だけで判定していた

**試したこと**: `docs/notes`・`docs/letters`・`docs/tasks`・`docs/actions` を空ディレクトリとして作ってから `setup-all.js` を実行（「`mkdir` は完了したがファイルコピー前にプロセスが中断された」状態を模擬）

**結果**: 失敗

**理由**: 実装時点のコードは `docsDirs.every(fileExists)` という**トップ4ディレクトリの存在だけ**を見るゲート判定だった。securecheck 側は `.secretlintrc.json` の有無や `simple-git-hooks.pre-commit` の値をファイル/値単位でチェックしていたのに対し、docs-structure 側だけコンテナ単位の粗い判定になっており、`README.md`/`TEMPLATE.md` が空のまま `SKIP` と判定されて永久に補完されなかった。

```
[docs-structure]
  SKIP    docs/notes, docs/letters, docs/tasks, docs/actions（既に存在）
--- docs/ の中身 ---
（何も無い）
```

---

### 穴2: gitleaks バイナリの自己修復ロジックが迂回されていた

**試したこと**: `bin/gitleaks` をランダムバイトで上書きして「壊れた実行不可能なバイナリ」を再現してから `setup-all.js` を再実行

**結果**: 失敗

**理由**: `templates/scripts/install-gitleaks.js` 自体は「バイナリは存在するが `version` コマンドが失敗する → 再インストール」という自己修復ロジックを最初から持っていた（後述の直接呼び出しテストで確認済み）。ところが `setup-all.js` 側は `fileExists()` だけで判定して、存在すればこのスクリプトを**呼び出しすらせず** `SKIP` していたため、壊れたバイナリが放置された。

```
[gitleaks バイナリ]
  SKIP   bin/gitleaks（既にインストール済み）
```

`install-gitleaks.js` を直接呼んだ場合は正しく自己修復することを確認:
```
/bin/sh: 1: bin/gitleaks: Exec format error
⚠️  gitleaks binary exists but version check failed, reinstalling...
✅ gitleaks installed: 8.30.0
```

### アプローチ（両穴共通、成功）

**試したこと**: 「コンテナ・ラッパー側で存在チェックだけして下位の自己修復ロジックを迂回しない」という原則で修正

**結果**: 成功

**コード例（穴1: docs-structure）**:
```js
// ディレクトリ単位のゲートをやめ、常にファイル単位で差分コピーする
function copyRecursiveSkipExisting(srcDir, destDir) {
  let created = 0;
  // ...ファイルが無い時だけコピーし、コピーした件数を返す
  return created;
}

const docsExistedBefore = fileExists('docs');
const docsCreatedCount = copyRecursiveSkipExisting(docsStructureFetchDir, path.join(cwd, 'docs'));
if (docsCreatedCount === 0) {
  record('SKIP', '...不足ファイルなし');
} else if (!docsExistedBefore) {
  record('CREATE', `...（${docsCreatedCount} ファイル作成）`);
} else {
  record('MERGE', `docs/ の不足ファイルを ${docsCreatedCount} 件補完しました`);
}
```

**コード例（穴2: gitleaks バイナリ）**:
```js
const binaryExistedBefore = fileExists(binaryRelPath);
let binaryWasValidBefore = false;
if (binaryExistedBefore) {
  try {
    execSync(`"${path.join(cwd, binaryRelPath)}" version`, { stdio: 'pipe' });
    binaryWasValidBefore = true;
  } catch (e) { /* 壊れている */ }
}
if (binaryExistedBefore && binaryWasValidBefore) {
  record('SKIP', '...動作確認OK');
} else {
  // 存在チェックだけで判断せず、壊れている可能性があれば必ず install-gitleaks.js を呼ぶ
  execSync('node scripts/install-gitleaks.js', { stdio: 'inherit' });
  record(binaryExistedBefore ? 'FIXED' : 'CREATE', '...');
}
```

## 解決策

- **穴1**: `docsDirs.every(fileExists)` によるコンテナ単位のゲートを廃止し、常に `copyRecursiveSkipExisting()` でファイル単位の差分コピーを実行。実際にコピーした件数から `CREATE`/`MERGE`/`SKIP` を判定
- **穴2**: `fileExists()` だけで `SKIP` を決めず、`bin/gitleaks version` を実行して動作確認。壊れていれば `install-gitleaks.js` を必ず呼び出し、結果を `FIXED`（既存だが壊れていた）と `CREATE`（新規）で区別
- **副次的な修正**: 上記の検証中に、壊れた `package.json`（JSON パースエラー）で `npm install` が失敗した際、実際の原因（`npm error code EJSONPARSE`）ではなく「ネットワーク接続を確認してください」という決め打ちメッセージが出ることに気づいた。`runOrAbort()` ヘルパーを追加し、`degit`/`npm install` 失敗時は実際の stderr/stdout をそのまま表示するように変更

いずれも再現条件を再テストし、2回目以降の実行で正しく `SKIP` に戻ること、実際にファイル/バイナリが復旧することを確認済み。

## 学び

- **「上位のラッパーが下位スクリプトの自己修復ロジックを迂回する」は新しいバグパターンとして繰り返し得る**: 前回セッションの穴（`|| true` によるマージ時の値温存）とは異なる形だが、根っこは同じ「既存っぽく見える状態を安易に `SKIP` する」という判断ミス。`install-gitleaks.js` は元から正しい自己修復ロジックを持っていたのに、それを呼び出す側の判定が粗かったせいで無効化されていた
- **「存在確認」と「動作確認」は別物として扱う**: ファイルやバイナリが「そこにある」ことと「正しく機能する」ことは別。`simple-git-hooks.pre-commit` の値のような設定値だけでなく、バイナリやディレクトリ構造についても同じ区別が必要
- **エラーメッセージの決め打ちも一種のサイレント失敗**: 「失敗はしているが原因が分からない/誤った原因を示す」状態は、ユーザーが正しい対処に辿り着けないという意味で握りつぶしバグに近い実害がある

## 今後の改善案

- 他の execSync 呼び出し（`npx simple-git-hooks` など）でも同様のエラーメッセージ改善余地がないか、次回の見直し時に確認する
- 「コンテナ単位の存在チェックで済ませていないか」を新しいインストーラー系パターンを書くときのセルフチェック項目に加える

## 関連ドキュメント

- [docs-structure-and-securitycheck 統合インストーラー実装](./2026-07-09-00-02-00-docs-structure-and-securitycheck-installer-implementation.md)
- [setup-securecheck 既存プロジェクトへの再適用で見つかった2つの穴](./2026-07-08-00-00-01-setup-securecheck-reapply-idempotency-holes.md)

---

**最終更新**: 2026-07-09
**作成者**: AI (Claude) + 人間レビュー
