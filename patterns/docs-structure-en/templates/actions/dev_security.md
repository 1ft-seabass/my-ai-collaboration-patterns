# Security Check

Check the specified scope (or the whole project) from a security perspective.

## What to do

- Identify dangerous areas
- Explain why each is dangerous
- Suggest a direction for addressing it

## Perspectives

### Secrets management
- Are API keys, tokens, or passwords leaking into code or public locations?
- Are environment variables handled properly?
- Is the .env file included in .gitignore?

### Input validation
- Is user input used directly without validation?
- Is validation appropriate?
- Is sanitization needed?

### Database
- Is there a risk of SQL injection?
- Are prepared statements used?

### Authentication & authorization
- Are there authentication gaps?
- Are permission checks appropriate?
- Is session management safe?

### Other
- Is CORS configured correctly?
- Is there a risk of XSS (Cross-Site Scripting)?
- Is there CSRF (Cross-Site Request Forgery) protection?

## Output format

Include severity (high / medium / low), reason, and direction for addressing.

Example:
```
[High] File A: Environment variable hardcoded
Reason: API key could be exposed
Fix: Move to .env and add to .gitignore

[Medium] File B: User input embedded directly in HTML
Reason: XSS risk
Fix: Add sanitization
```

## Do NOT do

- Modify code (findings only)
- Demand excessive security (stay within realistic scope)

## Next steps

Record check results in notes; prioritize and address accordingly.
