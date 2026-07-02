```yaml
name: Auto Commit Workflow

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v2

    - name: Set up Git
      run: |
        git config --global user.name 'GitHub Actions'
        git config --global user.email 'actions@github.com'

    - name: Fetch latest changes from main
      run: git fetch origin main

    - name: Rebase from main
      run: git rebase origin/main

    - name: Make changes
      run: |
        # Your script or commands to modify the files

    - name: Commit changes
      run: |
        git add .
        git commit -m "Auto update by GitHub Actions"

    - name: Push changes
      run: git push origin main
```