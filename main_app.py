```javascript
const fs = require('fs');
const { execSync } = require('child_process');
const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'your_username';
const REPO_NAME = 'your_repository';

const getOpenIssues = async () => {
  const response = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` },
    params: { state: 'open' }
  });
  return response.data;
};

const getNextTaskFromRoadmap = (openIssues) => {
  const roadmap = JSON.parse(fs.readFileSync('docs/codex/roadmap/sprint-roadmap.json', 'utf-8'));
  for (const task of roadmap.tasks) {
    if (!openIssues.find(issue => issue.title === task.title)) {
      return task;
    }
  }
  return null;
};

const createIssue = async (title, body, labels, milestone_number) => {
  const response = await axios.post(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
    title,
    body,
    labels,
    milestone: milestone_number
  }, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` }
  });
  return response.data;
};

const commentOnIssue = async (issueNumber, message) => {
  await axios.post(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/comments`, {
    body: message
  }, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` }
  });
};

const closeIssue = async (issueNumber) => {
  await axios.patch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}`, {
    state: 'closed'
  }, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` }
  });
};

const main = async () => {
  const openIssues = await getOpenIssues();
  const currentIssue = openIssues[0];
  const nextTask = getNextTaskFromRoadmap(openIssues);

  if (nextTask) {
    const newIssue = await createIssue(
      nextTask.title,
      nextTask.body,
      nextTask.labels,
      nextTask.milestone
    );

    await commentOnIssue(currentIssue.number, `Next issue created: ${newIssue.html_url}`);
    await closeIssue(currentIssue.number);

    console.log(`Current Issue: ${currentIssue.title}`);
    console.log(`Next Issue: ${newIssue.title}`);
    console.log(`Issue Number: ${newIssue.number}`);
    console.log(`Issue URL: ${newIssue.html_url}`);
  } else {
    console.log('No new tasks in the roadmap.');
  }
};

main().catch(error => console.error(error));
```