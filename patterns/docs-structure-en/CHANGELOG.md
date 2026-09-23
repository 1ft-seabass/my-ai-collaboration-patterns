# Changelog

Change history for the docs-structure-en pattern.

---

## [1.3.0] - 2026-09-23

### Added
- `install.js`: a deterministic Node.js installer for safely merging into an existing project. Placed alongside `templates/`, resolving its copy source via `__dirname` so it doesn't depend on `process.cwd()`. Never overwrites existing files (skip-existing), so the same logic naturally covers both a fresh install and resuming an interrupted one. Depends on neither package.json nor git. Prints the resolved absolute destination path before writing anything to guard against wrong-directory accidents, and points to the "Updating an existing docs-structure to the latest version" judgment-tier flow when nothing was created but the destination already existed

### Changed
- `README.md` (ja/en): restructured the top one-shot instructions into "Setting up a new project" (3 tiers: Node.js-based / prompt-only / manual) and "Updating an existing project" (2 tiers: prompt-only / manual)
- `README.md` (ja/en): removed the "🚀 Usage" section, which duplicated the new top block and the "🎯 Usage examples" section

## [1.2.6] - 2026-09-23

### Removed
- `GUIDE.md` (ja/en). Never shipped via degit (not under `templates/`), so it went essentially unread and drifted stale (documented directory structures and action filenames that no longer exist). It played no role in the actual one-shot install flow (the instruction block at the top of the pattern-root `README.md`), so removing it has no functional impact
- `SETUP.md` (repository root). Unrelated to the docs-structure pattern (it described this monorepo's own old structure) and referenced from nowhere

### Fixed
- `templates/README.md` (ja/en, shipped as `docs/README.md`): replaced references to nonexistent actions (`git_commit_and_push.md`, `current_create_knowledge.md`, `simple_start_from_latest_letter.md`) with the actual current filenames (`01_git_push.md`, `doc_letter.md`, `start_init_rule.md`) or a pointer to `actions/README.md`
- `templates/README.md` (ja/en): removed the stale "folders you can add as needed" section (`ai-collaboration/`, `architecture/`, `development/`, `spec/`), which contradicted the file's own stated principle that manually maintained lists in README go stale
- `templates/README.md` (ja/en), `docs/README.md`: removed the dead link to the now-removed `SETUP.md`
- `patterns/docs-structure/README.md` (ja/en): removed dead links to `server-management`/`prompt-engineering` (directories that don't exist) in the "Related patterns" section
- `templates/actions/README.md` (ja/en), `docs/actions/README.md`: removed references to the now-removed `GUIDE.md`
- Root `README.md`: fixed 3 references to the now-removed `GUIDE.md` (pattern intro, features list, contribution guide)

---

## [1.2.5] - 2026-09-22

### Removed
- `templates/actions/check_my_security_prepare_level.md` — rarely used, and its diagnostic logic (husky pre-commit-based, Level 0/1/2 model) had gone stale and duplicated what setup-securecheck now does natively in v3 (its own version detection and canary self-verification), never having followed the v2.0.0 simple-git-hooks migration or the v3 fail-closed redesign
  - Removed references from `templates/actions/help.md`, `templates/actions/README.md`
  - Removed references from `patterns/setup-pattern/docs-structure-for-branch/for_branch_init.md`'s rewrite-target list and completion notice

### Fixed
- `patterns/setup-pattern/README.md`: Removed a dead link to `patterns/actions-pattern/`, which was removed in v1.2.0

---

## [1.2.4] - 2026-09-22

### Added
- `templates/actions/start_init_rule.md`: New action to confirm/share operating rules at session start, addressing mistakes that happen when work starts before rules are shared (if `00_session_end.md` closes a session, this opens one)

### Fixed
- `templates/actions/00_session_end.md`, `templates/actions/doc_letter.md`: Fixed a bug where the note-creation caveat in the handoff message incorrectly read "create notes only within the session-end handoff flow"; unified it with the handoff caveat to read "create only when the user explicitly requests it"
- `templates/actions/doc_letter.md`: Unified the commit-rule wording with `00_session_end.md` (it previously read "omit Claude traces if public, keep them if private"; now reads "follow the existing commit log (git log)")

---

## [1.2.3] - 2026-08-22

### Fixed
- `templates/actions/00_session_end.md`, `templates/actions/doc_letter.md`: Clarified the operating rules in the handoff message to ask separately about continuing work vs. committing ("OK to proceed with the work?" vs. "OK to commit now?")
  - A single "yes" could otherwise be misread as approving either one
  - Made explicit that commit timing is usually decided by the human

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
