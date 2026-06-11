# Storage Migration for School Slug Changes

## Problem
When a school slug is changed in the admin dashboard, files in Supabase storage buckets remain under the old slug folder structure. This causes:
- Orphaned files under the old slug path
- New uploads creating separate folder structures
- Broken references to existing files

## Solution
Implemented automatic storage migration when school slug changes are detected.

### Key Components

#### 1. Storage Migration Utility (`lib/storageUtils.ts`)
- `migrateSchoolStorage()` - Orchestrates migration for both storage buckets
- `migrateStorageBucketFolder()` - Handles file migration for specific bucket
- `moveStorageFile()` - Moves individual files between locations

#### 2. Integration in School Update Flow (`app/admin/dashboard/schools/page.tsx`)
- Detects when school slug changes during edit
- Triggers storage migration before database update
- Updates logo path references to use new slug
- Provides error handling and rollback capabilities

### Storage Buckets Affected
1. **schools-logos** - School logo files at `{slug}/elfouad-{slug}-logo`
2. **student-results-csv-backups** - CSV backups at `{slug}/{year}/t{term}/grade_{grade}.csv`

### Migration Process
1. **Detection**: Compare old slug vs new slug during school update
2. **Migration**: Move all files from `old-slug/*` to `new-slug/*` in both buckets
3. **Path Update**: Update logo path in database to reference new slug
4. **Database Update**: Save school record with new slug and updated paths
5. **Error Handling**: Rollback on failure, provide detailed error messages

### Error Handling
- Failed file listing: Reports permission or connectivity issues
- Failed file migration: Reports specific file transfer errors
- Partial failures: Logs successful migrations and specific errors
- Database rollback: Prevents orphaned state if migration fails

### Testing
Run the test suite in `lib/storageUtilsTest.ts` to validate:
- Interface contracts
- Error handling scenarios
- Integration logic simulation

### Usage
The migration is automatically triggered when:
1. Editing an existing school in the admin dashboard
2. The slug field is changed to a different value
3. The save operation is performed

No manual intervention required - the system handles migration transparently.