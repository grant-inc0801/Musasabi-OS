```javascript
// packages/integrations/src/filemaker/fileMakerTwoWaySyncService.js
class FileMakerTwoWaySyncService {
  syncFileMakerToLocal() {
    // Logic to import/update local sales leads from FileMaker
  }

  syncLocalToFileMaker() {
    // Logic to write back approved changes to FileMaker
  }
}
module.exports = FileMakerTwoWaySyncService;

// packages/integrations/src/filemaker/fileMakerWriteBackService.js
class FileMakerWriteBackService {
  queueWriteBackChanges(changes) {
    // Queue changes for write-back, validate allowed fields
  }

  approveQueuedChanges(queueId) {
    // Approve specific changes in the queue for write-back
  }

  cancelWriteBack(queueId) {
    // Cancel specific queued write-back changes
  }
}
module.exports = FileMakerWriteBackService;

// packages/integrations/src/filemaker/fileMakerConflictResolver.js
class FileMakerConflictResolver {
  detectConflicts(localRecords, remoteRecords) {
    // Detect and generate conflict records for manual review
  }

  resolveConflict(conflictId, resolution) {
    // Apply resolution strategy to the conflict record
  }
}
module.exports = FileMakerConflictResolver;

// packages/integrations/src/filemaker/fileMakerSyncPreviewService.js
class FileMakerSyncPreviewService {
  generatePreviewForImport() {
    // Generate and display a preview of incoming FileMaker data
  }

  generatePreviewForWriteBack(queueId) {
    // Generate and display a preview of the queued write-back changes
  }
}
module.exports = FileMakerSyncPreviewService;

// packages/integrations/src/filemaker/fileMakerSyncAuditService.js
class FileMakerSyncAuditService {
  logSyncAction(syncDirection, action, details) {
    // Log actions performed during the sync process
  }
}
module.exports = FileMakerSyncAuditService;
```