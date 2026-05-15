---
tags: []
---

# Title — Dev Note

<!-- ============================================================
  Template usage guide (do not include in actual notes)
  ============================================================ -->

## 📖 Template usage guide

### Role of this directory
Records **development process details** such as trial & error, technical research, and debug logs during development.

### Naming convention
```
docs/notes/yyyy-mm-dd-hh-mm-ss-{title}.md
```

- **yyyy-mm-dd-hh-mm-ss**: Creation timestamp (e.g., 2026-01-31-14-25-30)
- **title**: Concise title describing the content (kebab-case recommended, ~30 chars max)
- Example: `2026-01-31-14-25-30-api-authentication-debug.md`

### FrontMatter
```yaml
---
tags: [api, security, debug]
---
```

- **tags**: 3-5 recommended (technical keywords, topics, pattern names, etc.)
- Match existing note tags for consistency
- Useful for future searchability (effective when you have 250/1000 notes)

### When to create
- Want to record bug-fix trial & error
- Want to summarize technical research results
- Want to preserve the reason behind an implementation choice
- Want to record failed attempts alongside successes

### Search
```bash
# Search by tag
grep -r "tags:.*api" docs/notes/

# Search by title
ls docs/notes/ | grep authentication

# Search by content
grep -r "root cause" docs/notes/
```

### Secrets protection rules
- Always use placeholders (`YOUR_API_KEY`, etc.) for API keys, passwords, and tokens
- Never include actual secrets
- Never paste .env or config file contents as-is

---

<!-- ============================================================
  Actual template content starts here
  ============================================================ -->

> **⚠️ Secrets protection rules**
>
> For information recorded in this note:
> - Always use placeholders (`YOUR_API_KEY`, etc.) for API keys, passwords, and tokens
> - Never include actual secrets
> - Never paste .env or config file contents as-is

**Created**: YYYY-MM-DD
**Related task**: [Issue number or task name]

## Problem
What was the problem, and why did this investigation or implementation become necessary?

## Trial & error

### Approach A
**Tried**: [description]

**Result**: Failed

**Reason**: [why it failed]

---

### Approach B
**Tried**: [description]

**Result**: Failed

**Reason**: [why it failed]

---

### Approach C (success)
**Tried**: [description]

**Result**: Success

**Code example**:
```
[implementation code]
```

## Solution
Details of the final implementation.

**Location**: `path/to/file:line`

**Key points**:
1. Point 1
2. Point 2
3. Point 3

## Learnings
Knowledge gained from this experience.

- Learning 1: [description]
- Learning 2: [description]
- Learning 3: [description]

## Future improvements
- Improvement 1
- Improvement 2

## Related documents
- [Related dev note](./yyyy-mm-dd-hh-mm-ss-related.md)
- [Related ADR](../architecture/decisions/yyyy-mm-dd-hh-mm-ss-related.md)
- [Related handoff](../letters/yyyy-mm-dd-hh-mm-ss-title.md)

---

**Last updated**: YYYY-MM-DD
**Author**: [name or AI]
