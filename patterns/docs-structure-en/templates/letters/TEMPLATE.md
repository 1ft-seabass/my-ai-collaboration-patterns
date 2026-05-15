---
tags: []
---

# Session Handoff (yyyy-mm-dd-hh-mm-ss-{title})

<!-- ============================================================
  Template usage guide (do not include in actual handoffs)
  ============================================================ -->

## 📖 Template usage guide

### Role of this directory
Records information to hand off to the next AI at session end (completed items, incomplete items, context, notes, etc.).

### Naming convention
```
docs/letters/yyyy-mm-dd-hh-mm-ss-{title}.md
```

- **yyyy-mm-dd-hh-mm-ss**: Creation timestamp (e.g., 2026-02-01-07-34-02)
- **title**: Main theme of the session (kebab-case recommended, ~30 chars max)
- Example: `2026-02-01-07-34-02-phase2-implementation-complete.md`

### FrontMatter
```yaml
---
tags: [session-handoff, phase2, refactoring]
---
```

- **tags**: 3-5 recommended (session theme, target feature, phase, etc.)
- Match existing handoff tags for consistency

### When to create
- Token budget exceeds 75-85%
- Session has been long
- Important decisions were made
- Context is needed in the next session

### Search
```bash
# Search by tag
grep -r "tags:.*phase2" docs/letters/

# Search by title
ls docs/letters/ | grep implementation

# Search by content
grep -r "incomplete" docs/letters/
```

### Secrets protection rules
- Always use placeholders (`YOUR_API_KEY`, etc.) for API keys, passwords, and tokens
- Never include actual secrets
- Never paste .env or config file contents as-is
- Review with `git diff` before committing
- Commit only; do not push (human reviews before pushing)

---

<!-- ============================================================
  Actual template content starts here
  ============================================================ -->

> **⚠️ Secrets protection rules**
>
> For information recorded in this handoff:
> - Always use placeholders (`YOUR_API_KEY`, etc.) for API keys, passwords, and tokens
> - Never include actual secrets
> - Never paste .env or config file contents as-is
> - Review with `git diff` before committing
> - Commit only; do not push (human reviews before pushing)

## 🔔 Pre-compaction checklist

### Token budget guide
Consider creating a handoff when the token budget exceeds **75-85%**.

- **>75%**: Start considering with room to spare
- **>85%**: Create a handoff promptly
- **100%**: Auto-compact fires — record before context is lost!

> 💡 **How to check token usage**
> Refer to `Token usage: X/Y; Z remaining` shown during the conversation.
> Example: Claude Code budget is 200,000 tokens.

### Confirm what to record
- [ ] Recorded important decisions made in this session?
- [ ] Recorded the discussion flow and reasoning?
- [ ] Verbalized the "context" and "vibe" needed for the next session?
- [ ] Stated the "why" behind technical decisions?
- [ ] Added new learnings to the notes section?

---

## 🔍 Verification protocol at next session start

**To the next AI: Always execute the following at session start**

### 1. Verify the completion state from the previous session
Run the "verification commands" below and confirm that "completed" items match reality.

### 2. Report verification results to the human
- ✅ **All passed**: "Confirmed previous session state. Starting from [next Phase/task]."
- ⚠️ **Failures found**: "[Phase/task name] was incomplete (reason: [error]). Resuming from [location]."

### 3. Proceed based on reality
- "Completed" in the handoff is a reference, not a guarantee
- Verification results are the truth

---

## 🔧 Command execution rules

**To the next AI: Always confirm before running commands**

### Principle: Find the project's standard execution method
Check in this **order** before deciding:

1. `package.json` `scripts` section (Node.js)
2. `Makefile` targets (`make dev`, `make start`, etc.)
3. `docker-compose.yml` presence (Docker)
4. `README.md` Getting Started / Development section
5. `pyproject.toml` / `Cargo.toml`, etc. (other languages)

### Prohibited
- ❌ Starting the server without asking
- ❌ Direct execution like `node src/index.js` (when scripts exist)
- ❌ Running builds or DB operations without approval

### Recommended procedure
```bash
# 1. Check available startup methods
ls package.json Makefile docker-compose.yml 2>/dev/null

# 2. Review the found file
# 3. Propose to the human: "Shall I run npm run dev?"
```

**Reason**: Each project has a different standard startup method.

---

## Current status (by Phase / task)

### Phase X: [Phase name / task name]
**Status**: ✅ Complete / ⚠️ Partial / ❌ Not started

**Completed:**
- ✅ [Implemented feature / fixed item]
- ✅ [Tested item]

**Incomplete:**
- ⚠️ [Not yet tested]
- ⚠️ [Remaining issue]

**Verification commands** (AI runs at next session):
```bash
# Basic operation check
curl http://localhost:3000/api/endpoint

# Test code (if available)
npm test -- test-name

# Other verification commands
[command]
```

**Fallback if verification fails:**
- If [error case 1] → [action / where to resume]
- If [error case 2] → [action / where to resume]

---

## Next steps
1. Top priority: XXX (reason: ...)
2. Then: YYY
3. After that: ZZZ

## Notes
- ⚠️ XXX does not work (reason: ...)
- ⚠️ Changing YYY also requires updating ZZZ
- ⚠️ [Important constraint or note]

## Technical context
- Stack: [framework] v[version]
- Key files: `path/to/file`
- Related docs: [link]

---

## Session context summary

### Key design decisions
- **Decision**: [what was decided]
  - Reason: [why this choice]
  - Impact: [what it affects]

### Discussion flow
1. **Initial problem**: What issue started this session
2. **Approaches considered**: What options were explored
3. **Final decision**: What was chosen and why
4. **Remaining issues**: What is unresolved

### "Vibe" to carry over to the next session
- **Project priorities**: What is valued most
- **Anti-patterns to avoid**: Lessons from past failures
- **Values**: Balance of code quality, speed, and maintainability
- **Current development phase**: Prototype / stabilization / optimization

---

**Created**: yyyy-mm-dd hh:mm:ss
**Author**: [name or AI]
