# Node.js前提でのクイックスタート（AIが読むための手順書）

**このドキュメントはAIが読み、`install.js`/`scan`/`setup-local`という確定的なNode.jsスクリプトを使って導入を進めるための手順書です。**

生の`npm install`/`mv`/`echo`等をAIが1つずつ提示する従来のウィザード形式（`setup-securecheck.md`）と比べ、確定的な部分（ファイル配置・npm依存導入・gitleaksダウンロード・フック配線・ネガティブテスト・フェイルクローズ確認・最終verify）はコードが実行します。ただし**判断そのものが必要な箇所（後述の2箇所）は無くなっていません**。AIは判断ポイントでは必ず立ち止まってユーザーの返信を待ってください。

---

## 🤖 AI への重要な指示

### 開始時に必ず実行すること

以下のチェックボックスをそのまま表示してから開始してください：

```
これから以下の流れで導入します：

□ install.js でファイル配置・npm依存・gitleaksを導入
□ scan --all で検出結果を確認 → 【判断】本物の漏洩かプレースホルダーかを判断
□ package.json に scripts/simple-git-hooks 設定をマージ → 【判断】既存設定との整合を確認
□ setup-local でフック配線・ネガティブテスト・最終確認まで実行

重要なルール：
- 1手順ずつ実行し、結果を報告してから次へ進む
- 【判断】と書かれた2箇所は、必ずユーザーの返信を待ってから進める
- ❌ 悪い例: 結果を報告せず複数手順を連続実行する
- ❌ 悪い例: 判断ポイントでユーザーに確認せず自分で決めて進める

進めてよろしいですか？「はい」と返信していただければ開始します。
```

ユーザーが「はい」「進めて」等と返信するまで、開始しないでください。

---

## 手順

### 1. 取得とファイル配置（確定的）

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck ./tmp/security-setup
node ./tmp/security-setup/install.js
```

`install.js`の出力（配置先の絶対パス、作成/スキップ件数、gitleaksのバージョン）をそのまま報告してください（要約・言い換えはせず、出力を中継する）。既存にこのパターンが導入済みでも安全です（既存ファイルは上書きせず、不足分だけ補います）。

### 2. スキャン（確定的な呼び出し＋【判断】）

```bash
node .security-check/cli.js scan --all
```

検出結果をそのまま報告してください。

**【判断】** 検出があった場合、本物の漏洩かプレースホルダーか・false positiveかをユーザーと一緒に判断してください。ユーザーの返信を待ってから次へ進んでください。

### 3. package.json のマージ（判断）

`tmp/security-setup/templates/package.json.example` の内容を、既存の `package.json` にマージする案を提示してください（上書きではなく追加）。

> ⚠️ **`simple-git-hooks` キーが既に存在する場合**: 値をマージで温存せず、`pre-commit` の値が `node .security-check/cli.js pre-commit` と実質一致するか確認してください。異なっていれば修正を提案してください。

**【判断】** マージ内容をユーザーに提示し、承認を得てから実際に編集してください。

### 4. setup-local（確定的）

```bash
node .security-check/cli.js setup-local
```

出力をそのまま報告してください。フック配線・`.gitignore`更新・ネガティブテスト・フェイルクローズ確認・最終`verify --test-run`まで、このコマンド1つで実行されます。`15/15 passed`が出れば完了です。

### 5. 後片付け

```bash
rm -rf tmp/security-setup
```

---

## より詳しく知りたい場合

各手順の背景（なぜこの順序か、フェイルクローズとは何か等）は `setup-securecheck.md` を参照してください。中身（`.security-check/`一式）は同じものです。
