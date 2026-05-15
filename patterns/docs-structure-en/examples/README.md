# Usage Examples

This directory contains concrete usage examples of the docs-structure-en pattern.

## 📄 Example files

### [01_example-letter.md](./01_example-letter.md)
A filled-in handoff example. A sample of the document created at session end in Claude Code.

**Content:**
- User management feature development session
- Phase 1 (user list page) complete
- Phase 2 (user detail page) 70% complete
- Verification protocol, command execution rules for the next session
- Session context summary (design decisions, discussion flow, "vibe")

**Key points:**
- Specific record of what was implemented in the previous session
- Clear statement of what to do next session
- Token budget management (consider handoff at 75-85%)
- Verbalize and hand over the "vibe"

---

### [02_example-note.md](./02_example-note.md)
A filled-in dev note example. A sample for recording trial & error when solving a technical problem.

**Content:**
- REST API implementation pattern with Express
- CORS config, error handling, middleware order
- 3 approaches (2 failed, 1 succeeded)
- Learnings about correct middleware placement order

**Key points:**
- Record failed attempts too (why they failed)
- Preserve the process, not just the final solution
- Information useful when the same problem arises in the future
- Knowledge related to the user management feature in 01_example-letter.md

---

### [03_example-task.md](./03_example-task.md)
A filled-in task management example. A sample for tracking a specific work task.

**Content:**
- Task to delete API mock implementation files
- Background (cleanup after real API is complete)
- Checklist
- Completion criteria

**Key points:**
- Clearly state pre-deletion and post-deletion confirmation items
- Define completion criteria specifically
- Link to related documents (handoffs, notes)
- Task following Phase 1 and 2 completion from 01_example-letter.md

---

## 💡 How to use

### When creating a handoff

1. Refer to `patterns/docs-structure-en/templates/letters/TEMPLATE.md`
2. Check [01_example-letter.md](./01_example-letter.md) for a concrete example
3. Save as `docs/letters/YYYY-MM-DD-HH-MM-SS-title.md` in your project

### When creating a dev note

1. Refer to `patterns/docs-structure-en/templates/notes/TEMPLATE.md`
2. Check [02_example-note.md](./02_example-note.md) for a concrete example
3. Save as `docs/notes/yyyy-mm-dd-hh-mm-ss-title.md` in your project

### When creating a task

1. Refer to `patterns/docs-structure-en/templates/tasks/TEMPLATE.md`
2. Check [03_example-task.md](./03_example-task.md) for a concrete example
3. Save as `docs/tasks/yyyy-mm-dd-hh-mm-ss-title.md` in your project

---

## 🎯 Tips

### Handoff tips
- ❌ Vague: "mostly done"
- ✅ Specific: "User list page implementation complete. Detail page API connection verification remaining."
- Include commands the next session's AI can run to verify
- Verbalize the "vibe" (speed-first? quality-first?)

### Dev note tips
- Record failed attempts too (why they failed)
- Preserve the process, not just the final solution
- Keep information useful for the next time the same problem occurs
- Include concrete code examples

### Task tips
- Clearly state the background and reason (why this task is needed)
- Turn confirmation items into a checklist
- Define completion criteria specifically
- Link to related documents

---

## 🔗 Relationship between the 3 documents

In these examples, the 3 documents are loosely linked:

```
01_example-letter.md (handoff)
├─ Phase 1 & 2 implemented user management feature
│
├─> 02_example-note.md (dev note)
│   └─ Records knowledge on Express API implementation patterns
│
└─> 03_example-task.md (task)
    └─ Task to delete mock files after real API is complete
```

In real projects too, cross-referencing documents keeps context intact while organizing information.

---

**Tip**: Tell AI "Create a handoff referring to the examples in examples/" to get it in the right format.
