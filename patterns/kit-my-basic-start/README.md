# kit-my-basic-start - docs-structure + setup-securecheck 導入の接点

`docs-structure`と`setup-securecheck`を、この順序で導入するための接点（きっかけ）です。

## 📦 このkitについて

このkitは自分の`templates/`や`install.js`を持ちません。持っているのはこの`README.md`（順序と、パターンをまたぐ1つの待ちルール）だけです。

各パターン内部の判断ポイント・確認事項・締めの案内は、それぞれのワンショット指示（[docs-structure](../docs-structure/)・[setup-securecheck](../setup-pattern/setup-securecheck/quickstart.md)）にそのまま従います。ここで複製すると、2箇所に同じ内容を持つことになり、片方だけ更新されて食い違う事故につながるためです（[setup-pattern配下の統合インストーラー削除の経緯](../../docs/notes/2026-09-27-21-10-03-setup-pattern-mcp-server-and-securitycheck-removal.md)で実際に起きた問題と同じ構造）。

このkitが新規に持つルールは1つだけです: **1つのパターンが完了しても、ノート＋コミットの完了報告を人間から受け取るまで、次のパターンに進まない**。これは各パターン単体では持ちえない、2パターンをまたぐ順序そのものだからです。

## 🚀 ワンショット指示（コピペ用）

> **🤖 AIへのワンショット指示（コピペ用）**
>
> ```
> https://github.com/1ft-seabass/my-ai-collaboration-patterns/patterns/kit-my-basic-start
> このkitを使って、docs-structure → setup-securecheck の順で導入したいです。
>
> 1. まず docs-structure を導入してください。
>    https://github.com/1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure
>    のワンショット指示（README.md）に従って進めてください。
>
>    完了したら、今回の導入経緯を docs/notes/ にノート化し、コミットすることを
>    私に提案してください。私が「ノート＋コミット完了」と伝えるまで、
>    次のステップには進まないでください。
>
> 2. 私からの完了報告を受けてから、setup-securecheck を導入してください。
>    https://github.com/1ft-seabass/my-ai-collaboration-patterns/patterns/setup-pattern/setup-securecheck
>    の quickstart.md に従って進めてください（判断ポイント・締めの案内も quickstart.md の指示通りに）。
>
> 3. 両方完了したら、導入が完了したことを報告してください。
> ```

## 🔗 関連パターン

- [docs-structure](../docs-structure/) - ドキュメント構造（1番目に導入）
- [setup-securecheck](../setup-pattern/setup-securecheck/) - セキュリティチェック（2番目に導入。判断ポイントは`quickstart.md`参照）

## 📝 ライセンス

MIT License - 自由に使用・改変・配布できます
