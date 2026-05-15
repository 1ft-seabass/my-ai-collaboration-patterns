# actions — Task automation instructions

This directory stores instruction files for repeated tasks.

## Usage

Call from AI tools that support `@` references, such as Claude Code, Cursor, Windsurf, or Gemini CLI:

```
@actions/filename.md
```

AI reads the instruction file and executes the defined task.

## Available actions

### Frequently used actions (numbered)

- `00_session_end.md` - Full session end (create note → commit → create handoff)
- `01_git_push.md` - Strict push check (secrets scan)

### Individual task actions

- `git_commit.md` - Commit only (no push)
- `doc_note.md` - Create note only
- `doc_letter.md` - Create handoff only
- `doc_note_and_commit.md` - Create note + commit (lightweight session end)

### Security / setup

- `check_my_security_prepare_level.md` - Security readiness diagnosis

### Development quality (experimental)

- `dev_review.md` - Code review (diagnosis)
- `dev_refactoring.md` - Refactoring (treatment)
- `dev_security.md` - Security check
- `dev_testing.md` - Test creation (guardrail)

### Help

- `help.md` - Usage guide for each action (display with `@actions/help.md`)

## Adding a new action

1. Create `new-task-name.md` in this directory
2. Write with this structure:
   - Purpose
   - Execution conditions
   - Steps
   - Notes
   - Expected result
3. Call with `@actions/new-task-name.md`

## Tips

- Be specific and clear in instructions
- Break steps into small pieces
- State expected results explicitly
- Improve through repeated use

## Effect

Using the actions pattern:
- **Token reduction**: ~70% (measured)
- **Time savings**: No back-and-forth confirmation
- **Consistency**: Same quality every time
- **Reproducibility**: Shareable across the team

## Detailed documentation

- [README.md](../../README.md) - Pattern overview
- [GUIDE.md](../../GUIDE.md) - Setup guide
- [examples/](../../examples/) - Concrete usage examples
