# TASK-001: Delete API Mock Implementation Files

> **⚠️ Secrets protection rules**
>
> For information in this task:
> - Always use placeholders (`YOUR_API_KEY`, etc.) for API keys, passwords, and tokens
> - Never include actual secrets
> - Never paste .env or config file contents as-is

**Created**: 2025-01-06
**Status**: Open
**Priority**: Medium
**Estimated time**: 0.5h

## Overview

The real API implementation is complete. Delete the temporary mock/stub files created during early development.

## Background / Reason

- `server/mocks/users.js` was used with mock data to front-load frontend development
- Phase 1 and 2 completed the real API implementation (`server/routes/users.js`)
- Leaving mock files causes confusion about which is real
- Delete them to keep the codebase clean

### Files to delete

```
server/
├── mocks/
│   ├── users.js          # ← delete
│   └── products.js       # ← delete (unused)
└── __tests__/
    └── mocks/
        └── usersMock.js  # ← keep (used in tests)
```

## Checklist

### Before deleting

- [ ] Confirm `server/mocks/users.js` is not currently used
  - Search with `grep -r "mocks/users" server/`
  - Confirm no remaining import statements

- [ ] Confirm `server/mocks/products.js` is not currently used
  - Search with `grep -r "mocks/products" server/`

- [ ] Keep mocks used by test files
  - `server/__tests__/mocks/usersMock.js` is used in tests
  - **Do NOT delete** this file

### After deleting

- [ ] Confirm the application starts normally
  - Start backend with `npm run server`
  - Confirm no errors

- [ ] Confirm the API works correctly
  - Fetch data with `curl http://localhost:3001/api/users`
  - Confirm the real API responds

- [ ] Confirm tests pass
  - Run `npm test`
  - Confirm tests using mocks are not failing

## Related documents

- [Handoff (2025-01-05)](../letters/2025-01-05-18-30-00.md) — Phase 1 & 2 completion report
- [Note: Express API implementation pattern](../notes/02_express-api-patterns.md) — knowledge on real API implementation

## Work log

- 2025-01-06 10:00: Task created
- 2025-01-06 10:15: Started checking files to delete

## Completion criteria

- [ ] Delete `server/mocks/users.js`
- [ ] Delete `server/mocks/products.js`
- [ ] Delete `server/mocks/` directory (if now empty)
- [ ] Application starts normally
- [ ] API works correctly (`/api/users` returns real data)
- [ ] All tests pass (`npm test` succeeds)

---

## On completion

**Completed**: (incomplete)
**Actual time**: (incomplete)
**Deliverables**: (incomplete)

**Learnings**: (incomplete)
