# Refactoring (treatment)

Refactor the specified area.

## What to do

- Improve code in the specified scope
- Explain the reason for each change
- Preserve existing behavior

## Perspectives

- Consolidate duplication
- Split long functions
- Improve naming
- Remove dead code
- Check for mixed responsibilities

## Rules

- **Do not change behavior** (preserve existing behavior)
- **Do not affect code outside the specified scope**
- **Always pass tests if they exist**

## Do NOT do

- Add or change features
- Affect code outside the specified scope
- Large-scale design changes (consult via dev_review.md first)

## Recommended flow

1. Write tests first (dev_testing.md)
2. Execute refactoring
3. Confirm tests still pass
4. Record the changes in notes
