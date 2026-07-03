```javascript
// packages/ai-pm/src/executor/sprintExecutor.js
const issueDispatcher = require('./issueDispatcher');
const workflowMonitor = require('./workflowMonitor');
const reviewMonitor = require('./reviewMonitor');
const completionDetector = require('./completionDetector');
const recoveryManager = require('./recoveryManager');
const db = require('./database');

async function executeSprint(sprintKey) {
  const tasks = await db.getTasksForSprint(sprintKey);
  for (const task of tasks) {
    await transitionTask(task, 'planned', 'active');
    const issueNumber = await issueDispatcher.createIssue(task);
    await transitionTask(task, 'active', 'waiting_for_codex', issueNumber);
    await workflowMonitor.waitAndExecuteImplementation(task);
    await transitionTask(task, 'implementation', 'testing');
    await workflowMonitor.runTests(task);
    const reviewStatus = await reviewMonitor.awaitReviewApproval(task);
    if (reviewStatus === 'approved') {
      await transitionTask(task, 'review_pending', 'review_approved');
    } else {
      await transitionTask(task, 'review_pending', 'failed');
      await recoveryManager.handleFailure(task);
      continue;
    }
    await completionDetector.closeIssue(task);
    await transitionTask(task, 'review_approved', 'completed');
  }
}

async function transitionTask(task, fromState, toState, issueNumber = null) {
  console.log(`Transitioning task ${task.key} from ${fromState} to ${toState}`);
  await db.updateTaskState(task.key, fromState, toState, issueNumber);
}

module.exports = { executeSprint };

// packages/ai-pm/src/executor/issueDispatcher.js
const github = require('./githubClient');

async function createIssue(task) {
  const issue = await github.createIssue({
    title: `Implement ${task.summary}`,
    body: task.description,
  });
  return issue.number;
}

module.exports = { createIssue };

// packages/ai-pm/src/executor/workflowMonitor.js
const codex = require('./codexClient');
const ci = require('./ciClient');

async function waitAndExecuteImplementation(task) {
  await codex.generateCodeForTask(task);
}

async function runTests(task) {
  const result = await ci.runTests(task);
  if (!result.success) throw new Error('Tests failed');
}

module.exports = { waitAndExecuteImplementation, runTests };

// packages/ai-pm/src/executor/reviewMonitor.js
const github = require('./githubClient');

async function awaitReviewApproval(task) {
  while (true) {
    const status = await github.getReviewStatus(task.issueNumber);
    if (status === 'approved') return 'approved';
    if (status === 'changes_requested') return 'failed';
    await new Promise((resolve) => setTimeout(resolve, 60000)); // wait 1 min
  }
}

module.exports = { awaitReviewApproval };

// packages/ai-pm/src/executor/completionDetector.js
const github = require('./githubClient');

async function closeIssue(task) {
  await github.closeIssue(task.issueNumber);
}

module.exports = { closeIssue };

// packages/ai-pm/src/executor/recoveryManager.js
async function handleFailure(task) {
  console.log(`Handling failure for task ${task.key}`);
}

module.exports = { handleFailure };

// packages/ai-pm/src/executor/database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

function setupDatabase() {
  db.serialize(() => {
    db.run(`CREATE TABLE sprint_execution_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sprint_key TEXT,
      task_key TEXT,
      state TEXT,
      issue_number INTEGER,
      started_at TEXT,
      completed_at TEXT,
      duration_ms INTEGER,
      result TEXT
    )`);
    db.run(`CREATE TABLE pipeline_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT,
      task_key TEXT,
      issue_number INTEGER,
      detail_json TEXT,
      created_at TEXT
    )`);
  });
}

async function getTasksForSprint(sprintKey) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM tasks WHERE sprint_key = ?', [sprintKey], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

async function updateTaskState(taskKey, fromState, toState, issueNumber) {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    db.run(
      `UPDATE sprint_execution_history SET state = ?, completed_at = ?
       WHERE task_key = ? AND state = ?`,
      [toState, now, taskKey, fromState],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

setupDatabase();
module.exports = { getTasksForSprint, updateTaskState };
```