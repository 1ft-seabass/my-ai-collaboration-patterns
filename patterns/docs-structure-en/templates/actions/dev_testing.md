# Test Creation (guardrail)

Write tests for the specified scope.

## Purpose

- Guardrail before refactoring
- Guarantee current behavior
- Create a state where code can be improved with confidence

## What to do

- Start with parts that have clear input/output
- Prioritize main paths (happy path)
- Edge cases and error cases are secondary

## Priority

1. **Utility functions**: Clear input/output, independent
2. **Business logic**: Pure computations and judgments
3. **API endpoints**: Clear request/response
4. **Complex conditionals**: Bug-prone areas

## Rules

- Create test files in the same directory as the target, with `.test.{ext}` suffix
- Example: `utils.ts` → `utils.test.ts`
- Follow the project's standard test framework

## Do NOT do

- E2E tests (too heavy)
- Tests for unstable/rapidly-changing designs (breaks with every change)
- Chasing excessive coverage (main paths are enough)

## Recommended flow

```
1. Identify the code to refactor
2. @actions/dev_testing.md — write tests
3. Confirm tests pass
4. @actions/dev_refactoring.md — refactor with confidence
5. Confirm tests continue to pass
```

## Reality of testing

- E2E is too much work
- Unit tests during active development break with design changes
- Writing them as guardrails after a milestone is realistic

With this in mind, write **minimal but effective tests**.
