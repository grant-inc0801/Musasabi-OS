```javascript
// scripts/github/close-stale-ai-issues.js

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function closeStaleAIIssues() {
    const owner = "your-repo-owner";
    const repo = "your-repo-name";

    const { data: issues } = await octokit.issues.listForRepo({
        owner,
        repo,
        labels: "AIタスク,ムササビオス,ai-task,musasabi-os",
        state: "open"
    });

    for (const issue of issues) {
        const { data: comments } = await octokit.issues.listComments({
            owner,
            repo,
            issue_number: issue.number
        });
        
        const completedComment = comments.find(comment =>
            comment.body.includes("ワークフロー完了")
        );

        if (completedComment && !issue.labels.some(l => l.name === "needs-review")) {
            await octokit.issues.createComment({
                owner,
                repo,
                issue_number: issue.number,
                body: "このAIタスクは完了していると思われるため、クリーンアップによってクローズされます。"
            });

            await octokit.issues.update({
                owner,
                repo,
                issue_number: issue.number,
                state: "closed",
                labels: [...issue.labels.map(l => l.name), "completed"]
            });
        }
    }
}

closeStaleAIIssues().catch(err => console.error(err));
```

```yaml
# .github/workflows/ai-pipeline.yml

name: AI Pipeline

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Run AI Task
        run: ./run-ai-task.sh

      - name: Test
        run: npm test

      - name: Close Completed AI Issue
        if: success()
        run: |
          ISSUE_NUMBER=$(jq -r '.issue.number' $GITHUB_EVENT_PATH)
          LABELS=$(jq -r '.issue.labels | map(.name) | join(",")' $GITHUB_EVENT_PATH)

          if [[ $LABELS != *"needs-review"* ]]; then
            gh issue comment $ISSUE_NUMBER --body 'Successfully completed. Closing issue.'
            gh issue edit $ISSUE_NUMBER --state closed --add-label 'completed'
          fi

      - name: Handle Failure
        if: failure()
        run: |
          ISSUE_NUMBER=$(jq -r '.issue.number' $GITHUB_EVENT_PATH)
          gh issue comment $ISSUE_NUMBER --body 'Task failed. Needs review.'
          gh issue edit $ISSUE_NUMBER --add-label 'needs-review'
```

```markdown
# README.md
## AI Pipeline Automation

This project includes a GitHub Actions workflow to automatically close issues for completed AI tasks.

# CHANGELOG.md
## [Unreleased]
### Fixed
- Automatically close completed AI issues in the AI pipeline.

# docs/AI_PIPELINE.md
## Pipeline Automation

The AI pipeline ensures completed tasks are automatically closed to manage issue backlog efficiently. It uses GitHub Actions to achieve this automation.
```
