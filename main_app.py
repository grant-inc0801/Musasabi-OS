```python
from datetime import datetime

class AIEmployee:
    def __init__(self, employee_id, employee_name, avatar, department, role, status, personality):
        self.employee_id = employee_id
        self.employee_name = employee_name
        self.avatar = avatar
        self.department = department
        self.role = role
        self.status = status
        self.personality = personality
        self.created_at = datetime.now()
        self.skills = {}
        self.memory = []
        self.assignments = []

    def add_skill(self, skill_name, level):
        if 0 <= level <= 100:
            self.skills[skill_name] = level

    def add_memory(self, memory_type, source_id, confidence):
        self.memory.append({
            'memory_type': memory_type,
            'source_id': source_id,
            'confidence': confidence,
            'created_at': datetime.now()
        })

    def assign_to(self, assignment_type, assignment_id):
        self.assignments.append({
            'assignment_type': assignment_type,
            'assignment_id': assignment_id,
            'started_at': datetime.now(),
            'completed_at': None
        })

    def complete_assignment(self, assignment_id):
        for assignment in self.assignments:
            if assignment['assignment_id'] == assignment_id:
                assignment['completed_at'] = datetime.now()

class AIDashboard:
    def __init__(self):
        self.employees = []

    def add_employee(self, employee):
        self.employees.append(employee)

    def list_employees(self):
        return [{'id': emp.employee_id, 'name': emp.employee_name, 'status': emp.status} for emp in self.employees]

    def get_employee_status(self, employee_id):
        for emp in self.employees:
            if emp.employee_id == employee_id:
                return emp.status

    def get_employee_tasks(self, employee_id):
        for emp in self.employees:
            if emp.employee_id == employee_id:
                return emp.assignments

class AIAdministration:
    def __init__(self, dashboard):
        self.dashboard = dashboard

    def create_employee(self, employee_id, employee_name, avatar, department, role, status, personality):
        employee = AIEmployee(employee_id, employee_name, avatar, department, role, status, personality)
        self.dashboard.add_employee(employee)
        return employee

    def archive_employee(self, employee_id):
        self.dashboard.employees = [emp for emp in self.dashboard.employees if emp.employee_id != employee_id]

    def toggle_employee_status(self, employee_id):
        for emp in self.dashboard.employees:
            if emp.employee_id == employee_id:
                emp.status = 'inactive' if emp.status == 'active' else 'active'

    def change_department(self, employee_id, new_department):
        for emp in self.dashboard.employees:
            if emp.employee_id == employee_id:
                emp.department = new_department

    def assign_to_campaign(self, employee_id, campaign_id):
        for emp in self.dashboard.employees:
            if emp.employee_id == employee_id:
                emp.assign_to('campaign', campaign_id)
```

```yaml
# Sprint-007.yaml
sprint:
  id: 7
  name: AI Employee Foundation
  tasks:
    - id: S7-001
      name: AI Employee Foundation
    - id: S7-002
      name: AI Employee Profile
    - id: S7-003
      name: AI Employee Skills
    - id: S7-004
      name: AI Employee Memory
    - id: S7-005
      name: AI Employee Assignment
    - id: S7-006
      name: AI Employee Dashboard
    - id: S7-007
      name: AI Employee Collaboration
    - id: S7-008
      name: AI Employee Administration
  acceptance_criteria:
    - exists: Sprint-007.yaml
    - exists: ai_employees table
    - exists: AI Employee dashboard
    - functions: Employee profile system
    - functions: Skill system
    - functions: Memory system
    - functions: Assignment system
    - passes: tests
    - updated: Documentation
```