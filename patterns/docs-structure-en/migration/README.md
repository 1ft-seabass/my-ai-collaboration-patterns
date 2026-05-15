# docs-structure-en Migration Guide

This directory contains version migration guides for the docs-structure-en pattern.

---

## How to check the current version

Ways to check which version of docs-structure your project is using:

### Method 1: Check TEMPLATE.md structure

```bash
# v1.0.1 and earlier: README and TEMPLATE are separate; README has detailed guide
head -20 docs/templates/notes/README.md

# v1.1.0: Guide consolidated into TEMPLATE; README is 3-5 lines
head -10 docs/templates/notes/README.md
```

### Method 2: Check for FrontMatter

```bash
# v1.0.1 and earlier: No FrontMatter
# v1.1.0: FrontMatter present (tags only)
head -5 docs/templates/notes/TEMPLATE.md
```

### Method 3: Check file naming convention

```bash
# v1.0.1 and earlier:
#   - notes: 0001_title.md (sequential numbering)
#   - letters: yyyy-mm-dd-hh-mm-ss.md (timestamp only)

# v1.1.0:
#   - notes: yyyy-mm-dd-hh-mm-ss-title.md
#   - letters: yyyy-mm-dd-hh-mm-ss-title.md

ls docs/notes/ docs/letters/
```

---

## Available migration guides

### v1.0.1 → v1.1.0

- **Guide**: [MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md](./MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md)
- **Key changes**:
  - Introduced FrontMatter (tags only)
  - Unified naming convention (`yyyy-mm-dd-hh-mm-ss-{title}.md`)
  - Consolidated information into TEMPLATE
- **Audience**: Projects running with v1.0.1 format

---

## Basic migration flow

### Step 1: Check version

Confirm the current version using the methods above.

### Step 2: Phase 2 (Update templates)

```bash
# Fetch the latest templates/ with degit
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure-en/templates docs/templates --force

# Or copy manually from patterns/docs-structure-en/templates/
```

### Step 3: Phase 3 (Migrate existing files)

Have AI read the appropriate migration guide and run it as a one-shot:

```bash
# Fetch the migration guide (to any location)
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure-en/migration .

# Have AI read MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md and execute
```

---

## Notes

- **Git-managed**: Migration uses `git mv`, so change history is preserved
- **Rollback**: If there are issues, you can revert with `git reset --hard` (before committing)
- **Incremental**: For large projects (100+ files), incremental migration is recommended
- **Backup**: If concerned, copy the entire repository before migrating

---

## Troubleshooting

### Cannot retrieve git log

When migrating notes/, if the git creation timestamp cannot be retrieved:

- Specify the timestamp manually
- Or use the current time as the default

### Difficult to generate titles

When migrating letters/, if title generation is difficult:

- Use the first heading in the file
- If none, confirm with the user

---

**Last updated**: 2026-02-01
