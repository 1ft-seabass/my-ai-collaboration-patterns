# docs-structure-en pattern

> **🤖 One-shot prompt for AI (copy & paste)**
>
> ```
> https://github.com/1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure-en
> I want to set up this structure. Let's fetch it with npx degit.
>
> Place the files under templates/ directly inside docs/, not as a templates/ folder.
>
> Expected result:
>   docs/
>     ├── README.md
>     ├── actions/
>     ├── letters/
>     ├── notes/
>     └── tasks/
>
> Avoid (do NOT create these):
>   docs/templates/  ← do not create a templates folder
>   templates/       ← do not place files under a folder named templates
>
> Customize after the project matures and requirements become clear.
> At the start, use the templates as-is without project-specific customization.
> ```

## 🔄 Updating an existing docs-structure to the latest version

If you already have docs-structure installed and want to update templates/ to the latest:

> **🤖 One-shot prompt for AI (copy & paste)**
>
> ```
> https://github.com/1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure-en
> I want to update the existing docs/ folder to the latest version.
>
> Steps:
> 1. Verify this project uses docs-structure
>    - Does docs/notes/ exist?
>    - Does docs/letters/ exist?
>    - Does docs/actions/ exist?
>    - If not, report an error and stop
>
> 2. Fetch the latest version to a temp directory
>    - `npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure-en/templates /tmp/latest-docs-structure`
>    - Confirm successful fetch
>
> 3. Show diffs against the current templates/
>    - diff docs/README.md vs /tmp/latest-docs-structure/README.md
>    - diff each file under docs/actions/
>    - diff docs/notes/README.md, TEMPLATE.md
>    - diff docs/letters/README.md, TEMPLATE.md
>    - diff docs/tasks/README.md, TEMPLATE.md
>    - List newly added files
>    - List files to be removed
>
> 4. Present a diff summary to the user
>    - Number of changed files
>    - Number of added files
>    - Number of removed files
>    - Summary of key changes
>    - **Ask "Shall I apply this diff?"**
>
> 5. Apply updates after approval
>    - Overwrite only changed files
>    - Add new files
>    - For removed files: **confirm with the user individually** before deleting
>    - Remove /tmp/latest-docs-structure/
>
> Notes:
> - Existing documents in notes/, letters/, tasks/ are preserved
> - TEMPLATE.md and README.md will be overwritten
> - Files under actions/ will be overwritten
> - Back up customized files before updating
> - Reviewing the diff lets you understand what changes before applying
> ```

**After updating:**
- Read `docs/README.md` to confirm the latest structure
- Run `@actions/help.md` to quickly check the latest usage

---

Document management structure optimized for AI collaboration

## 📦 About this pattern

Provides a document structure that allows AI assistants to efficiently search and understand information in AI-collaborative development.

### Problems it solves

- **Scattered information**: Documents spread around, hard for AI to find
- **Context loss**: Work context not carried over between sessions, requiring re-explanation every time
- **Inconsistent structure**: Different structure per project confuses the AI

### Features

- **README-driven**: README.md in every directory so AI can navigate without getting lost
- **Layered knowledge management**: Handoffs, dev notes, and ADRs clearly separated
- **Templates included**: Ready-to-use templates for handoffs and notes
- **AI-optimized**: Shallow 3-4 level hierarchy, unified naming convention

## 🚀 Usage

### Get with degit (recommended)

**Important**: Specify the `templates` directory. The document structure used in your project is under `templates`, not the pattern root.

```bash
npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure-en/templates ./docs
```

### Git Clone

```bash
git clone https://github.com/1ft-seabass/my-ai-collaboration-patterns.git
cp -r my-ai-collaboration-patterns/patterns/docs-structure-en/templates/* ./docs/
```

### Have AI read it

After placing in your project, tell the AI assistant at session start:

```
"Read docs/README.md and check the latest handoff."
```

## 📂 Created structure

A **minimal 4-folder** structure effective for early-stage agile development.

```
docs/
├── README.md                           # Document index
├── actions/                            # Task automation instructions
│   ├── README.md
│   └── (multiple action files .md)    # Per-task instruction files
├── letters/                           # Handoffs (chronological)
│   ├── README.md
│   └── TEMPLATE.md                    # Handoff template
├── notes/                             # Dev notes (trial & error)
│   ├── README.md
│   └── TEMPLATE.md                    # Note template
└── tasks/                             # Task management
    ├── README.md
    └── TEMPLATE.md                    # Task template
```

### Folders you can add as the project grows

Add these when letters and notes have accumulated:

- `ai-collaboration/` - AI collaboration guide
- `architecture/` - Architecture design / ADR
- `development/` - Development guide / best practices
- `spec/` - Specifications

**Important**: Unused folders confuse both AI and humans.

## 🎯 Usage examples

### At session start

```
"Read docs/README.md and check the latest handoff."
```

### At session end

```
"Record today's work as a handoff in docs/letters/."
```

### After solving a technical problem

```
"Record the trial and error in docs/notes/."
```

## 📖 Core concepts

### actions — Task automation instructions

Save repeated tasks as instruction files and call them with `@actions/filename.md` to have AI execute them automatically.

**Provided actions:**
- Git operations, knowledge summaries, session start, and more
- See `actions/README.md` for details

**Effect:**
- **Token reduction**: ~70% (measured)
- **Time savings**: No back-and-forth confirmation
- **Consistency**: Same quality every time

### 4 folder types

| Type | Purpose | When to use |
|------|---------|-------------|
| **actions** | Task automation instructions | Repeated tasks |
| **letters** | Session handoffs | At session end |
| **notes** | Trial & error records | After solving hard problems |
| **tasks** | Task management | Tasks spanning multiple sessions |

### README-driven navigation

By placing README.md in every directory:
- AI can find target documents without getting lost
- Humans can understand the structure easily
- Clear placement for new documents

### One-file-one-insight principle

- **1 file = 1 insight** (50-150 lines as a guide)
- **Keep independent** (understandable on its own)
- **MECE** (mutually exclusive, collectively exhaustive)

## 💡 Operation tips

### Session start habits

1. Check the latest handoff
2. Review relevant dev notes
3. Plan the work

### Session end habits

1. Create a handoff (using TEMPLATE.md)
2. Record completed tasks, in-progress tasks, and notes
3. State priorities for the next session clearly

### Accumulating knowledge

- **Trial & error records** → notes/
- **Repeated tasks** → actions/
- **As needed** → add architecture/, development/, spec/, etc.

## 🔗 Related patterns

- [server-management](../server-management/) - Server management scripts (manageable with this document structure)
- [prompt-engineering](../prompt-engineering/) - Prompt design (Coming Soon)
- [docs-structure-for-branch](../setup-pattern/docs-structure-for-branch/) - Initialize branch-specific document structure (for feature branch work)

## 📚 Detailed documentation

For detailed usage and customization:
- [GUIDE.md](./GUIDE.md) - Supplementary guide for AI (read after degit)
- [examples/](./examples/) - Concrete usage examples

## 🛠️ Customization

This pattern provides a general structure, but can be customized per project:

### Adding directories

```bash
# Example: Add API documentation
mkdir -p docs/api
echo "# API Documentation" > docs/api/README.md
```

### Adding categories

```bash
# Example: Add a category to best-practices
mkdir -p docs/development/best-practices/frontend
echo "# Frontend Best Practices" > docs/development/best-practices/frontend/README.md
```

## ⚡ Effect

### Before

- Repeat the same explanation every session
- Past trial & error is forgotten
- AI can't find information and asks many questions

### After

- Immediately restore context from handoffs
- Reference past knowledge from notes
- AI explores information autonomously

## 📊 Metrics

Effect in actual projects (reference values):
- Session start time: **10 min → 2 min** (80% reduction)
- Context-explanation questions: **5-10 → 0-1** (90% reduction)
- Knowledge reuse: **~0 → 3-5 times/month**

## 🙋 FAQ

**Q: Can I introduce this into an existing project?**
A: Yes. Migrate existing documents to the new structure and adopt it gradually.

**Q: Is it useful for small projects?**
A: Yes. Especially effective for development spanning multiple sessions.

**Q: Can it be used for team development?**
A: Yes. Handoffs can also serve as developer-to-developer handoffs.

**Q: Are templates mandatory?**
A: Recommended but optional. Structural consistency helps AI understanding.

## 📝 License

MIT License — free to use, modify, and distribute.

---

**This pattern in action**: This repository itself uses this pattern in `docs/` (dogfooding).
