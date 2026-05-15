# Create Note action

Summarize the work so far into a dev note.

## 📋 Understanding check for this instruction

Before starting, present the following items as checkboxes to confirm your understanding:

- [ ] Propose a note creation plan to the user and get approval
- [ ] Base the note on docs/notes/TEMPLATE.md
- [ ] Add tags to FrontMatter
- [ ] Naming: yyyy-mm-dd-hh-mm-ss-{title}.md format
- [ ] Always use placeholders for secrets
- [ ] Consider whether splitting into smaller notes is better

Ready? Give me the go-ahead.

---

⚠️ Secrets protection rules

For information in the note:

- Always use placeholders (`YOUR_API_KEY`, etc.) for API keys, passwords, and tokens
- Never include actual secrets
- Never paste .env or config file contents as-is

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

4. Report completion
   - Report the file path of the created note
   - Present a brief content summary
