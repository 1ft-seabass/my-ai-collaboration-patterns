Close this session with a handoff. Follow the steps below to create the handoff.

## 📋 Understanding check for this instruction

Before starting, present the following steps as checkboxes to confirm your understanding:

### Steps to execute
- [ ] Step 1: Review the latest 2 handoffs (identify pending/incomplete items)
- [ ] Step 2: Propose note creation plan and get approval
- [ ] Step 3: Create the note (if needed)
- [ ] Step 4: Understand the existing commit style
- [ ] Step 5: Confirm commit style with the user
- [ ] Step 6: Propose development commit plan and get approval
- [ ] Step 7: Commit the note (if needed)
- [ ] Step 8: Commit development work (if needed)
- [ ] Step 9: Gather project-specific info (startup / test method)
- [ ] Step 10: Create the handoff
- [ ] Step 11: Commit the handoff
- [ ] Step 12: Send completion notification in the specified format

### Important rules
- [ ] Always use placeholders for secrets
- [ ] Commit only; do not push
- [ ] Send completion notification in the specified format

Ready? Give me the go-ahead.

---

⚠️ Secrets protection rules

For information in this handoff:

- Always use placeholders (`YOUR_API_KEY`, etc.) for API keys, passwords, and tokens
- Never include actual secrets
- Never paste .env or config file contents as-is
- Review with `git diff` before committing
- Commit only; do not push (human reviews before pushing)

1. Review the latest 2 handoffs
   - Read the latest handoff to identify pending/incomplete items
   - Also check the one before for additional context

2. Propose note creation plan
   - Think about how to summarize this session's work in a note, and propose to the user
   - Also propose splitting into smaller notes if appropriate
   - If notes were already created during the session, propose that no new note is needed
   - Get user approval

3. Create the note
   - Read docs/notes/TEMPLATE.md to understand structure and guide
   - Naming: yyyy-mm-dd-hh-mm-ss-{title}.md
   - Add tags to FrontMatter (3-5 recommended)
   - Create according to the approved plan

4. Understand the existing commit style
   - Run `git log --oneline -10` to review recent commits
   - Note message format (feat:/fix:/docs:, etc.)
   - English or other language
   - Presence of AI signature (`Co-Authored-By: Claude`)

5. Confirm commit style with the user
   - Should this repo include AI signature? [y/N]
   - What prefix? (feat/fix/docs/refactor, etc.)
   - Language for commit messages?

6. Propose development commit plan
   - Present a staged commit plan that reflects the development progression
   - Get user approval

7. Commit the note
   - Commit following the approved plan
   - Use the confirmed style for the commit message

8. Commit development work
   - Commit in stages following the approved plan
   - Use the confirmed style for the commit message

9. Gather project-specific info for the handoff
   - Search docs/notes/ for the standard startup method for this project
   - Search docs/notes/ for the standard test method for this project
   - If found, note them for inclusion in the handoff

10. Create the handoff
    - Read docs/letters/TEMPLATE.md to understand structure and guide
    - Naming: yyyy-mm-dd-hh-mm-ss-{title}.md
    - Title: Main theme of the session (kebab-case recommended, ~30 chars max)
    - Add tags to FrontMatter (3-5 recommended)
    - Reflect previous pending/incomplete items in "Current status"
    - Include startup/test method in "Technical context" if found
    - Clearly describe information needed for the next session

11. Commit the handoff
    - Commit using the confirmed style
    - Follow the commit message format

12. Send handoff completion notification
    - After creating the handoff, always notify in exactly this format:

```
Handoff file created: docs/letters/yyyy-mm-dd-hh-mm-ss-title.md

Start the next session with the following message:

---
docs/letters/yyyy-mm-dd-hh-mm-ss-title.md is the handoff file. Please read it. Continue this session in English.

Project operation rules

- Dev notes → docs/notes/ (naming: yyyy-mm-dd-hh-mm-ss-{title}.md, read README/TEMPLATE when creating) Note: Create notes only within the session-end handoff flow
- Handoffs → docs/letters/ (this file, read README/TEMPLATE when creating) Note: Create handoffs only when the user explicitly requests it
- Commits: Follow the existing commit log (git log) — match AI signature presence, prefix (feat:/fix:/docs:), and language
- Avoid unnecessary commits. If a commit is unavoidable, always inform the user and get approval first.

Project start / restart / stop / status commands

- (start)
- (restart)
- (stop)
- (status check)

---
```

- Important: Output the complete format above (file path alone is not acceptable)
- Use relative paths from project root
- "is the handoff file. Please read it." clearly identifies it as a handoff
- "Continue this session in English." sets the language
- Including operation rules each time carries over project-specific conventions
