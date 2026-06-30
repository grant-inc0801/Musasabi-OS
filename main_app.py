```python
import os
import re

def extract_issue_key(title):
    match = re.search(r'\bS4-\d{3}\b', title)
    return match.group(0) if match else None

def generate_spec_path(issue_key):
    return f'docs/specs/{issue_key}.md'

def mark_deprecated_spec():
    if os.path.exists('spec.md'):
        with open('spec.md', 'r+') as file:
            content = file.read()
            file.seek(0, 0)
            file.write("DEPRECATED\nUse individual issue specs in docs/specs/ instead.\n\n" + content)

def create_spec_index():
    index_content = "| Issue | Title | Status | Spec |\n|---|---|---|---|\n"
    for filename in os.listdir('docs/specs'):
        if filename.endswith('.md'):
            issue_key = filename.split('.')[0]
            title = f"{issue_key} Development Conflict Resolver"
            index_content += f"| {issue_key} | {title} | active | docs/specs/{issue_key}.md |\n"
    with open('docs/specs/README.md', 'w') as f:
        f.write(index_content)

def check_spec_conflicts():
    conflicts = []
    if os.path.exists('spec.md'):
        conflicts.append("Root spec.md should not be used.\n")
    for filename in os.listdir('docs/specs'):
        if os.path.exists(os.path.join('docs/specs', filename)) and filename.startswith('spec'):
            conflicts.append(f"Duplicate spec file detected: {filename}\n")
    if not os.path.exists('docs/specs/README.md'):
        conflicts.append("Spec index README.md is missing.\n")
    if conflicts:
        raise Exception("Conflicts detected:\n" + ''.join(conflicts))

# Example test cases
assert extract_issue_key('S4-009 Development Conflict Resolver') == 'S4-009'
assert generate_spec_path('S4-009') == 'docs/specs/S4-009.md'
mark_deprecated_spec()
create_spec_index()
check_spec_conflicts()
```