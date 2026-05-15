Run a final check before pushing in this session.

## Checklist

1. Secrets check in documents (most important)
   - Target: full diff from `git diff --cached` (all files regardless of folder or branch structure)
   - Files that AI may have generated in this session
   - Check that none of the following are present:
     * API key patterns: sk-, pk-, AIza, ghp_, xoxb-, AKIA
     * Passwords, tokens, secrets
     * Database connection strings (with real credentials)
     * Private URLs, IP addresses
     * Real email addresses
     * JWT tokens (starting with eyJ)

2. Confirm .gitignore protection
   - Are .env, .env.local, credentials.json, etc. excluded?
   - Are there any newly added files that contain secrets?

3. Review git diff
   - Scan the full commit content
   - Detect dangerous patterns with regex

## Exclusions (these are OK)

- Placeholders: `YOUR_API_KEY`, `***`, `sk-...`
- Email addresses with example.com, test.com
- Terms in explanatory text (e.g., "set your API key")

## Steps

1. Get the changes with `git diff --cached`
2. Closely inspect newly added files
3. Report detected issues with specifics (filename, line number, severity)
4. Explicitly report "safe" if no issues found

## Report format

When issues are found:
- 📄 Filename
- Line X: Issue type
- Relevant content (partially masked)
- Severity (high / medium / low)

When no issues:
"✅ Security check complete. Safe to push."

## Push execution

After the check, get user approval before executing the push.
