# Document Index

This directory contains the documents needed for AI-collaborative development.

## 📂 Directory structure

A **minimal 4-folder** structure effective for early-stage agile development.

### [actions/](./actions/) — Task automation instructions
Stores instruction files for repeated tasks.

- Call with `@actions/filename.md` to have AI execute tasks automatically
- Available actions: see `actions/README.md`

### [letters/](./letters/) — Session handoffs
Stores session-to-session handoffs and work status records in chronological order.

- **Naming**: `yyyy-mm-dd-hh-mm-ss-{title}.md`
- **Template**: [TEMPLATE.md](./letters/TEMPLATE.md)

### [tasks/](./tasks/) — Task management
Manages cross-session tasks. A supplementary tool for handoffs.

- **Naming**: `yyyy-mm-dd-hh-mm-ss-{title}.md`
- **Template**: [TEMPLATE.md](./tasks/TEMPLATE.md)
- **Relationship**: Handoffs are primary; tasks are supplementary

### [notes/](./notes/) — Dev notes
Stores records of technical trial & error and problem-solving.

- **Naming**: `yyyy-mm-dd-hh-mm-ss-{title}.md`
- **Template**: [TEMPLATE.md](./notes/TEMPLATE.md)

## 📁 Folders you can add as needed

Add these once the project matures and letters/notes have accumulated:

- `ai-collaboration/` - AI collaboration guide
- `architecture/` - Architecture design / ADR
- `development/` - Development guide / best practices
- `spec/` - Specifications

**Important**: Unused folders confuse both AI and humans. Add them only when needed.

## 🔍 Searching documents

**No need to maintain lists in README.** AI can search with Grep/Glob, so manual lists risk going stale.

### Search examples
```bash
# Search by tag
grep -r "tags:.*api" docs/notes/

# Search by title
ls docs/notes/ | grep authentication

# Search by content
grep -r "root cause" docs/notes/
```

See each directory's TEMPLATE.md for detailed search methods.

## 🤖 AI instruction examples

### At session start (using actions)
```
@actions/simple_start_from_latest_letter.md
```

### At session start (manual)
```
"Read docs/README.md and check the latest handoff."
```

### Create handoff (using actions)
```
@actions/doc_letter.md
```

### Create handoff (manual)
```
"Record today's work as a handoff in docs/letters/."
```

### Commit & push (using actions)
```
@actions/01_git_push.md
```

## 📝 Document management principles

1. **Search-driven**: No need for README lists. Search with Grep/Glob.
2. **Shallow hierarchy**: Up to 3-4 levels deep
3. **One-file-one-insight**: 1 file = 1 insight (50-150 lines as a guide)
4. **Unified naming**: `yyyy-mm-dd-hh-mm-ss-{title}.md` format

## 🔗 Related links

- [Top README](../README.md) - Repository overview
- [SETUP.md](../SETUP.md) - Setup instructions
