# これは凍結スナップショットです

このディレクトリは、`setup-securecheck` パターンの **v3.0.2リリース時点**（コミット `527f556`）の内容をそのまま複製したものです。

## なぜ存在するか

`setup-securecheck` は v3.1.0 で `install.js` / `scan` / `setup-local` という Node.js 製の確定的インストーラーを追加し、README のワンショット指示もそちらを推奨動線に変更しました。しかし、Node.js が使えない環境や、生のコマンドをAIが1つずつ提示しながら進める従来型の「ウィザード形式」ワンショット指示だけを独立して使いたい場合のために、**v3.1.0より前の状態を、この先も変更されない形で参照できるようにする**目的でこのディレクトリを分離しました。

## 重要な注意

- **このディレクトリの中身は今後更新されません**（凍結）。`setup-securecheck`本体側で今後見つかる不具合修正・機能追加は、原則としてここには反映されません
- **既知のバグを含みます**。例えば `setup-securecheck.md` のPhase 3.5（`git reset HEAD~1`）とPhase 3.5.5-b（`git restore --staged`）は、プロジェクト最初のコミット前後で `fatal: could not resolve HEAD` 等により失敗することがあります（本体側の`setup-securecheck.md`では2026-09-25に修正済みですが、このスナップショットには意図的にバックポートしていません）。踏んだ場合はAIがその場で気づいて代替コマンド（`git update-ref -d HEAD`、`git rm --cached`）に読み替えてください
- 最新版・保守されている状態が必要な場合は、必ず [`../setup-securecheck/`](../setup-securecheck/) を使ってください

## 関連ドキュメント

- [setup-securecheck本体のREADME](../setup-securecheck/README.md)
- `docs/notes/`配下のv3.1.0関連ノート（`setup-securecheck-v3.1.0-*`で検索）
