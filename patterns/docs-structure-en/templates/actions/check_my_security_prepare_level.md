# Security Readiness Check

Diagnose the secrets protection setup of this project.

## 📊 Security levels

| Level | State | Risk | Description |
|-------|-------|------|-------------|
| **Level 0** | docs-structure only | 🔴 High | Manual checks only; high risk of accidental leaks |
| **Level 1** | Tools present but manual | 🟡 Medium | Can run via npm scripts manually; risk of forgetting |
| **Level 2** | pre-commit automated | 🟢 Low | Auto-check on commit; safe (recommended) |

**Note:** AI pushes are fully blocked. Before pushing, run `@actions/01_git_push.md` for a strict manual check.

---

## 🔍 Diagnosis items

Check the following items in order:

1. **Presence of docs-structure**
   - Confirm `docs/notes/` and `docs/letters/` directories exist
   - Determine if this is an environment where AI generates documents

2. **secretlint installation status**
   - Check with `npx secretlint --version`
   - Or check `package.json` devDependencies

3. **gitleaks installation status**
   - Check with `gitleaks version`
   - Or check with `./bin/gitleaks version` (Docker environment)

4. **npm scripts configuration**
   - Does `package.json` have a `secret-scan` script?
   - Is a manual execution command set up?

5. **husky pre-commit hook configuration**
   - Does `.husky/pre-commit` file exist?
   - Does it include secretlint and gitleaks?

---

## Steps

1. Diagnose the environment
   - Execute each diagnosis item above in order
   - Record the result of each item

2. Determine the level
   - **Level 0:** docs-structure present, tools not installed
   - **Level 1:** secretlint/gitleaks present, but husky not configured
   - **Level 2:** husky pre-commit auto-check configured

3. Report diagnosis results
   ```
   🔒 Security Readiness Diagnosis

   Current level: Level X (Risk: High / Medium / Low)

   ✅ or ❌ docs-structure installed
   ✅ or ❌ secretlint installed
   ✅ or ❌ gitleaks installed
   ✅ or ❌ npm scripts configured
   ✅ or ❌ pre-commit hook configured
   ```

4. Present improvement suggestions (for Level 0 or 1)
   - **Level 0:**
     - Strongly recommend installing secretlint + gitleaks
     - Provide reference to the secrets scan setup guide

   - **Level 1:**
     - Recommend configuring pre-commit hook
     - Provide husky + lint-staged setup steps

   - **Level 2:**
     - Report "Perfect! Safe to develop."

5. Guide next steps
   - Recommend Level 1 or higher before using testing or refactoring actions
   - Confirm with the user if security tools need to be installed

---

## 📚 References

### Secrets scan setup guide

If introducing secretlint + gitleaks to the project, refer to:

- Phase 1: Initial scan (understand current state)
- Phase 2: Manual operation (npm scripts)
- Phase 3: pre-commit automation (husky)
- Phase 4: Personal setup (optional installation)

See `docs/notes/` for a "Secrets Scan Setup Guide" if one exists.

---

## Recommended timing

- **At project start** - Confirm environment first
- **Before using testing or refactoring actions** - Verify safety
- **When a new member joins** - Confirm the setup
- **Anytime you feel uncertain** - Run it whenever

---

## Diagnosis flowchart

```
Start
 ↓
docs-structure present? → No → Below Level 0 (out of scope)
 ↓ Yes
secretlint/gitleaks installed? → No → Level 0 (high risk)
 ↓ Yes
husky pre-commit configured? → No → Level 1 (medium risk)
 ↓ Yes
Level 2 (low risk) ✅
```
