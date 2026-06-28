```markdown
# [S1A-001] Approval Foundation

## Objective

Implement the minimum Approval Framework for Musasabi AI. Note that approval execution (approve/reject) is NOT included in this phase.

## Scope

Implement the following components:

- Approval Repository
- Approval Service
- SQLite migration
- Approval Request model
- Approval Request creation
- Approval Request listing
- Approval Request lookup
- Approval Status update
- Desktop UI status
- Unit tests

## Required Files

Create the following files under `packages/approval/src/`:

- `approvalRepository.js`
- `approvalService.js`
- `index.js`

## SQLite

Create a table named `approval_requests` with the following columns:

- `id`
- `title`
- `requested_by`
- `requested_by_type`
- `action`
- `resource_type`
- `status`
- `reason`
- `created_at`
- `updated_at`

## Status Enum

Define status values as follows:

- `submitted` (Default)
- `waiting`
- `approved`
- `rejected`
- `cancelled`

## Service Methods

Implement the following methods in the service layer:

- `createApprovalRequest()`
- `getApprovalRequest()`
- `listApprovalRequests()`
- `updateApprovalStatus()`

## Repository Methods

Implement the following methods in the repository layer:

- `createRequest()`
- `findById()`
- `list()`
- `updateStatus()`

## UI

Display the following statuses on the Desktop UI:

- Approval Engine: Ready
- Approval Request: Created
- Approval Status: submitted

## Tests

Implement unit tests for the following scenarios:

- Request creation
- Request retrieval
- Status update
- UI bootstrap
- SQLite integration

## Documentation

Update the following documentation:

- `README.md`
- `CHANGELOG.md`

## Restrictions

The following features are out of scope and should NOT be implemented:

- `approve()`
- `reject()`
- Notification features
- Workflow execution
- External API interactions

## Acceptance Criteria

- The `approval_requests` table exists.
- The repository is implemented.
- The service is implemented.
- All tests pass.
- `README.md` is updated.
- `CHANGELOG.md` is updated.

## Deliverables

Provide the following in your report:

- List of changed files
- Test results
- Suggested commit message

Do not push changes to GitHub. Use the following suggested commit message:

```
feat(approval): implement approval foundation
```
```