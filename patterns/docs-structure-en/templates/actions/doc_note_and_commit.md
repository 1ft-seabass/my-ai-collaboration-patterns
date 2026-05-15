Summarize the work so far into a dev note and commit it.

## 📋 Understanding check for this instruction

Before starting, present the following items as checkboxes to confirm your understanding:

- [ ] Propose a note creation plan to the user and get approval
- [ ] Base the note on docs/notes/TEMPLATE.md
- [ ] Add tags to FrontMatter
- [ ] Naming: yyyy-mm-dd-hh-mm-ss-{title}.md format
- [ ] Always use placeholders for secrets
- [ ] Confirm changes with `git status` and `git diff`
- [ ] Understand the existing commit style with `git log`
- [ ] Confirm AI signature, prefix, and language with the user
- [ ] Present a staged commit plan and get approval
- [ ] Commit only; do not push

Ready? Give me the go-ahead.

---

⚠️ Secrets protection rules

For information in the note and commits:

- Always use placeholders (`YOUR_API_KEY`, etc.) for API keys, passwords, and tokens
- Never include actual secrets
- Never paste .env or config file contents as-is
- Review with `git diff` before committing
- Commit only; do not push (human reviews before pushing)

## Steps

1. Propose note creation plan
   - Think about how to summarize this session's work in a note, and propose to the user
   - Also propose splitting into smaller notes if appropriate
   - If notes were already created during the session, propose that no new note is needed
   - Get user approval

2. Review the template
   - Read docs/notes/TEMPLATE.md to understand structure and guide
   - Naming: yyyy-mm-dd-hh-mm-ss-{title}.md
   - Add tags to FrontMatter (3-5 recommended)

3. Create the note
   - Create according to the approved plan
   - Always use placeholders for secrets
   - Add FrontMatter at the top

4. Review changes
   - Run `git status` to see changed files
   - Run `git diff` to review the changes
   - Check that no secrets are present

5. Understand the existing commit style
   - Run `git log --oneline -10` to review recent commits
   - Note message format (feat:/fix:/docs:, etc.)
   - English or other language
   - Presence of AI signature (`Co-Authored-By: Claude`)

6. Confirm commit style with the user
   - Should this repo include AI signature? [y/N]
   - What prefix? (feat/fix/docs/refactor, etc.)
   - Language for commit messages?

7. Propose and approve commit plan
   - Present a staged plan to commit the note and development work
   - Get user approval

8. Commit the note
   - Commit the created note
   - Use the confirmed style for the commit message
   - Always run `git diff` before committing

9. Commit development work (if needed)
   - Commit in stages following the approved plan
   - Use the confirmed style for the commit message
   - Always run `git diff` before each commit

10. Report completion
    - Briefly report what was committed
    - Confirm that no push was made
