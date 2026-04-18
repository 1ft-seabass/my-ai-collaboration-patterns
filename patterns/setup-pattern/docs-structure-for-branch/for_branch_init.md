ブランチ専用のドキュメント構造を初期化します。以下の手順で作業を進めてください：

## 📋 この指示書の理解チェック

作業を開始する前に、以下の手順を理解したことをチェックボックスで提示してください：

### 実行手順の理解
- [ ] 手順1: 現在のブランチ名を取得してユーザーに確認する
- [ ] 手順2: ブランチ専用ディレクトリ（notes/letters/tasks）を作成する
- [ ] 手順2.5: 公式テンプレートを npx degit で取得し、TEMPLATE.md 内のパスをブランチ専用に書き換える
- [ ] 手順3: action ファイル内の `docs/` パスをブランチ専用パスに書き換える
- [ ] 手順4: 完了を通知する

### 重要ルール
- [ ] main / master ブランチでは**即終了**する（理由を伝えて作業しない）
- [ ] 元の docs/notes/, docs/letters/, docs/tasks/ には**一切触れない**
- [ ] 各手順のコマンド結果をユーザーに報告してから次へ進む
- [ ] ユーザーの承認を得てから次の手順へ進む

理解できましたか？ゴーサインをください。

---

1. ブランチ名の取得と確認

   以下のコマンドを実行してください：

   ```bash
   git branch --show-current
   ```

   - 結果をユーザーに報告する
   - main / master の場合は警告して中断する
   - このブランチで初期化を進めてよいか確認を得る

2. ブランチ専用ディレクトリの作成

   以下のコマンドを実行してください（BRANCH は手順1で確認したブランチ名）：

   ```bash
   BRANCH=$(git branch --show-current)
   mkdir -p "docs/${BRANCH}/notes" "docs/${BRANCH}/letters" "docs/${BRANCH}/tasks"
   ```

   - 作成されたディレクトリをユーザーに報告する
   - 次へ進む承認を得る

2.5. テンプレートファイルのコピーとパス書き換え

   以下のコマンドを実行してください：

   ```bash
   BRANCH=$(git branch --show-current)
   for dir in notes letters tasks; do
     npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure/templates/${dir} "docs/${BRANCH}/${dir}" --force
   done
   ```

   続いて TEMPLATE.md 内のパスを書き換えます：

   ```bash
   node -e "
   const fs = require('fs');
   const { execSync } = require('child_process');
   const branch = execSync('git branch --show-current').toString().trim();
   ['notes', 'letters', 'tasks'].forEach(dir => {
     const f = \`docs/\${branch}/\${dir}/TEMPLATE.md\`;
     if (!fs.existsSync(f)) return;
     let c = fs.readFileSync(f, 'utf8');
     c = c.replace(/docs\/notes\//g,   \`docs/\${branch}/notes/\`);
     c = c.replace(/docs\/letters\//g, \`docs/\${branch}/letters/\`);
     c = c.replace(/docs\/tasks\//g,   \`docs/\${branch}/tasks/\`);
     fs.writeFileSync(f, c);
     console.log('Updated: ' + f);
   });
   "
   ```

   - 取得および書き換えたファイルの一覧をユーザーに報告する
   - 次へ進む承認を得る

3. action ファイルのパス書き換え

   以下のコマンドを実行してください：

   ```bash
   node -e "
   const fs = require('fs');
   const { execSync } = require('child_process');
   const branch = execSync('git branch --show-current').toString().trim();
   const files = [
     'docs/actions/00_session_end.md',
     'docs/actions/doc_note.md',
     'docs/actions/doc_letter.md',
     'docs/actions/doc_note_and_commit.md',
     'docs/actions/check_my_security_prepare_level.md',
   ];
   files.forEach(f => {
     if (!fs.existsSync(f)) return;
     let c = fs.readFileSync(f, 'utf8');
     c = c.replace(/docs\/notes\//g,   'docs/' + branch + '/notes/');
     c = c.replace(/docs\/letters\//g, 'docs/' + branch + '/letters/');
     c = c.replace(/docs\/tasks\//g,   'docs/' + branch + '/tasks/');
     fs.writeFileSync(f, c);
     console.log('Updated: ' + f);
   });
   console.log('Branch:', branch);
   "
   ```

   - 書き換えたファイルの一覧をユーザーに報告する
   - 次へ進む承認を得る

4. 完了通知

   以下のフォーマットで完了を通知してください：

   ```
   ブランチ専用ドキュメント構造を初期化しました: docs/{branch-name}/

   作成したディレクトリ:
   - docs/{branch-name}/notes/
   - docs/{branch-name}/letters/
   - docs/{branch-name}/tasks/

   取得・書き換えしたテンプレート:
   - docs/{branch-name}/notes/README.md
   - docs/{branch-name}/notes/TEMPLATE.md（パス書き換え済み）
   - docs/{branch-name}/letters/README.md
   - docs/{branch-name}/letters/TEMPLATE.md（パス書き換え済み）
   - docs/{branch-name}/tasks/README.md
   - docs/{branch-name}/tasks/TEMPLATE.md（パス書き換え済み）

   書き換えた action ファイル:
   - docs/actions/00_session_end.md
   - docs/actions/doc_note.md
   - docs/actions/doc_letter.md
   - docs/actions/doc_note_and_commit.md
   - docs/actions/check_my_security_prepare_level.md（存在する場合）

   以降はそのまま @docs/actions/ を使ってください。
   ノート・申し送りは docs/{branch-name}/ 以下に作成されます。

   元の docs/notes/, docs/letters/, docs/tasks/ はそのまま残っています（変更していません）。
   ```
