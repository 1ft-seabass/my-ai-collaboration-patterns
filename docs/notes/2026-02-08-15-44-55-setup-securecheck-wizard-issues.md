# setup_securecheck ウィザード実行時の問題点と改善案

**日時**: 2026-02-08
**状況**: setup_securecheck パターンを使ったセキュリティチェック導入ウィザードの初回実行

---

## 実行結果サマリー

✅ **成功した点**:
- gitleaks のインストールと設定
- secretlint + gitleaks の二重チェック体制構築
- pre-commit フックの動作確認
- 検出・修正・完了のフロー完遂

❌ **問題が発生した点**:
1. npm install が必要な前提が抜けていた
2. npx と npm run の動作の違いで混乱
3. gitleaks.toml の --config オプションが抜けていた
4. tmp/security-setup/ を削除するタイミングが不適切
5. git 履歴スキャンの説明不足

---

## 詳細な問題点

### 1. npm install が必要な前提が抜けていた

**症状**:
- `node_modules` が存在しない状態で開始
- `npm run secret-scan` を実行しようとしたが、secretlint コマンドが見つからない
- `Error: secretlint: not found`

**原因**:
- ドキュメントは「package.json が存在する」を前提としていた
- しかし `npm install` 済みであることは前提に含まれていなかった
- Phase 0 のヘルスチェックでは secretlint のバージョンが表示されていたため、混乱を招いた

**実際の対応**:
1. `npm install` を実行
2. 140 パッケージがインストールされた
3. その後 secretlint が正常に動作

**改善案**:
- Phase 0 の前に「前提条件チェック」を追加
- `node_modules` の存在確認
- 存在しない場合は `npm install` を促す
- または Phase 0 に組み込む

---

### 2. npx と npm run の動作の違いで混乱

**症状**:
- `node tmp/security-setup/templates/scripts/security-verify.js --test-run` を実行
- ヘルスチェックは ✅ 10/10 passed
- しかし secretlint のテストスキャンで以下のエラー:
  ```
  Failed to load rule module: @secretlint/secretlint-rule-preset-recommend
  Error: Failed to load secretlint's rule module: "@secretlint/secretlint-rule-preset-recommend" is not found.
  ```

**原因**:
- `security-verify.js` 内で `npx secretlint "**/*"` を使用
- npx はグローバルキャッシュから実行され、ローカルの node_modules を参照しないことがある
- ヘルスチェックの `which secretlint` は成功していた（パスは通っていた）

**実際の対応**:
1. `npm run secret-scan` に切り替え（package.json で定義済み）
2. ローカルの secretlint が正常に動作

**改善案**:
- `security-verify.js` 内の `npx secretlint` を `./node_modules/.bin/secretlint` に変更
- または npm scripts 経由で実行するように変更
- ヘルスチェックでモジュールの読み込みまで確認する

---

### 3. gitleaks.toml の --config オプションが抜けていた

**症状**:
- `npm run secret-scan:full` を実行
- gitleaks で検出: `patterns/setup-pattern/setup_securecheck/setup_securecheck.md:528`
- `gitleaks.toml` の allowlist に追加しても検出が消えない

**原因**:
- package.json の `secret-scan:full` スクリプト:
  ```json
  "secret-scan:full": "secretlint \"**/*\" && ./bin/gitleaks detect --source . -v"
  ```
- `--config gitleaks.toml` オプションが抜けていた
- デフォルト設定でスキャンされ、allowlist が無視された

**実際の対応**:
1. 直接コマンドで `--config gitleaks.toml` を指定すると動作確認
2. package.json を修正:
   ```json
   "secret-scan:full": "secretlint \"**/*\" && ./bin/gitleaks detect --source . -v --config gitleaks.toml"
   ```

**改善案**:
- テンプレートの package.json.example を修正
- または Phase 2 のドキュメントで明記

---

### 4. tmp/security-setup/ を削除するタイミングが不適切

**症状**:
1. gitleaks で `tmp/security-setup/setup_securecheck.md` 内のサンプルコードが検出
2. ユーザーが「削除する」を選択
3. `rm -rf tmp/security-setup/` を実行
4. 後で Phase 2 で `scripts/security-verify.js` が必要になった
5. 再度 `npx degit` で取得する必要が発生

**原因**:
- ウィザードの流れとして、テンプレートファイルは最後まで必要
- しかし検出が邪魔になるタイミングで削除を提案してしまった

**実際の対応**:
1. `rm -rf tmp/security-setup/` で削除
2. git 履歴に残っていたため、検出は消えず
3. `gitleaks.toml` の allowlist に追加で対応
4. 後で再度 `npx degit` で取得

**改善案**:
- Phase 0 の開始時に `.gitignore` に `tmp/` を追加
- または gitleaks.toml のテンプレートに最初から `tmp/.*` を含める
- クリーンアップは全て完了してから最後に実行

---

### 5. git 履歴スキャンの説明不足

**症状**:
- `tmp/security-setup/` を削除
- しかし gitleaks で検出が消えない
- ユーザーが混乱

**原因**:
- gitleaks は現在のファイルだけでなく、git 履歴全体をスキャンする
- 削除しても過去のコミットに残っている
- この仕組みの説明が不足していた

**実際の対応**:
- git 履歴に残っていることを説明
- `gitleaks.toml` の allowlist で対応

**改善案**:
- Phase 1.5 で gitleaks の動作を明記
  - 「gitleaks は git 履歴全体をスキャンします」
  - 「ファイルを削除しても、過去のコミットから検出される可能性があります」
- 検出時の対応フローを最初に提示

---

## その他の気づき

### Phase 0 で 9/10 だった理由

**状況**:
- 既に secretlint, husky, lint-staged は設定済み
- gitleaks のみ未インストール
- ヘルスチェック結果: 9/10 passed

**良かった点**:
- 既存の設定を認識して、必要最小限の対応（gitleaks インストールのみ）で完了できた
- Phase 1-3 をスキップできることが明確だった

**改善案**:
- Phase 0 の結果に応じた「次のステップ」を自動提案
  - 10/10 → 完了
  - 9/10 (gitleaks のみ) → Phase 1.4 へジャンプ
  - それ以外 → Phase 1 から順に実行

---

## 改善提案まとめ

### ドキュメント (setup_securecheck.md)

1. **Phase 0 の前に「環境チェック」を追加**:
   ```bash
   # node_modules が存在するか確認
   if [ ! -d "node_modules" ]; then
     echo "⚠️  node_modules が見つかりません。npm install を実行してください。"
     exit 1
   fi
   ```

2. **Phase 1.5 で gitleaks の動作を明記**:
   - git 履歴全体をスキャンすることを説明
   - ファイル削除と検出の関係を明記

3. **tmp/ の扱いを明確化**:
   - 最初に `.gitignore` に追加するか
   - gitleaks.toml に `tmp/.*` を含めるか
   - クリーンアップは最後に実行

4. **Phase 0 の結果に応じた分岐を明確化**:
   - 10/10 → 完了
   - 9/10 (gitleaks のみ) → Phase 1.4
   - それ以外 → Phase 1 から

### テンプレートファイル

1. **security-verify.js**:
   - `npx secretlint` → `./node_modules/.bin/secretlint` に変更
   - または npm scripts 経由で実行

2. **package.json.example**:
   - `secret-scan:full` に `--config gitleaks.toml` を追加

3. **gitleaks.toml**:
   - 最初から `tmp/.*` を allowlist に含める

### ウィザードフロー

1. **環境チェック** → Phase 0 → Phase 1-4
2. **Phase 0 の結果で分岐**:
   - 10/10: 完了
   - 9/10 (gitleaks のみ): Phase 1.4 のみ実行
   - それ以外: Phase 1 から順に実行
3. **クリーンアップは最後**

---

## 次のステップ

1. この notes を元にドキュメントとテンプレートを改善
2. 初期状態に戻して再テスト
3. 改善版で再度ウィザードを実行
4. 問題がなければパターンリポジトリにフィードバック

---

## 🔴 最重要な問題: security-verify.js の判定ロジックが誤っている

**発見日時**: 2026-02-08（原状復帰時）

### 症状

Phase 0 のヘルスチェックで `9/10 passed` (gitleaks のみ ❌) と表示されたが、実際には：
- **`bin/gitleaks` は最初から存在していた**（じゃないと pre-commit が通らない）
- **Docker 環境ではグローバルインストールは消える**（だから bin/ にローカル配置する設計）
- でも **verify は ✅ と判定していた**

### 根本原因

`security-verify.js` の gitleaks チェックロジック:

```javascript
const localBinary = path.join(process.cwd(), 'bin', binaryName);

let gitleaksVersion = null;
if (fs.existsSync(localBinary)) {
  gitleaksVersion = execCommand(`"${localBinary}" version`);
} else {
  gitleaksVersion = execCommand('gitleaks version');  // ← グローバルをフォールバック
}
```

**問題点**:
1. `bin/gitleaks` が存在しなくても、グローバルの gitleaks をチェック
2. グローバルで見つかれば ✅ と表示
3. しかし **pre-commit は `bin/gitleaks` を要求**している
4. Docker 環境ではグローバルは消えるため、verify は嘘をついている

### 影響

- verify で ✅ でも、実際にコミットすると pre-commit で失敗する
- 特に Docker 環境で顕著（コンテナ再起動でグローバルが消える）
- Phase 0 で「9/10 だから Phase 1.4 だけ実行すればいい」という判断が誤りになる

### 正しい動作

verify は **pre-commit と同じ条件でチェック**すべき：
- `bin/gitleaks` の存在のみをチェック
- グローバルへのフォールバックは**してはいけない**
- 存在しない場合は ❌ と明確に表示

### 改善案

```javascript
const localBinary = path.join(process.cwd(), 'bin', binaryName);

if (fs.existsSync(localBinary)) {
  const gitleaksVersion = execCommand(`"${localBinary}" version`);
  if (gitleaksVersion) {
    checkResult(true, `gitleaks ${gitleaksVersion}`);
  } else {
    checkResult(false, 'gitleaks — bin/gitleaks が実行できません');
  }
} else {
  checkResult(false, 'gitleaks — bin/gitleaks が見つかりません（npm run gitleaks:install で導入してください）');
}
```

**フォールバックを削除**し、`bin/gitleaks` のみをチェックする。

---

## bin/ ディレクトリの扱い

**誤解**: 「bin/ は全部削除していい」
**実態**: `bin/gitleaks` は元々存在していた（.gitignore で管理外だが必須）

**`rm -rf bin/` の影響**:
- pre-commit が動かなくなる
- verify のチェックも不正確になる

**正しい理解**:
- `bin/gitleaks` は .gitignore に含まれているが、**ローカルに必須**
- 削除したら `npm run gitleaks:install` で再インストール必要

---
