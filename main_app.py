```python
import sqlite3

# Connect to SQLite database
connection = sqlite3.connect('organization_system.db')
cursor = connection.cursor()

# Create tables
cursor.execute('''
    CREATE TABLE IF NOT EXISTS organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER,
        name TEXT NOT NULL,
        manager_id INTEGER,
        FOREIGN KEY(organization_id) REFERENCES organizations(id),
        FOREIGN KEY(manager_id) REFERENCES organization_members(id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS organization_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER,
        name TEXT NOT NULL,
        role TEXT,
        FOREIGN KEY(organization_id) REFERENCES organizations(id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS department_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department_id INTEGER,
        task_description TEXT,
        assignee_id INTEGER,
        status TEXT,
        FOREIGN KEY(department_id) REFERENCES departments(id),
        FOREIGN KEY(assignee_id) REFERENCES organization_members(id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS department_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department_id INTEGER,
        message TEXT,
        sender_id INTEGER,
        FOREIGN KEY(department_id) REFERENCES departments(id),
        FOREIGN KEY(sender_id) REFERENCES organization_members(id)
    )
''')

connection.commit()
connection.close()

class Department:
    def __init__(self, name, manager, members, kpi):
        self.name = name
        self.manager = manager
        self.members = members
        self.kpi = kpi

class AIOrganizationSystem:
    def __init__(self):
        self.departments = []

    def add_department(self, department):
        self.departments.append(department)

    def get_organization_chart(self):
        chart = {}
        for department in self.departments:
            chart[department.name] = {
                'Manager': department.manager,
                'Members': department.members,
                'KPI': department.kpi
            }
        return chart

    def delegate_task(self, task, assignee):
        task['assignee'] = assignee
        return f"Task '{task['description']}' has been assigned to {assignee}."

    def communicate(self, message, department_name):
        return f"Message to {department_name} department: {message}"

    def share_knowledge(self, knowledge, department):
        return f"Shared knowledge '{knowledge}' with {department} department."

# Example usage
system = AIOrganizationSystem()
sales_department = Department('Sales', 'AI Sales Manager', ['AI Employee 1', 'AI Employee 2'], 'Increase revenue by 10%')
system.add_department(sales_department)

print(system.get_organization_chart())
print(system.delegate_task({'description': 'Contact potential clients'}, 'AI Employee 1'))
print(system.communicate('Monthly sales meeting', 'Sales'))
print(system.share_knowledge('Lead generation strategies', 'Sales'))
```
