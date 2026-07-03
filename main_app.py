```yaml
# .github/workflows/ai_pipeline.yml
name: AI Pipeline

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
      - run: npm install
      - name: Build
        run: npm run build

  unit-tests:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v2
      - name: Run Unit Tests
        run: npm test

  lint:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v2
      - name: Run Lint
        run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v2
      - name: Type Check
        run: npm run type-check

  security-scan:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v2
      - name: Security Scan
        run: npm run security-scan

# .github/workflows/pr_review.yml
name: PR Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  pr-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run PR Review
        run: node scripts/github/review-pr.js
```

```js
// scripts/github/review-pr.js
const { execSync } = require('child_process');

function runCommand(command) {
  try {
    return execSync(command, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    console.error(`Error running command: ${command}\n${error}`);
    return null;
  }
}

function main() {
  const qualityScore = require('./quality-score.js');
  const archValidator = require('./architecture-validator.js');
  const sprintValidator = require('./sprint-validator.js');
  const docsValidator = require('./documentation-validator.js');

  // Run various checks
  const architectureCheck = archValidator();
  const sprintCheck = sprintValidator();
  const docsCheck = docsValidator();

  const score = qualityScore.calculate();

  console.log('## AI Review');
  console.log(`Architecture: ${architectureCheck ? '✅' : '❌'}`);
  console.log(`Sprints: ${sprintCheck ? '✅' : '❌'}`);
  console.log(`Documentation: ${docsCheck ? '✅' : '❌'}`);
  console.log(`Overall Score: ${score}/100`);
  console.log('Recommendation:');
  console.log(score >= 90 && architectureCheck && sprintCheck && docsCheck ? 'Merge Ready' : 'Needs Review');
}

main();
```

```js
// scripts/github/quality-score.js
module.exports = {
  calculate: function () {
    // Dummy calculation, replace with actual logic
    return 96;
  }
};
```

```js
// scripts/github/architecture-validator.js
module.exports = function () {
  // Dummy validation, replace with actual logic
  return true;
};
```

```js
// scripts/github/sprint-validator.js
module.exports = function () {
  // Dummy validation, replace with actual logic
  return true;
};
```

```js
// scripts/github/documentation-validator.js
module.exports = function () {
  // Dummy validation, replace with actual logic
  return true;
};
```
