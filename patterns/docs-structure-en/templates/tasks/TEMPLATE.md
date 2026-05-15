---
tags: []
status: open
priority: medium
---

# TASK: Title

<!-- ============================================================
  Template usage guide (do not include in actual tasks)
  ============================================================ -->

## 📖 Template usage guide

### Role of this directory
Manages tasks that continue across sessions and long-term TODOs.

### Naming convention
```
docs/tasks/yyyy-mm-dd-hh-mm-ss-{title}.md
```

- **yyyy-mm-dd-hh-mm-ss**: Creation timestamp (e.g., 2026-02-01-14-30-00)
- **title**: Title describing the task content (kebab-case recommended, ~30 chars max)
- Example: `2026-02-01-14-30-00-api-migration-task.md`

### FrontMatter
```yaml
---
tags: [api, migration, backend]
status: open
priority: high
---
```

- **tags**: 3-5 recommended (technical keywords, target feature, etc.)
- **status**: open / in-progress / completed / cancelled
- **priority**: high / medium / low

### When to create
- There is a task that spans sessions
- Want to record a long-term TODO
- Want to track progress in checklist form

### Search
```bash
# Search by tag
grep -r "tags:.*api" docs/tasks/

# Search by status
grep -r "status: open" docs/tasks/

# Search by title
ls docs/tasks/ | grep migration
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
> For information recorded in this task:
> - Always use placeholders (`YOUR_API_KEY`, etc.) for API keys, passwords, and tokens
> - Never include actual secrets
> - Never paste .env or config file contents as-is

**Created**: YYYY-MM-DD
**Status**: Open
**Priority**: High / Medium / Low
**Estimated time**: Xh

## Overview

What this task achieves (1-2 sentences).

## Background / Reason

Why this task is necessary.

## Checklist

- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

## Related documents

<!-- Fill in based on how the task originated -->

<!-- Pattern 1: From a handoff -->
- [Handoff](../letters/yyyy-mm-dd-hh-mm-ss-title.md) - Context for how this task was created

<!-- Pattern 2: From a note -->
- [Note](../notes/yyyy-mm-dd-hh-mm-ss-title.md) - Source idea for this task

<!-- Pattern 3: Came up spontaneously -->
- None (spontaneous idea)

<!-- Pattern 4: Related technical note -->
- [Note](../notes/yyyy-mm-dd-hh-mm-ss-title.md) - Related technical information

## Work log

- YYYY-MM-DD HH:MM: Task created
- YYYY-MM-DD HH:MM: Work started
- YYYY-MM-DD HH:MM: [Progress note]

## Completion criteria

What needs to be done for this to be considered complete.

- [ ] Criterion 1
- [ ] Criterion 2

---

## On completion

**Completed**: YYYY-MM-DD
**Actual time**: Xh
**Deliverables**: Commit hash or link

**Learnings**: Knowledge and insights gained from this task.
