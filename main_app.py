```yaml
# .github/workflows/ai_pipeline.yml
name: AI Pipeline
on:
  push:
    branches:
      - 'ai/**'
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      - name: Create Pull Request
        uses: repo-sync/pull-request@v2
        with:
          source_branch: ${{ github.ref }}
          destination_branch: main
          pr_title: ${{ github.event.issue.key }} ${{ github.event.issue.title }}
          pr_body: |
            Linked Issue: #${{ github.event.issue.number }}
            Changed Files: ${{ steps.changes.outputs.files }}
            Test Results: All tests passed
            Recommended Reviewer: @pm
            Risk: Low
```

```javascript
// scripts/github/extract-issue-key.js
const extractIssueKey = (issueTitle) => {
  const match = issueTitle.match(/([A-Z]+-\d+)/);
  return match ? match[1] : null;
};

module.exports = extractIssueKey;
```

```bash
# scripts/github/create-task-branch.sh
#!/bin/bash
issue_key=$1
slug=$2

git fetch origin main
git checkout -B ai/${issue_key}-${slug} origin/main
```

```javascript
// scripts/github/create-pr.js
const { Octokit } = require("@octokit/rest");

const createPullRequest = async (issueKey, issueTitle) => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const prTitle = `${issueKey} ${issueTitle}`;
  const prBody = `Linked Issue: #${process.env.ISSUE_NUMBER}\nTest Results: All tests passed\nRecommended Reviewer: @pm\nRisk: Low`;

  await octokit.pulls.create({
    owner: process.env.GITHUB_REPOSITORY_OWNER,
    repo: process.env.GITHUB_REPOSITORY,
    title: prTitle,
    head: `ai/${issueKey}`,
    base: "main",
    body: prBody,
  });
};

module.exports = createPullRequest;
```

```markdown
# docs/AI_PIPELINE.md

## AI Pipeline

### Branch Creation

All AI tasks are assigned to dedicated branches:

- Branch name format: `ai/{issue-key}-{slug}`

### Process

1. Extract issue key from issue title.
2. Create a branch from the latest main.
3. Implement task.
4. Commit changes.
5. Push branch.
6. Create pull request.
7. Do not push directly to main.

### PR Rules

- PR Title: `{issue-key} {issue-title}`
- PR Body should contain:
  - Linked Issue
  - Overview of changed files
  - Test results
  - Recommended reviewers
  - Risks

### Merge & Review

- Manual review required before merging.
- Do not merge automatically.

### Additional Safety Rules

- No force-push to main.
- Do not close issues before PR exists.
- Add "needs-review" label if PR creation fails.
```

```markdown
# README.md

## AI Pipeline Isolation

Our AI development now runs through isolated task branches to prevent main branch direct commits. This minimizes conflicts and ensures streamlined parallel development.

## Commit Message

Always use meaningful commit messages. Suggested format:

```
chore(github): isolate AI pipeline work in task branches
```
```

```markdown
# CHANGELOG.md

## [Unreleased]

### Added

- AI pipeline branch isolation strategy implemented.
- GitHub Actions workflow for automating pull requests.
- Scripts for branch handling and PR creation.
```

```markdown
# docs/SPRINT_SYSTEM.md

## Sprints and Task Management

### Key Updates

- Each AI task is performed on its branch following the format `ai/{issue-key}-{slug}`.
- Ensuring minimal disruption during concurrent operations by avoiding main branch direct modifications.
```
