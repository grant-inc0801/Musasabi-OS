```python
import git
import os
import subprocess
import smtplib
from email.mime.text import MIMEText
from crontab import CronTab

# Clone the repository for version management
def clone_repo(repo_url, clone_dir):
    if not os.path.exists(clone_dir):
        git.Repo.clone_from(repo_url, clone_dir)

# Function to log changes and manage versions using Git
def commit_changes(repo_dir, message):
    repo = git.Repo(repo_dir)
    repo.git.add(A=True)
    repo.index.commit(message)

# Data integrity check script
def check_data_integrity(data_source_path):
    # Implement data checks (placeholder logic)
    # return True if data is valid, False otherwise
    return True

# Send notification email about data integrity issues
def send_notification(subject, body, to_emails):
    from_email = "your_email@example.com"
    password = "your_email_password"

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = ', '.join(to_emails)

    server = smtplib.SMTP_SSL('smtp.example.com', 465)
    server.login(from_email, password)
    server.sendmail(from_email, to_emails, msg.as_string())
    server.quit()

# Set up a cron job for automated data integrity checks
def schedule_integrity_checks(script_path):
    cron = CronTab(user='your_username')
    job = cron.new(command=f'python {script_path}', comment='Data integrity check')
    job.minute.every(10)  # run every 10 minutes
    cron.write()

# Main function
def main():
    repo_url = 'https://github.com/your-repo.git'
    clone_dir = '/path/to/clone_dir'
    data_source_path = '/path/to/data/source'

    clone_repo(repo_url, clone_dir)

    if not check_data_integrity(data_source_path):
        send_notification(
            'Data Integrity Alert',
            'Data integrity check failed. Please investigate.',
            ['recipient@example.com']
        )
    else:
        commit_changes(clone_dir, 'Automated data integrity check passed.')

    schedule_integrity_checks('/path/to/this_script.py')

if __name__ == "__main__":
    main()
```