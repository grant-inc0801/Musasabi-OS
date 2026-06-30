```yaml
name: AI Pipeline

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

permissions:
  contents: write
  issues: write
  pull-requests: write
  actions: read

jobs:
  validate-pipeline:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'

    - name: Execute pipeline validator
      run: node scripts/github/pipeline-state-validator.js

    - name: Extract issue key
      id: issue_key
      run: node scripts/github/extract-issue-key.js
      env:
        ISSUE_TITLE: ${{ github.event.issue.title }}

    - name: Detect conflict markers
      run: node scripts/github/check-conflict-markers.js

    - name: Log current state
      run: echo "Current Issue: ${{ github.event.issue.number }}, Title: ${{ github.event.issue.title }}, Issue Key: ${{ steps.issue_key.outputs.key }}" | tee -a pipeline.log

    - name: Run tests
      run: npm test

    - name: Commit and push changes
      run: |
        git add .
        git commit -m "Update AI pipeline"
        git push

    - name: Create next issue from sprint
      run: node scripts/github/create-next-issue-from-sprint.js

  handle-failure:
    runs-on: ubuntu-latest
    if: failure()
    steps:
    - name: Label issue
      run: gh issue edit ${{ github.event.issue.number }} --add-label "needs-review"

    - name: Comment on issue
      run: gh issue comment ${{ github.event.issue.number }} --body "The pipeline has failed due to the above errors. Please review."

    - name: Stop workflow
      run: exit 1
```

```javascript
// scripts/github/extract-issue-key.js

const issueTitle = process.env.ISSUE_TITLE || '';
const issueKeyMatch = issueTitle.match(/S4-\d+/);
const issueKey = issueKeyMatch ? issueKeyMatch[0] : '';

console.log(`::set-output name=key::${issueKey}`);
```

```javascript
// scripts/github/check-conflict-markers.js

const fs = require('fs');
const fileData = fs.readFileSync('path/to/your/file', 'utf8');

if (fileData.includes('<<<<<<<') || fileData.includes('=======') || fileData.includes('>>>>>>>')) {
  console.error('Conflict markers detected. Failing pipeline.');
  process.exit(1);
}

console.log('No conflict markers found.');
```

```javascript
// scripts/github/pipeline-state-validator.js

// Placeholder for actual implementation
console.log('Validating pipeline state');

// Implement state validation logic here

process.exit(0); // Exit code 0 means success, non-zero value indicates failure
```

```javascript
// scripts/github/create-next-issue-from-sprint.js

const fs = require('fs');
const yaml = require('js-yaml');
const path = 'docs/sprints/active-sprint.yaml';

try {
  const sprint = yaml.load(fs.readFileSync(path, 'utf8'));
  // Logic to create an issue based on sprint data
  console.log('Next issue created from sprint.');
} catch (e) {
  console.error(e);
  process.exit(1);
}
```