```javascript
// scripts/github/issue-title-normalizer.js
const fs = require('fs');
const yaml = require('js-yaml');

function getSprintKeys() {
    let keys = [];
    const sprintFiles = fs.readdirSync('docs/sprints/');
    sprintFiles.forEach(file => {
        const content = yaml.load(fs.readFileSync(`docs/sprints/${file}`, 'utf8'));
        keys = keys.concat(Object.keys(content));
    });
    return keys;
}

function normalizeIssueTitle(issueTitle, sprintKeys) {
    const invalidPrefixes = ['[NEXT]', '【次へ】', '次へ', 'Next'];
    if (invalidPrefixes.some(prefix => issueTitle.startsWith(prefix))) {
        return null;
    }
    const titleParts = issueTitle.split(' ');
    const sprintKey = titleParts.find(part => sprintKeys.includes(part));
    if (!sprintKey) {
        return null;
    }
    return `${sprintKey} ${titleParts.slice(1).join(' ')}`;
}

const sprintKeys = getSprintKeys();
const issueTitle = process.argv[2];
const normalizedTitle = normalizeIssueTitle(issueTitle, sprintKeys);

console.log(normalizedTitle || 'Invalid issue title');
```

```javascript
// scripts/github/validate-issue-title.js
const { execSync } = require('child_process');

function validateTitle(issueTitle) {
    try {
        const result = execSync(`node scripts/github/issue-title-normalizer.js "${issueTitle}"`).toString();
        return result.trim() !== 'Invalid issue title';
    } catch {
        return false;
    }
}

const issueTitle = process.argv[2];
const isValid = validateTitle(issueTitle);

console.log(isValid ? 'Valid title' : 'Invalid title');
```

```javascript
// scripts/github/create-next-issue-from-sprint.js
const fs = require('fs');
const yaml = require('js-yaml');

function getSprintTasks() {
    const sprintFiles = fs.readdirSync('docs/sprints/');
    let tasks = [];
    sprintFiles.forEach(file => {
        const content = yaml.load(fs.readFileSync(`docs/sprints/${file}`, 'utf8'));
        tasks = tasks.concat(Object.entries(content).map(([key, title]) => ({ key, title })));
    });
    return tasks;
}

function generateIssueTitle(sprintTask) {
    return `${sprintTask.key} ${sprintTask.title}`;
}

const sprintTasks = getSprintTasks();
console.log(sprintTasks.map(generateIssueTitle));
```

```javascript
// scripts/github/cleanup-invalid-ai-issue-titles.js
const { execSync } = require('child_process');
const axios = require('axios');

async function labelInvalidIssues(repo, token) {
    const issues = await axios.get(`https://api.github.com/repos/${repo}/issues`, {
        headers: { Authorization: `token ${token}` }
    });

    issues.data.forEach(issue => {
        const isValid = validateTitle(issue.title);
        if (!isValid) {
            axios.post(`https://api.github.com/repos/${repo}/issues/${issue.number}/labels`, ['invalid-ai-title'], {
                headers: { Authorization: `token ${token}` }
            });
            axios.post(`https://api.github.com/repos/${repo}/issues/${issue.number}/comments`, {
                body: 'This issue has an invalid title prefix.'
            }, {
                headers: { Authorization: `token ${token}` }
            });
        }
    });
}

labelInvalidIssues(process.argv[2], process.argv[3]);
```

```markdown
<!-- docs/AI_PIPELINE.md -->
# AI Pipeline Documentation

## Issue Title Standardization

To ensure consistency in AI-generated GitHub issue titles, we follow a standardized format using Sprint keys extracted from YAML and JSON files located in specific directories.

- **Format**: `S{number}-{task_number} Title`
- **Invalid Prefixes**: Titles starting with `[NEXT]`, `【次へ】`, `次へ`, or `Next` are not allowed.

Scripts provided:
- **Normalization**: Identify and normalize issue titles ensuring compliance with the format.
- **Validation**: Pre-check titles before GitHub issue creation.
- **Cleanup**: Manage existing issues with invalid titles by labeling them and providing comments.

## Scripts

- **issue-title-normalizer.js**: Normalizes and validates issue titles.
- **validate-issue-title.js**: Validates title format before issue creation.
- **create-next-issue-from-sprint.js**: Generates new issue titles based on Sprint tasks.
- **cleanup-invalid-ai-issue-titles.js**: Tags and comments on issues with invalid prefixes.

Ensure all issue titles conform to the Sprint key format to streamline the tracking process. Invalid titles are rejected or labeled appropriately.
```

```markdown
<!-- README.md -->
# Repository README

## GitHub Issue Management

This repository includes scripts for managing GitHub issue titles standardized around Sprint keys, ensuring easier sprint tracking.

- **Scripts**: Access scripts in the `scripts/github` directory for normalizing and validating issue titles.
- **Sprint Tasks**: Titles generated must follow a set format located in specified sprint definition files.

Refer to `docs/AI_PIPELINE.md` for a detailed overview of the implemented scripts and procedures.

## How to Run

1. **Normalization**: Run `node scripts/github/issue-title-normalizer.js "Your Issue Title"`.
2. **Validation**: Confirm titles by running `node scripts/github/validate-issue-title.js "Your Issue Title"`.
3. **Generate Titles**: Execute `node scripts/github/create-next-issue-from-sprint.js`.
4. **Cleanup**: Use `node scripts/github/cleanup-invalid-ai-issue-titles.js REPO_NAME GITHUB_TOKEN` for managing invalid existing titles.
```

```markdown
<!-- CHANGELOG.md -->
# Changelog

## [Unreleased]

### Added
- Script to normalize and validate AI-generated GitHub issue titles.
- Script for creating issue titles from Sprint tasks.
- Cleanup script for managing existing issues with invalid titles.
- Documentation on issue title standardization and associated scripts in `docs/AI_PIPELINE.md`.

### Changed
- README.md updated to include instructions for running scripts.

### Removed
- None

---

Ensure GitHub issue titles adhere to the Sprint key format `S{number}-{task_number} Title` with no invalid prefixes.
```

```markdown
<!-- docs/SPRINT_SYSTEM.md -->
# Sprint System Overview

## Sprint Task Management

Sprint tasks and associated issue titles must follow a standardized format for consistency across the repository's issues.

- **Key Format**: S{number}-{task_number}
- **Title Requirements**: Titles cannot start with `[NEXT]`, `【次へ】`, `次へ`, or `Next`.

Scripts in the repository enforce these requirements and handle both pre- and post-issue creation processes.

Refer to specific scripts under `scripts/github` for title normalization, validation, and cleanup processes to maintain consistent sprint tracking.

---

For documentation and examples, review the `docs/AI_PIPELINE.md`.
```
