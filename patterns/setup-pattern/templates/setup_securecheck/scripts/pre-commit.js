const { execSync } = require('child_process');

console.log('Running pre-commit checks...');

try {
  console.log('\n=== lint-staged (secretlint) ===');
  execSync('npx lint-staged', { stdio: 'inherit' });

  console.log('\n=== gitleaks ===');
  execSync('npx gitleaks protect --staged', { stdio: 'inherit' });

  console.log('\n✅ All checks passed');
  process.exit(0);
} catch (e) {
  console.error('\n❌ Pre-commit checks failed');
  process.exit(1);
}
