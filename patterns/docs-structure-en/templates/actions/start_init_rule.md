# Session Operating Rule Init Action

Confirm and share this project's operating rules at the start of a session. Exists to prevent mistakes that happen when work starts before any rules have been shared.

## Steps

1. Check this repo's commit style with `git log --oneline -10`
   - Commit message prefix (feat:/fix:/docs:, etc.)
   - Japanese or English
   - Whether AI signatures are used (`Co-Authored-By: Claude` present or not)

2. Based on what you found, present the following operating rules as-is (fill in the commit-rule values from step 1):

```
Project session operating rules

- Dev notes → docs/notes/ (naming: yyyy-mm-dd-hh-mm-ss-{title}.md, read README/TEMPLATE when creating) Note: Create notes only when the user explicitly requests it
- Handoffs → docs/letters/ (this file, read README/TEMPLATE when creating) Note: Create handoffs only when the user explicitly requests it
- Commits: Follow the existing commit log (git log) — match AI signature presence, prefix (feat:/fix:/docs:), and language
- Avoid unnecessary commits and keep working. When a commit becomes unavoidable, always tell the user the planned commit and get explicit approval first.
- No push — commit only (a human pushes after review)

Here are the commit rules.

Prefix: {value confirmed in step 1}
Language: {value confirmed in step 1}
AI signature: {value confirmed in step 1}
```

3. Ask the user to confirm the content (let them correct anything that's off)
4. Follow these rules for the rest of the session (no need to re-invoke this action each time)

## When to use

- At the start of a new session, before operating rules have been shared yet
- If `00_session_end.md` closes a session, this opens one
