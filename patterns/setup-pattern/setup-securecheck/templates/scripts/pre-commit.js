const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running pre-commit checks...');

const LOG_FILE = path.join(process.cwd(), '.logs', 'pre-commit.log');
const MAX_LOG_ENTRIES = 50;

function getBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    return 'unknown';
  }
}

function writeLog(result) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    result,
    branch: getBranch()
  });

  const logsDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  let entries = [];
  if (fs.existsSync(LOG_FILE)) {
    entries = fs.readFileSync(LOG_FILE, 'utf8')
      .split('\n')
      .filter(line => line.trim());
  }

  entries.push(entry);
  if (entries.length > MAX_LOG_ENTRIES) {
    entries = entries.slice(entries.length - MAX_LOG_ENTRIES);
  }

  fs.writeFileSync(LOG_FILE, entries.join('\n') + '\n');
}

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

try {
  console.log('\n=== secretlint ===');

  // staged ファイルのみをスキャン（gitleaks --staged と対称）
  const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
    .split('\n').map(s => s.trim()).filter(Boolean);

  if (staged.length === 0) {
    console.log('ステージされたファイルがないため secretlint をスキップします');
  } else {
    // Windows のコマンドライン長制限を避けるため 100 件ずつ分割
    for (const files of chunk(staged, 100)) {
      execSync(`npx secretlint ${files.map(f => `"${f}"`).join(' ')}`, { stdio: 'inherit' });
    }
  }

  console.log('\n=== gitleaks ===');

  // Find gitleaks binary: ./bin/gitleaks → global gitleaks → skip
  const isWindows = process.platform === 'win32';
  const binaryName = isWindows ? 'gitleaks.exe' : 'gitleaks';
  const localBinary = path.join(process.cwd(), 'bin', binaryName);

  let gitleaksCommand = null;

  if (fs.existsSync(localBinary)) {
    gitleaksCommand = `"${localBinary}" protect --staged --config gitleaks.toml`;
  } else {
    try {
      execSync('gitleaks version', { stdio: 'pipe' });
      gitleaksCommand = 'gitleaks protect --staged --config gitleaks.toml';
    } catch (e) {
      // gitleaks not found
    }
  }

  if (gitleaksCommand) {
    execSync(gitleaksCommand, { stdio: 'inherit' });
  } else {
    console.log('⚠️  gitleaks not found — secretlint のみでコミットを続行します');
    console.log('    gitleaks を導入するには: node scripts/install-gitleaks.js');
  }

  writeLog('passed');
  console.log('\n✅ All checks passed');
  process.exit(0);
} catch (e) {
  writeLog('failed');
  console.error('\n❌ Pre-commit checks failed');
  process.exit(1);
}
