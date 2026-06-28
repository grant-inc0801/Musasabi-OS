```javascript
// packages/workflow/src/workflowRepository.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    status TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS workflow_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_id INTEGER,
    title TEXT,
    task_type TEXT,
    status TEXT,
    order_index INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(workflow_id) REFERENCES workflows(id)
  )`);
});

const createWorkflow = (title, description, status, createdBy) => {
  db.run(`INSERT INTO workflows (title, description, status, created_by) VALUES (?, ?, ?, ?)`,
    [title, description, status, createdBy]);
};

const findWorkflowById = (id, callback) => {
  db.get(`SELECT * FROM workflows WHERE id = ?`, [id], callback);
};

const listWorkflows = (callback) => {
  db.all(`SELECT * FROM workflows`, [], callback);
};

const createTask = (workflowId, title, taskType, status, orderIndex) => {
  db.run(`INSERT INTO workflow_tasks (workflow_id, title, task_type, status, order_index) VALUES (?, ?, ?, ?, ?)`,
    [workflowId, title, taskType, status, orderIndex]);
};

const listTasksByWorkflowId = (workflowId, callback) => {
  db.all(`SELECT * FROM workflow_tasks WHERE workflow_id = ? ORDER BY order_index`, [workflowId], callback);
};

module.exports = {
  createWorkflow,
  findWorkflowById,
  listWorkflows,
  createTask,
  listTasksByWorkflowId
};

// packages/workflow/src/workflowService.js
const repository = require('./workflowRepository');

const createWorkflow = (title, description, status, createdBy) => {
  repository.createWorkflow(title, description, status, createdBy);
};

const getWorkflow = (id, callback) => {
  repository.findWorkflowById(id, callback);
};

const listWorkflows = (callback) => {
  repository.listWorkflows(callback);
};

const addTask = (workflowId, title, taskType, status, orderIndex) => {
  repository.createTask(workflowId, title, taskType, status, orderIndex);
};

const listTasks = (workflowId, callback) => {
  repository.listTasksByWorkflowId(workflowId, callback);
};

module.exports = {
  createWorkflow,
  getWorkflow,
  listWorkflows,
  addTask,
  listTasks
};

// packages/workflow/src/index.js
const workflowService = require('./workflowService');

workflowService.createWorkflow(
  'MUSA Full Auto Approval Workflow',
  'Workflow for requesting approval before switching MUSA-001 to full auto mode.',
  'ready',
  'System'
);

workflowService.getWorkflow(1, (err, workflow) => {
  if (workflow) {
    console.log('Workflow Engine: Ready');
    console.log(`ワークフロー: ${workflow.title}`);
    console.log(`ワークフローステータス: ${workflow.status}`);
    
    workflowService.addTask(workflow.id, '承認リクエストを作成', 'approval', 'ready', 1);
    workflowService.addTask(workflow.id, 'CEOの承認を待つ', 'human_review', 'waiting', 2);

    workflowService.listTasks(workflow.id, (err, tasks) => {
      console.log(`タスク: ${tasks.length}`);
    });
  }
});
```