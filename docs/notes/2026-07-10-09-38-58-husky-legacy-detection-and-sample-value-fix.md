---
tags: [setup-securecheck, husky, migration, version-detect, false-positive]
---

# husky先行検知の追加発見と対応、既知サンプル値の抑制 - 開発記録

> **⚠️ 機密情報保護ルール**
>
> このノートに記載する情報について:
> - API キー・パスワード・トークンは必ずプレースホルダー(`YOUR_API_KEY`等)で記載
> - 実際の機密情報は絶対に含めない
> - .env や設定ファイルの内容をそのまま転記しない

**作成日**: 2026-07-10
**関連タスク**: A6実装の議論中にユーザーから提起された別件の質問への対応

## 背景1: husky先行検知の穴

A6（既存導入プロジェクト向けの安全な再適用）を議論中、ユーザーから「マイグレーションに関連するが、huskyの旧式検知で逃げれるようになっているか」という質問があった。

調査したところ、`patterns/setup-pattern/setup-securecheck/version-detect/scripts/detect-version.js`という、husky/lint-staged/`.husky/`ディレクトリの有無からv1構成を正しく検出する専用スクリプトが**既に存在していた**。しかしこれはREADMEの「v1からの移行」セクション専用の別ルートであり、README冒頭の「新規/既存プロジェクト**共通**」のワンショット指示（最も選ばれやすい入口）からは一切参照されていなかった。

さらに、共通ルートが直接呼ぶ`security-verify.js`自体には**husky検知が一切無かった**。つまり、v1(husky)のまま残っているプロジェクトに対して「共通」ワンショット指示を使うと、Phase 0は`.git/hooks/pre-commit`や`simple-git-hooks`設定が❌になるだけで「v1だから移行ガイドを使うべき」という判定に至らず、AIがそのまま新規導入フローに進んで既存のhusky設定の上にsimple-git-hooksを重ねてしまうリスクがあった。

### 対応

`detect-version.js`と同一の判定ロジック（husky/lint-staged がdevDependenciesにある、または`.husky/`ディレクトリが存在）を`security-verify.js`（テンプレート・リポジトリ両方）の先頭に統合。該当時は12項目のスコアには含めず、警告としてヘルスチェック結果の冒頭に表示し、`MIGRATION_GUIDE_v1_to_v2.0.1.md`への参照を促すようにした。あわせて`setup-securecheck.md`のPhase 0にも同警告への対応手順を明記した。

**実装場所**:
- `patterns/setup-pattern/setup-securecheck/templates/scripts/security-verify.js`
- `scripts/security-verify.js`
- `patterns/setup-pattern/setup-securecheck/setup-securecheck.md`

### 検証

疑似的にhusky/lint-staged/`.husky/`を持つ環境を用意し、警告が正しく発火することを確認した。このリポジトリ自身（husky不使用）では警告が出ないことも確認済み。

## 背景2: 既知サンプル値の抑制

前セッションの申し送りで「未解決の新規発見・要判断」として残っていた項目。`setup-securecheck.md`「パターンB: 値を明確なダミーに変更」のBefore例（`API_KEY=sk-1234567890abcdef`、gitleaks:allow secretlint-disable-line）が、gitleaks検出ルール0件バグの修正（前セッション）により、`generic-api-key`ルールで実際に検出されるようになっていた。

### 対応

このセッションで確立した`gitleaks:allow`/`secretlint-disable-line`の個別許可コメントを同じ行に追加し抑制した。

```
API_KEY=sk-1234567890abcdef  # gitleaks:allow secretlint-disable-line
```

### 検証と既知の制約

- `gitleaks dir`（作業ツリースキャン）では検出されなくなったことを確認
- ただし`security:verify:testrun`（git履歴全体スキャン）では、リネーム前の古いコミット（2026-02-08、旧パス`setup_securecheck.md`）に残る同一のダミー値が引き続き検出される。過去のコミット内容は抑制コメントを今つけても変わらないため。履歴書き換え（`git filter-branch`/BFG、force-push必須の破壊的操作）までは実施せず、「既知の履歴由来の誤検知」として残すことをユーザーと合意した

## 学び

- 「専用の検知スクリプトが存在する」ことと「そのスクリプトが実際に使われる経路に組み込まれている」ことは別物。`detect-version.js`は正しく実装されていたが、メインの共通ワンショット指示からは孤立していた
- 誤検知の抑制は「現在のファイル」と「git履歴」で効果範囲が異なる。inlineコメントは今後のスキャンには効くが、既に確定した過去のコミット内容には遡って効かない

## 関連ドキュメント

- [設計会話: A6方針転換とネガティブテスト検証プロトコル強化](./2026-07-10-05-27-29-negative-test-verification-design.md)
- [A6実装: 既存導入プロジェクト向けの安全な再適用](./2026-07-10-09-38-51-a6-existing-project-safe-reapply-implementation.md)
- [setup-securecheck version-detect ウィザードの追加](./2026-06-11-00-00-00-setup-securecheck-version-detect.md)

---

**最終更新**: 2026-07-10
**作成者**: AI (Claude) + 人間レビュー
