# Document Structure for AI Collaboration — Supplementary Guide

> **Audience**: AI assistant (read after degit)
> **Purpose**: Understand the intent behind the placed document structure

## 📖 About this guide

This guide is supplementary material to read after placing the `docs/` structure via degit.
Understanding the philosophy and intent behind the structure helps you use it more effectively.

## 🏗️ Placed structure

```
docs/
├── README.md                           # Document index
├── actions/                            # Task automation instructions
│   ├── README.md
│   ├── 00_session_end.md
│   ├── 01_git_push.md
│   └── (other action files)
├── letters/                           # Session handoffs
│   ├── README.md
│   └── TEMPLATE.md
├── notes/                             # Dev notes
│   ├── README.md
│   └── TEMPLATE.md
└── tasks/                             # Task management
    ├── README.md
    └── TEMPLATE.md
```

## 🎯 Core concepts

### 1. actions — Task automation instructions

Save repeated tasks as instruction files and call them with `@actions/filename.md` to streamline execution.

**Provided actions:**
- `00_session_end.md` - Full session end (create note → commit → create handoff)
- `01_git_push.md` - Strict push check (secrets scan)
- `git_commit.md` - Commit only
- `doc_note.md` - Create note only
- `doc_letter.md` - Create handoff only

**Effect:**
- Token reduction: ~70% (measured)
- Time savings: No back-and-forth confirmation
- Consistency: Same quality every time

### 2. Three document types

| Type | Purpose | When to create | Naming |
|------|---------|----------------|--------|
| **letters** (handoffs) | Session handoff | At session end | `yyyy-mm-dd-hh-mm-ss-{title}.md` |
| **notes** (dev notes) | Trial & error records | After solving hard problems | `yyyy-mm-dd-hh-mm-ss-{title}.md` |
| **tasks** | Task management | For cross-session tasks | `yyyy-mm-dd-hh-mm-ss-{title}.md` |
| **ADR** (decisions) | Decision records | At important architecture choices | `yyyy-mm-dd-hh-mm-ss-{title}.md` |

### 3. README-driven navigation

By placing README.md in every directory:
- AI can find target documents without getting lost
- Structure becomes self-explanatory
- Clear placement for new documents

### 4. One-file-one-insight principle

- **1 file = 1 insight** (50-150 lines as a guide)
- Keep independent (understandable on its own)
- MECE (mutually exclusive, collectively exhaustive)

## 🚀 Getting started

### At session start

```
"Read docs/README.md and check the latest handoff."
```

Or use actions:

```
@actions/simple_start_from_latest_letter.md
```

### At session end

```
"Record today's work as a handoff in docs/letters/."
```

Or use actions:

```
@actions/doc_letter.md
```

### After solving a technical problem

```
"Record this trial and error in docs/notes/."
```

### After making an important decision

```
"Record this decision as an ADR in docs/architecture/decisions/."
```

## 🔧 Customization

Customize to fit this project's specific needs:

### Adding directories

```bash
# Example: Add API documentation
mkdir -p docs/api
echo "# API Documentation" > docs/api/README.md
```

### Customizing README and TEMPLATE files

Rewrite each README.md and TEMPLATE.md with project-specific content:

- `docs/README.md` - Adjust project name and links
- `letters/TEMPLATE.md` - Add project-specific sections
- `notes/TEMPLATE.md` - Adjust project-specific format
- Each directory's `README.md` - Update with project-specific descriptions

## ✅ Post-placement checklist

After placing, confirm:

- [ ] `docs/` directory is created
- [ ] All subdirectories have `README.md`
- [ ] `actions/` has the expected action files
- [ ] `letters/TEMPLATE.md` and `notes/TEMPLATE.md` exist
- [ ] Updated each README.md with project-specific content

## 🎯 Expected effects

By introducing this document structure:

- ✅ Session start time reduced (10 min → 2 min)
- ✅ No need to explain context to AI (5-10 questions → 0-1)
- ✅ Past knowledge reusable (0 → 3-5 times/month)
- ✅ Reasons for decisions clearly recorded
- ✅ Smoother handoffs between team members

## 🤖 actions pattern philosophy

> **"Specify in code" = clear spec = no discussion needed = token savings**

Calling `@actions/filename.md` eliminates confirmation back-and-forth.

### Good use cases / Bad use cases

| ✅ Good | ❌ Not ideal |
|--------|------------|
| Repeated tasks | One-time tasks |
| Tasks with fixed steps | Tasks with variable steps |
| Multi-step tasks | Exploratory / creative tasks |

### Adding a new action

1. Create `new-task-name.md` in `docs/actions/`
2. Write with this structure:

   ```markdown
   ## 📋 Understanding check for this instruction
   - [ ] Step 1: ...
   Ready? Give me the go-ahead.
   ---
   1. Step 1 (use code blocks as needed)
   2. Step 2
   ```

3. Add to the list in `docs/actions/README.md` and `help.md`

### Measured data

Measured in the joplin-ai-tools project (October 2025): average **69% token reduction**.
See `docs/notes/2025-10-25-00-00-00-actions-pattern-rationale.md` for details.

---

## 📚 Further reading

- [README.md](./README.md) - Detailed pattern description (for humans)
- [examples/](./examples/) - Concrete usage examples

---

**Next step**: Read `docs/README.md` to understand the document structure of this project.
