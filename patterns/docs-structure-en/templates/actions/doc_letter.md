Create a handoff for the next session.

## 📋 Understanding check for this instruction

Before starting, present the following items as checkboxes to confirm your understanding:

- [ ] Review the latest 2 handoffs and identify pending/incomplete items
- [ ] Search docs/notes/ for startup method and test method
- [ ] Base the handoff on docs/letters/TEMPLATE.md
- [ ] Add tags to FrontMatter
- [ ] Filename: `yyyy-mm-dd-hh-mm-ss-{title}.md` (current time + title)
- [ ] Always use placeholders for secrets
- [ ] Send completion notification in the specified format

Ready? Give me the go-ahead.

---

⚠️ Secrets protection rules

For information in this handoff:

- Always use placeholders (`YOUR_API_KEY`, etc.) for API keys, passwords, and tokens
- Never include actual secrets
- Never paste .env or config file contents as-is

## Steps

1. Review the latest 2 handoffs
   - Read the latest handoff to identify pending/incomplete items
   - Also check the one before for additional context

2. Gather project-specific info
   - Search docs/notes/ for the standard startup method for this project
   - Search docs/notes/ for the standard test method for this project
   - If found, note them for inclusion in the handoff

3. Create the handoff
   - Read docs/letters/TEMPLATE.md to understand structure and guide
   - Naming: yyyy-mm-dd-hh-mm-ss-{title}.md
   - Title: Main theme of the session (kebab-case recommended, ~30 chars max)
   - Add tags to FrontMatter (3-5 recommended)
   - Reflect previous pending/incomplete items in "Current status"
   - Include startup/test method in "Technical context" if found
   - Clearly describe information needed for the next session
   - Always use placeholders for secrets

4. Send handoff completion notification
   - After creating the handoff, always notify in exactly this format:

```
Handoff file created: docs/letters/yyyy-mm-dd-hh-mm-ss-title.md

Start the next session with the following message:

---
docs/letters/yyyy-mm-dd-hh-mm-ss-title.md in English.

Project operation rules

- Dev notes → docs/notes/ (naming: yyyy-mm-dd-hh-mm-ss-{title}.md, read README/TEMPLATE when creating) Note: Create notes only within the session-end handoff flow
- Handoffs → docs/letters/ (this file, read README/TEMPLATE when creating) Note: Create handoffs only when the user explicitly requests it
- Commits: If this repo is public, omit Claude traces (signature, emoji); if private, Claude traces are OK
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
- Including "in English" sets the language
- Including operation rules each time carries over project-specific conventions
