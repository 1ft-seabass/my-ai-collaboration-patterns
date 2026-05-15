# Changelog

Change history for the docs-structure-en pattern.

---

## [1.2.2] - 2026-04-18

### Fixed
- `templates/actions/01_git_push.md`: Changed the check scope from folder-specific (`docs/letters, docs/notes`) to full `git diff --cached`
  - Folder-specific description risked AI interpreting it too literally and missing source code or branch-specific paths

---

## [1.2.1] - 2026-04-17

### Changed
- Moved `for_branch_init.md` from `docs/actions/` and `templates/actions/` to `patterns/setup-pattern/docs-structure-for-branch/`
  - Branch initialization is a one-time setup ("step 0"), not an ongoing action
  - Separated into `setup-pattern` to eliminate sync cost and duplication
- Improved `for_branch_init.md` procedure
  - Added step 2.5: copy TEMPLATE.md to branch-specific directory and rewrite paths
  - Added `check_my_security_prepare_level.md` to the list of action files to rewrite
  - Clarified that `docs/notes/, docs/letters/, docs/tasks/` are never touched
  - Strengthened the rule to exit immediately on main/master branch
- Added `docs-structure-for-branch` link to the Related Patterns section in `README.md`

---

## [1.2.0] - 2026-04-17

### Added
- `actions/for_branch_init.md`: Action to initialize branch-specific document structure
  - Creates `docs/{branch-name}/notes,letters,tasks/`
  - Rewrites paths in 4 action files to branch-specific paths via Node.js batch replace
  - Call path always unified as `@docs/actions/`

### Changed
- `GUIDE.md`: Added "actions pattern philosophy" section (good/bad use cases, reference to measured data)

### Removed / Merged
- Retired `patterns/actions-pattern/`; merged into docs-structure
  - WHY.md content migrated to `docs/notes/2025-10-25-00-00-00-actions-pattern-rationale.md`
  - Useful parts of GUIDE.md absorbed into docs-structure GUIDE.md
- Retired `patterns/docs-structure-for-target-branch-only/`; replaced by `for_branch_init.md`
- Retired `patterns/writing-collaborate/`; covered by docs-structure

---

## [1.1.0] - 2026-02

### Added
- FrontMatter tags (`tags: []`) added to notes, letters, and tasks templates
- `migration/MIGRATION_GUIDE_v1.0.1_to_v1.1.0.md`: migration guide for existing projects

### Changed
- **Unified naming convention**: notes changed from `0001_title.md` to `yyyy-mm-dd-hh-mm-ss-title.md`; letters changed from `yyyy-mm-dd-hh-mm-ss.md` to `yyyy-mm-dd-hh-mm-ss-title.md` (now includes title)
- **Template consolidation**: minimized README.md, moved guides into TEMPLATE.md (64% token reduction)
- Reorganized action naming: introduced numbered prefixes (`00_`/`01_`) and category prefixes (`git_`/`doc_`/`dev_`/`check_`)
- Added `doc_note_and_commit.md` (lightweight session-end action)

---

## [1.0.1] - 2025-11

### Changed
- notes naming: `title.md` → `0001_title.md` (sequential numbering)
- letters naming: introduced timestamp format (`yyyy-mm-dd-hh-mm-ss.md`)
- Added actions directory to each pattern

---

## [1.0.0] - 2025-10

Initial release.

- 4-folder structure (notes/letters/tasks/actions)
- README-driven navigation
- Session handoff mechanism
