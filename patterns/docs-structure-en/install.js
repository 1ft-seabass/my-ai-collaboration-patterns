#!/usr/bin/env node

// Deterministic installer for docs-structure-en: safely merges into an existing project.
// Depends on neither package.json nor git (docs-structure-en is just fs operations in Node.js).
//
// Usage:
//   npx degit 1ft-seabass/my-ai-collaboration-patterns/patterns/docs-structure-en ./tmp/docs-structure-install --force
//   node ./tmp/docs-structure-install/install.js
//   rm -rf ./tmp/docs-structure-install

const fs = require('fs');
const path = require('path');

// Copy source is templates/, fetched together with install.js itself via degit.
// Resolving via __dirname (not process.cwd()) means this script always finds the
// templates/ next to it, regardless of where it's invoked from.
const SRC_DIR = path.join(__dirname, 'templates');
const DEST_DIR = path.join(process.cwd(), 'docs');

console.log('docs-structure-en install');
console.log('==========================\n');

if (!fs.existsSync(SRC_DIR)) {
  console.error(`❌ Templates not found: ${SRC_DIR}`);
  console.error('   install.js must be placed in the same directory as templates/.');
  console.error('   Make sure you fetched the whole patterns/docs-structure-en directory via degit.');
  process.exit(1);
}

// Guard against wrong-directory accidents: print the resolved absolute destination
// path before writing anything. install.js is fetched once and discarded after use,
// so it has no fixed installed location to compare against (unlike setup-securecheck's
// cli.js cwd guard). Printing the resolved path is the safety net instead.
console.log(`Source:      ${SRC_DIR}`);
console.log(`Destination: ${DEST_DIR}\n`);

const destExistedBefore = fs.existsSync(DEST_DIR);

// Copy file-by-file, skipping anything that already exists (never overwrite).
// Checking only directory existence would misclassify an empty dir (created but not yet
// filled, e.g. after an interrupted run) as "already installed", so every file is checked
// individually. This single function naturally covers both new installs and resuming an
// interrupted one.
function copyRecursiveSkipExisting(srcDir, destDir) {
  let created = 0;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(srcDir, entry.name);
    const d = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      created += copyRecursiveSkipExisting(s, d);
    } else if (fs.existsSync(d)) {
      console.log(`  SKIP   ${path.relative(process.cwd(), d)} (already exists)`);
    } else {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
      created++;
      console.log(`  CREATE ${path.relative(process.cwd(), d)}`);
    }
  }
  return created;
}

fs.mkdirSync(DEST_DIR, { recursive: true });
const createdCount = copyRecursiveSkipExisting(SRC_DIR, DEST_DIR);

console.log('');
if (createdCount === 0 && destExistedBefore) {
  // Every file already existed, so nothing was created. This script can't tell whether
  // that means "already up to date" or "stale version" — that's a judgment call, so stop
  // here and point to the judgment-tier update flow instead of guessing.
  console.log('Found existing files (nothing was created this run).');
  console.log('Your docs/ may be on an older version. To update, use the instructions in');
  console.log('patterns/docs-structure-en/README.md under "Updating an existing docs-structure to the latest version".');
} else if (!destExistedBefore) {
  console.log(`✅ Created ${createdCount} new files.`);
} else {
  console.log(`✅ Resumed an interrupted install: filled in ${createdCount} missing files.`);
}
