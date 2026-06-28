```javascript
// packages/workflow/src/workflowRepository.js
const sqlite3 = require('sqlite3').verbose();

class WorkflowRepository {
  constructor(db) {
    this.db = db;
  }

  createWorkflow(workflow) {
    return new Promise((resolve, reject) => {
      const { title, description, status, created_by } = workflow;
      const createdAt = new Date().toISOString();
      this.db.run(
        `INSERT INTO workflows (title, description, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description, status, created_by, createdAt, createdAt],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  findWorkflowById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT * FROM workflows WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  listWorkflows() {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM workflows`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  createTask(task) {
    return new Promise((resolve, reject) => {
      const { workflow_id, title, task_type, status, order_index } = task;
      const createdAt = new Date().toISOString();
      this.db.run(
        `INSERT INTO workflow_tasks (workflow_id, title, task_type, status, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [workflow_id, title, task_type, status, order_index, createdAt, createdAt],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  listTasksByWorkflowId(workflow_id) {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM workflow_tasks WHERE workflow_id = ?`, [workflow_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = WorkflowRepository;

// packages/workflow/src/workflowService.js
const WorkflowRepository = require('./workflowRepository');

class WorkflowService {
  constructor(workflowRepository) {
    this.workflowRepository = workflowRepository;
  }

  async createWorkflow(workflow) {
    return this.workflowRepository.createWorkflow(workflow);
  }

  async getWorkflow(id) {
    return this.workflowRepository.findWorkflowById(id);
  }

  async listWorkflows() {
    return this.workflowRepository.listWorkflows();
  }

  async addTask(workflowId, task) {
    task.workflow_id = workflowId;
    return this.workflowRepository.createTask(task);
  }

  async listTasks(workflowId) {
    return this.workflowRepository.listTasksByWorkflowId(workflowId);
  }
}

module.exports = WorkflowService;

// packages/workflow/src/index.js
const sqlite3 = require('sqlite3').verbose();
const WorkflowRepository = require('./workflowRepository');
const WorkflowService = require('./workflowService');

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE workflows (
      id INTEGER PRIMARY KEY,
      title TEXT,
      description TEXT,
      status TEXT,
      created_by TEXT,
      created_at DATETIME,
      updated_at DATETIME
    )
  `);
  db.run(`
    CREATE TABLE workflow_tasks (
      id INTEGER PRIMARY KEY,
      workflow_id INTEGER,
      title TEXT,
      task_type TEXT,
      status TEXT,
      order_index INTEGER,
      created_at DATETIME,
      updated_at DATETIME
    )
  `);

  const workflowRepository = new WorkflowRepository(db);
  const workflowService = new WorkflowService(workflowRepository);

  const seedWorkflow = {
    title: 'MUSA Full Auto Approval Workflow',
    description: 'Workflow for requesting approval before switching MUSA-001 to full auto mode.',
    status: 'ready',
    created_by: 'system'
  };

  (async () => {
    const workflowId = await workflowService.createWorkflow(seedWorkflow);
    await workflowService.addTask(workflowId, { title: '承認リクエストの作成', task_type: 'approval', status: 'ready', order_index: 1 });
    await workflowService.addTask(workflowId, { title: 'CEOの承認を待つ', task_type: 'human_review', status: 'waiting', order_index: 2 });

    console.log('Workflow Engine: Ready');
    const workflows = await workflowService.listWorkflows();
    console.log('Workflow:', workflows[0].title);
    console.log('Workflow Status:', workflows[0].status);

    const tasks = await workflowService.listTasks(workflowId);
    console.log('Tasks:', tasks.length);
  })();
});
```