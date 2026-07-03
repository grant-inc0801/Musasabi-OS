```yaml
name: AI Pipeline Review Gate

on:
  issues:
    types:
      - labeled

jobs:
  review_gate:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run review script
      run: node scripts/github/review-gate.js ${{ github.event }}

scripts/github/review-gate.js
const { execSync } = require('child_process');
const fs = require('fs');
const github = require('@actions/github');

const context = github.context;
const token = process.env.GITHUB_TOKEN;

const secretPatterns = [
  'OPENAI_API_KEY', 
  'ANTHROPIC_API_KEY', 
  'ZOOM_CLIENT_SECRET', 
  'FILEMAKER_PASSWORD', 
  'sk-', 
  'ghp_', 
  'github_pat_'
];

function summarize(issue) {
  const summaries = [];
  if (!testsPass()) summaries.push('Tests not passed');
  if (hasConflictMarkers()) summaries.push('Contains merge conflict markers');
  if (hasSecrets(issue)) summaries.push('Contains exposed secret information');
  if (!docsUpdated()) summaries.push('Documentation not updated');
  if (!acceptanceCriteriaChecked()) summaries.push('Acceptance criteria not checked');
  if (!filesChangedReported()) summaries.push('Modified files not reported');
  if (!commitsProposed()) summaries.push('No proposed commits');

  return summaries;
}

function approve() {
  execSync(`gh issue close ${context.issue.number}`);
  createNextIssue();
  execSync(`gh issue edit ${context.issue.number} --remove-label review-pending`);
}

function reject() {
  execSync(`gh issue edit ${context.issue.number} --add-label needs-review`);
}

function testsPass() {
  return true; // Stub for test validation logic
}

function hasConflictMarkers() {
  const diff = execSync('git diff --cached').toString();
  return diff.includes('<<<<<<<') || diff.includes('>>>>>>>');
}

function hasSecrets(issue) {
  const body = issue.body;
  return secretPatterns.some(pattern => body.includes(pattern));
}

function docsUpdated() {
  const files = ['README.md', 'CHANGELOG.md', 'docs/AI_PIPELINE.md', 'docs/SPRINT_SYSTEM.md'];
  return files.some(file => fs.existsSync(file) && fs.statSync(file).mtimeMs > Date.now() - 86400000);
}

function acceptanceCriteriaChecked() {
  return true; // Stub for acceptance criteria check
}

function filesChangedReported() {
  return true; // Stub for modified file reporting check
}

function commitsProposed() {
  return true; // Stub for proposed commit check
}

function createNextIssue() {
  // Logic to create the next issue based on Sprint.yaml
}

function validate(issue) {
  const summaries = summarize(issue);
  if (summaries.length > 0) {
    execSync(`gh issue comment ${context.issue.number} --body "${summaries.join('\n')}"`);
    execSync(`gh issue edit ${context.issue.number} --add-label review-pending`);
    process.exit(1);
  }
}

switch (true) {
  case context.payload.action === 'labeled' && context.payload.label.name === 'review-approved':
    approve();
    break;
  case context.payload.action === 'labeled' && context.payload.label.name === 'review-rejected':
    reject();
    break;
  default:
    validate(context.payload.issue);
}
```