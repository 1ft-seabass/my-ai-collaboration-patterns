# Dev Review (diagnosis)

Review this project (or the specified scope) holistically.

## What to do

- Get a bird's-eye view of the overall structure
- List areas of concern
- Attach a reason to each finding

## Perspectives

- Are class / function granularities appropriate?
- Is common logic properly consolidated?
- Are responsibilities mixed?
- Is naming clear?
- Is there any dead code?

## Output format

A list of findings with severity (high / medium / low) and reasoning.

Example:
```
[High] File A: Function X exceeds 200 lines
Reason: Multiple responsibilities mixed, hard to test and maintain

[Medium] File B: Similar logic in 3 separate places
Reason: Consolidation could improve maintainability
```

## Do NOT do

- Modify code
- Decide on a fix approach
- Start refactoring without approval

## Next steps

Record review results in notes; the human decides and proceeds.
