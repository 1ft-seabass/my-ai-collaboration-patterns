Let's commit the progress so far. Knowledge has accumulated in stages, so commit in stages accordingly.

## 📋 Understanding check for this instruction

Before starting, present the following items as checkboxes to confirm your understanding:

- [ ] Confirm changes with `git status` and `git diff`
- [ ] Check for secrets in the content
- [ ] Understand the existing commit style with `git log`
- [ ] Confirm AI signature, prefix, and language with the user
- [ ] Present a staged commit plan and get approval
- [ ] Commit only; do not push

Ready? Give me the go-ahead.

---

## Rules to always follow

- **Commit only; do not push** (human reviews before pushing)
- **Always use placeholders for secrets in notes, handoffs, tasks, and any committed content**
- **Never leak information protected by .gitignore**
- **Run `git diff` before committing to review the changes**

## Steps

1. Review changes
   - Run `git status` to see changed files
   - Run `git diff` to review the changes
   - Check that no secrets (API keys, passwords, tokens, etc.) are present

2. Understand the existing commit style
   - Run `git log --oneline -10` to review recent commits
   - Note message format (feat:/fix:/docs:, etc.)
   - English or other language
   - Presence of AI signature (`Co-Authored-By: Claude`)

3. Confirm commit style with the user
   - Should this repo include AI signature? [y/N]
   - What prefix? (feat/fix/docs/refactor, etc.)
   - Language for commit messages?

4. Propose development commit plan
   - Present a staged commit plan that reflects the development progression
   - Get user approval

5. Commit development work
   - Commit in stages following the approved plan
   - Use the confirmed style for the commit message
   - Always run `git diff` before each commit to review

6. Report completion
   - Briefly report what was committed
   - Confirm that no push was made
