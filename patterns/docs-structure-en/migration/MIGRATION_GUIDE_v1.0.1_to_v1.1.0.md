# docs-structure v1.0.1 → v1.1.0 Migration Guide (AI one-shot instruction)

<!-- ============================================================
  This file is a one-shot instruction for AI to read and execute
  ============================================================ -->

## Purpose

Migrate existing docs-structure v1.0.1 files to v1.1.0 format.

**Key changes:**
- **notes**: `0001_title.md` → `yyyy-mm-dd-hh-mm-ss-title.md`
- **letters**: `yyyy-mm-dd-hh-mm-ss.md` → `yyyy-mm-dd-hh-mm-ss-title.md`
- **FrontMatter added**: `tags` field added to all files

---

## 📋 Understanding check for this instruction

Before starting, present the following steps as checkboxes to confirm your understanding:

### Steps to execute
- [ ] Step 1: Detect and analyze migration targets (notes / letters separately)
- [ ] Step 2: Generate and present migration plan (including creating a migration plan note)
- [ ] Step 3: Execute file renames (using `git mv`)
- [ ] Step 4: Confirm file rename completion
- [ ] Step 5: Create and present internal link change list (create a link change list note)
- [ ] Step 6: Execute internal link fixes
- [ ] Step 7: Final confirmation

### Note creation rules
- [ ] Always create notes in `.md` format (`.txt` is prohibited)
- [ ] Always save to `docs/notes/` directory
- [ ] Strictly follow naming: `yyyy-mm-dd-hh-mm-ss-{title}.md`
- [ ] Always add tags to FrontMatter (3-5 recommended)
- [ ] Timing: Step 2 (migration plan) and Step 5 (link change list)

### Important rules
- [ ] Always use `git mv` for file renames (preserves history)
- [ ] For files with identical Git timestamps: offset by +0s, +1s, +2s... in sequential order
- [ ] Wait for user approval at each Step (do not proceed on your own)
- [ ] Internal link detection scope: `docs/` only
- [ ] Do not commit (user reviews and commits)

Ready? Give me the go-ahead.

---

## Prerequisites

- Phase 2 (template update) is complete
- Project is managed with Git
- Pre-commit state (can rollback at any time)

---

## Step 1: Detect and analyze migration targets

### 1.1 Analyze notes/

**Detection command:**
```bash
find docs/notes -name '[0-9][0-9][0-9][0-9]_*.md' | sort
```

**Information to retrieve for each file:**

#### 1.1.1 Git creation timestamp

```bash
git log --format="%ai" --diff-filter=A -- docs/notes/NNNN_title.md | head -1
```

**Example output:** `2025-10-23 14:32:10 +0900`

**Conversion:** Convert to `yyyy-mm-dd-hh-mm-ss` format
- Example: `2025-10-23 14:32:10 +0900` → `2025-10-23-14-32-10`

#### 1.1.2 Timestamp offset for files with identical Git timestamps

**Problem:** Files with the same Git creation timestamp would have duplicate timestamps.

**Example:**
```bash
# Git log results
0001_degit-understanding.md         → 2025-11-17 23:47:27 +0900
0002_pattern-structure-design.md    → 2025-11-17 23:47:27 +0900 (same!)
0003_repository-dogfooding.md       → 2025-11-17 23:47:27 +0900 (same!)
```

This would result in all files starting with `2025-11-17-23-47-27-`, losing chronological order.

**Solution:** Add +0s, +1s, +2s... in sequential order to ensure unique filenames.

```bash
# After time adjustment
0001_degit-understanding.md         → 2025-11-17-23-47-27-degit-understanding.md      (+0s)
0002_pattern-structure-design.md    → 2025-11-17-23-47-28-pattern-structure-design.md (+1s)
0003_repository-dogfooding.md       → 2025-11-17-23-47-29-repository-dogfooding.md    (+2s)
```

**Implementation approach:**
1. Group files with the same Git timestamp
2. Sort within the group by sequential number
3. Add +0s, +1s, +2s... from the base timestamp

**Implementation example:**
```bash
base_timestamp="2025-11-17 23:47:27 +0900"
offset=0

for file in $(files_with_same_git_timestamp_in_sequential_order); do
    adjusted_time=$(date -d "$base_timestamp + $offset seconds" +"%Y-%m-%d-%H-%M-%S")
    echo "$file → $adjusted_time-title.md"
    offset=$((offset + 1))
done
```

**Benefits:**
- Unique filenames guaranteed
- Sequential order (creation order) reflected in timestamps
- Correct order maintained with `ls` sort

#### 1.1.3 Existing title

The part of the filename after `NNNN_` (without `.md`)

- Example: `0001_degit-understanding.md` → `degit-understanding`

#### 1.1.4 Infer tags

Read file content and infer 3-5 tags:
- Technical keywords (e.g., degit, npm, git)
- Topics (e.g., template, documentation)
- Pattern names (e.g., docs-structure, actions-pattern)

**How to infer:**
1. Read the file content
2. Extract main keywords
3. Match tags from existing notes for consistency

---

### 1.2 Analyze letters/

**Detection command:**
```bash
find docs/letters -name '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9].md' | sort
```

**Information to retrieve for each file:**

#### 1.2.1 Timestamp

Extract from filename (keep as-is)

- Example: `2026-02-01-14-00-00.md` → `2026-02-01-14-00-00`

#### 1.2.2 Generate title

Generate by reading file content:
- Extract the main theme of the session
- ~30 chars max
- kebab-case recommended (e.g., `phase2-implementation-complete`)

**How to generate:**
1. Read the file content
2. Refer to the first heading (`# Session Handoff (...)`)
3. Or extract the main theme from "Completed" or "Next steps" sections
4. Convert to a short, descriptive title

#### 1.2.3 Infer tags

Infer 3-5 tags from file content (same as notes)

---

## Step 2: Generate and present migration plan

### 2.1 Migration plan format

Generate a migration plan with checkboxes in the format below and present to the user:

```markdown
## 📋 Migration plan

### notes/ targets (N files)

- [ ] 0001_degit-understanding.md
      → 2025-11-17-23-47-27-degit-understanding.md
      tags: [degit, npm, template]
      (Git timestamp: 2025-11-17 23:47:27 +0900 / Offset: +0s)

- [ ] 0002_pattern-structure-design.md
      → 2025-11-17-23-47-28-pattern-structure-design.md
      tags: [pattern, design, structure]
      (Git timestamp: 2025-11-17 23:47:27 +0900 / Offset: +1s)

- [ ] 0003_repository-dogfooding.md
      → 2025-11-17-23-47-29-repository-dogfooding.md
      tags: [dogfooding, repository, best-practice]
      (Git timestamp: 2025-11-17 23:47:27 +0900 / Offset: +2s)

(...list all files...)

---

### letters/ targets (M files)

- [ ] 2026-02-01-14-00-00.md
      → 2026-02-01-14-00-00-phase2-implementation-complete.md
      tags: [docs-structure, phase2, v1.1.0]
      (Generated title: phase2-implementation-complete)

(...list all files...)

---

**Total files to migrate**: notes: N, letters: M

**Review:**
- Are the titles appropriate?
- Do the tags reflect the content?
- Are the timestamps correct?
- Are files with identical Git timestamps offset in sequential order (+0s, +1s, +2s...)?

Shall I proceed with this plan? [y/N]
```

### 2.2 Create migration plan note

**Filename:** `yyyy-mm-dd-hh-mm-ss-migration-plan-v1.0.1-to-v1.1.0.md`

**Save to:** `docs/notes/`

**Important:** Always save as `.md` in `docs/notes/`

**Purpose:**
- Recovery point in case of token exhaustion
- Record of the migration work
- History to refer back to

**Content:** Save the migration plan generated in Step 2.1 (with checkboxes) as a note

**FrontMatter:**
```yaml
---
tags: [migration, docs-structure, v1.1.0]
---
```

### 2.3 Wait for user approval

**Important:** After presenting the plan, **wait for user approval**

- Adjust interactively if corrections are needed
- Do not proceed to Step 3 until the user approves

---

## Step 3: Execute migration

After approval, execute the following **for each file in order:**

### 3.1 Steps (one file at a time)

#### 3.1.1 Read file content

```bash
cat docs/notes/0001_degit-understanding.md
```

#### 3.1.2 Add FrontMatter

Add FrontMatter at the top of the file:

```yaml
---
tags: [tag1, tag2, tag3]
---

```

**Notes:**
- Insert before the existing first line (title `# ...`)
- Add one blank line after FrontMatter
- Do not add a `created` field (redundant with filename)

#### 3.1.3 Rename file

**For notes/:**
```bash
git mv docs/notes/0001_degit-understanding.md docs/notes/2025-10-23-14-32-10-degit-understanding.md
```

**For letters/:**
```bash
git mv docs/letters/2026-02-01-14-00-00.md docs/letters/2026-02-01-14-00-00-phase2-implementation-complete.md
```

**Important:** Using `git mv` preserves change history.

#### 3.1.4 Show progress

After processing each file:

```
✅ 0001_degit-understanding.md → 2025-10-23-14-32-10-degit-understanding.md
✅ 0002_actions-exploration.md → 2025-10-24-09-15-22-actions-exploration.md
...
```

---

### 3.2 Error handling

#### When Git log cannot be retrieved (notes)

Handle in this order:
1. Ask the user to specify the timestamp manually
2. Propose using current time as default (`date +"%Y-%m-%d-%H-%M-%S"`)

#### When title generation is difficult (letters)

Handle in this order:
1. Use the first heading in the file
2. If none, confirm with the user
3. Propose a generic title like `session-handoff` as default

---

## Step 4: Confirm file rename completion

### 4.1 Confirmation commands

#### Check that no old-format files remain

```bash
# Old format for notes/
find docs/notes -name '[0-9][0-9][0-9][0-9]_*.md'

# Old format for letters/
find docs/letters -name '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9].md'
```

**Expected:** No output (no old-format files exist)

#### Confirm new-format files

```bash
ls docs/notes/
ls docs/letters/
```

**Expected:** All in `yyyy-mm-dd-hh-mm-ss-title.md` format

---

### 4.2 Check git status

```bash
git status
git diff --cached
```

**Review:**
- Is the rename recognized as `renamed`?
- Is FrontMatter correctly added?
- Are there any unintended changes?

---

### 4.3 Spot-check file content

Randomly select a few files and check:

```bash
head -10 docs/notes/yyyy-mm-dd-hh-mm-ss-title.md
head -10 docs/letters/yyyy-mm-dd-hh-mm-ss-title.md
```

**Review:**
- Is FrontMatter correctly added?
- Are tags appropriate?
- Is the existing content intact?

---

## Step 5: Create and present internal link change list

**Important:** After file renames are complete, detect internal links and create a list.

### 5.1 Detect internal links

**Target:**
- All `.md` files under `docs/`
  - `docs/notes/`
  - `docs/letters/`
  - `docs/actions/`, etc.

**Detection commands:**
```bash
# Links to old-format notes (sequential numbering)
grep -rn "[0-9][0-9][0-9][0-9]_.*\.md" docs/

# Links to old-format letters (no title)
grep -rn "[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}-[0-9]\{2\}-[0-9]\{2\}-[0-9]\{2\}\.md" docs/
```

**Example output:**
```
docs/notes/2025-11-20-10-00-00-some-note.md:15:[link](0001_degit-understanding.md)
docs/letters/2026-02-01-14-00-00-phase2-complete.md:42:[ref](../notes/0002_pattern-structure-design.md)
```

### 5.2 Create internal link change list note

**Filename:** `yyyy-mm-dd-hh-mm-ss-migration-link-changes-list.md`

**Save to:** `docs/notes/`

**Important:** Always save as `.md` in `docs/notes/`

**Purpose:**
- Structured data for AI to generate fix operations
- Checklist for manual review
- Prevent missed fixes

**Format example:**
```markdown
---
tags: [migration, link-changes, v1.1.0]
---

# Internal link change list

## Links to update (N items)

### 1. docs/notes/2025-11-20-10-00-00-some-note.md:15
- Before: `[link](0001_degit-understanding.md)`
- After:  `[link](2025-11-17-23-47-27-degit-understanding.md)`

### 2. docs/letters/2026-02-01-14-00-00-phase2-complete.md:42
- Before: `[ref](../notes/0002_pattern-structure-design.md)`
- After:  `[ref](../notes/2025-11-17-23-47-28-pattern-structure-design.md)`

...
```

### 5.3 Get user confirmation

Present the list to the user and get approval:

**Review:**
- Were all link change locations correctly detected?
- Are the updated paths correct?
- Are there any missed items?

**Shall I proceed with these internal link fixes? [y/N]**

---

## Step 6: Execute internal link fixes

Fix each file using the Edit tool based on the approved list from Step 5:

### 6.1 Steps (one file at a time)

For each file:

1. **Read the file**
   ```bash
   cat docs/notes/2025-11-20-10-00-00-some-note.md
   ```

2. **Fix with Edit tool**
   - Replace old path with new path
   - Consider `replace_all` option for multiple occurrences

3. **Show progress**
   ```
   ✅ docs/notes/2025-11-20-10-00-00-some-note.md:15 fixed
   ✅ docs/letters/2026-02-01-14-00-00-phase2-complete.md:42 fixed
   ...
   ```

### 6.2 Confirm fix completion

After all link fixes are done, run the detection commands again:

```bash
# Check that no old-format links remain
grep -rn "[0-9][0-9][0-9][0-9]_.*\.md" docs/
grep -rn "[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}-[0-9]\{2\}-[0-9]\{2\}-[0-9]\{2\}\.md" docs/
```

**Expected:** No output (no old-format links exist)

---

## Step 7: Final confirmation

### 7.1 Create migration completion file list note

**Filename:** `yyyy-mm-dd-hh-mm-ss-migration-completed-files.md`

**Save to:** `docs/notes/`

**Important:** Always save as `.md` in `docs/notes/`

**Content:**
- List of converted files (notes / letters separately)
- Mapping table of old filename → new filename
- Migration status for each file (success / skipped / error)
- Completion status of internal link fixes

**FrontMatter:**
```yaml
---
tags: [migration, completed, v1.1.0]
---
```

### 7.2 Final git status check

```bash
git status
git diff --cached
```

**Review:**
- Is the rename recognized as `renamed`?
- Is FrontMatter correctly added?
- Are internal links correctly updated?
- Are there any unintended changes?

### 7.3 Completion notification

Notify the user:

```
✅ Migration complete

**Files migrated**: notes: N, letters: M
**Internal links fixed**: P locations

**Notes created:**
- Migration plan: docs/notes/yyyy-mm-dd-hh-mm-ss-migration-plan-v1.0.1-to-v1.1.0.md
- Link change list: docs/notes/yyyy-mm-dd-hh-mm-ss-migration-link-changes-list.md
- Completed file list: docs/notes/yyyy-mm-dd-hh-mm-ss-migration-completed-files.md

Next steps:
- Review changes with `git status` and `git diff --cached`
- Commit if everything looks good
- Rollback with `git reset --hard` if there are issues
```

---

## Notes

### ⚠️ Important

- **Git-managed**: Migration uses `git mv`, so change history is preserved
- **Rollback**: If there are issues, revert with `git reset --hard` (before committing)
- **FrontMatter tags only**: Do not add `created` (redundant with filename)
- **Timestamp timezone**: UTC/JST mix is acceptable (use Git log timestamp as-is)
- **Commit separately**: This migration guide does not commit (user reviews and commits)

---

### 📝 Note creation rules (strictly follow)

- **File format**: Always `.md` (`.txt` is prohibited)
- **Save location**: Always `docs/notes/`
- **Naming**: Strictly `yyyy-mm-dd-hh-mm-ss-{title}.md`
- **FrontMatter**: Always add tags (3-5 recommended)
- **Reference**: Always check `docs/notes/TEMPLATE.md`
- **Timing**:
  - Step 2: Migration plan note
  - Step 5: Link change list note
  - Step 7: Completed file list note

---

### 💡 Tips

- **Many files (50+)**: Split approvals into batches of 10
- **Tags can be fixed later**: Don't aim for perfection (adjustable later)
- **Keep titles concise**: Don't exceed ~30 chars significantly
- **Estimated time per file**: A few seconds to ~10 seconds

---

### 🔄 Rollback

If issues arise during or after migration:

```bash
# Discard all changes (before committing)
git reset --hard

# Clear staging area only (keep changes)
git reset
```

**Note:** Rollback becomes complex after committing — always review before committing.

---

## Execution examples

### Small project (10 files or fewer)

1. **Step 1**: Detect all files
2. **Step 2**: Present migration plan + create plan note
3. **User approval**
4. **Step 3**: Execute all renames
5. **Step 4**: Confirm renames
6. **Step 5**: Detect internal links + create link change list note
7. **User approval**
8. **Step 6**: Execute link fixes
9. **Step 7**: Final confirmation + create completed file list note

### Medium project (10-50 files)

Same flow as small project above.

### Large project (50+ files)

1. **Step 1**: Detect all files
2. **Step 2**: Present migration plan in batches of 10 + create plan note
3. **User approval**
4. **Step 3**: Execute renames in batches of 10
5. **Step 4**: Confirm every 10 files
6. Repeat Steps 2-5 until all files are done
7. **Step 5**: Detect internal links + create link change list note
8. **User approval**
9. **Step 6**: Execute link fixes
10. **Step 7**: Final confirmation + create completed file list note

---

## Post-migration checklist

- [ ] No old-format files remain
- [ ] New-format filenames are correct
- [ ] FrontMatter added to all files
- [ ] Tags set appropriately
- [ ] All internal links updated to new format
- [ ] Git history preserved (`git log --follow` to verify)
- [ ] No unintended changes (`git diff --cached` to verify)
- [ ] Sample file content is intact
- [ ] 3 notes created (migration plan, link change list, completed file list)

---

**Created**: 2026-02-01
**Target version**: v1.0.1 → v1.1.0
**Last updated**: 2026-02-06
