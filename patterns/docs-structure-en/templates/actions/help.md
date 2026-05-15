# Actions Quick Reference

**Display this help in English.**

Copy and use the commands below:

## 📋 Frequently used actions (numbered)

**`@actions/00_session_end.md`**
Full session end
- Create note → commit → create handoff → commit
- 12-step full procedure

**`@actions/01_git_push.md`**
Strict push check
- Secrets scan (API keys, tokens, passwords, etc.)
- Final check before pushing

---

## 🔧 Individual task actions

**`@actions/git_commit.md`**
Commit only (no push)
- Commit development progress

**`@actions/doc_note.md`**
Create note only
- Record knowledge and history in notes/

**`@actions/doc_letter.md`**
Create handoff only
- Record handoff for next session in letters/

**`@actions/doc_note_and_commit.md`**
Create note + commit (lightweight session end)
- Create note and commit together

---

## 🔧 Development quality (experimental)

**`@actions/dev_review.md`**
Dev review (diagnosis)
- Bird's-eye view of overall structure, listing concerns
- Report with severity and reasoning
- Does not modify code

**`@actions/dev_refactoring.md`**
Refactoring (treatment)
- Improve code in specified scope
- Preserve behavior; do not change features
- Always pass tests if they exist

**`@actions/dev_security.md`**
Security check
- Check secrets, input validation, DB, authentication/authorization, etc.
- Identify dangerous areas and suggest fix directions
- Does not modify code

**`@actions/dev_testing.md`**
Test creation (guardrail)
- Create as safety net before refactoring
- Prioritize main paths (happy path)
- Minimal but effective

---

## 🔒 Security / setup

**`@actions/check_my_security_prepare_level.md`**
Security readiness diagnosis
- Diagnose docs-structure + secretlint/gitleaks installation status
- Determine Level 0/1/2 and visualize risk
- Present improvement suggestions

---

## 💡 Usage guide

| Situation | Action to use |
|-----------|--------------|
| At project start | `@actions/check_my_security_prepare_level.md` |
| At session end | `@actions/00_session_end.md` |
| Before pushing | `@actions/01_git_push.md` |
| Mid-session commit | `@actions/git_commit.md` |
| Create note only | `@actions/doc_note.md` |
| Create handoff only | `@actions/doc_letter.md` |
| Review all code | `@actions/dev_review.md` |
| Local refactoring | `@actions/dev_refactoring.md` |
| Security check | `@actions/dev_security.md` |
| Create tests | `@actions/dev_testing.md` |

---

## ⚠️ Secrets protection (applies to all actions)

- Always use placeholders (`YOUR_API_KEY`, etc.) for API keys, passwords, and tokens
- Review with `git diff` before committing
- Push only after user approval
