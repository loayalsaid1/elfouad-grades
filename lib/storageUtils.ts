import { createClientComponentSupabaseClient } from "@/lib/supabase"

export interface StorageMigrationResult {
  success: boolean
  migratedFiles?: string[]
  errors?: string[]
}

/**
 * Migrate all files from old slug folder to new slug folder in a storage bucket
 */
export async function migrateStorageBucketFolder(
  bucketName: string,
  oldSlug: string,
  newSlug: string
): Promise<StorageMigrationResult> {
  const supabase = createClientComponentSupabaseClient()
  const migratedFiles: string[] = []
  const errors: string[] = []

  try {
    // List all files under the old slug prefix (including subdirectories)
    const { data: fileList, error: listError } = await supabase.storage
      .from(bucketName)
      .list(oldSlug, {
        limit: 1000,
        sortBy: { column: "name", order: "asc" }
      })

    if (listError) {
      errors.push(`Failed to list files in ${bucketName}/${oldSlug}: ${listError.message}`)
      return { success: false, errors }
    }

    if (!fileList || fileList.length === 0) {
      // No files to migrate
      return { success: true, migratedFiles: [] }
    }

    // Get all files recursively by searching with prefix
    const { data: allFiles, error: searchError } = await supabase.storage
      .from(bucketName)
      .list("", {
        limit: 1000,
        search: oldSlug,
        sortBy: { column: "name", order: "asc" }
      })

    if (searchError) {
      errors.push(`Failed to search files in ${bucketName}: ${searchError.message}`)
      return { success: false, errors }
    }

    // Filter files that start with the old slug prefix
    const filesToMigrate = (allFiles || []).filter(file => 
      file.name.startsWith(oldSlug + "/") && 
      file.metadata?.size && 
      file.metadata.size > 0
    )

    // Process each file
    for (const file of filesToMigrate) {
      const oldPath = file.name
      const newPath = oldPath.replace(oldSlug + "/", newSlug + "/")

      const result = await moveStorageFile(bucketName, oldPath, newPath)
      if (result.success) {
        migratedFiles.push(oldPath)
      } else {
        errors.push(`Failed to move ${oldPath} to ${newPath}: ${result.error}`)
      }
    }

    return {
      success: errors.length === 0,
      migratedFiles,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error: any) {
    return {
      success: false,
      errors: [`Unexpected error during migration: ${error.message}`]
    }
  }
}

/**
 * Move a single file from one path to another in a storage bucket
 */
async function moveStorageFile(
  bucketName: string,
  oldPath: string,
  newPath: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClientComponentSupabaseClient()

  try {
    // Download the file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(oldPath)

    if (downloadError) {
      return { success: false, error: `Download failed: ${downloadError.message}` }
    }

    if (!fileData) {
      return { success: false, error: "File data is null" }
    }

    // Upload to new location
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(newPath, fileData, {
        upsert: true,
        contentType: fileData.type
      })

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }

    // Delete from old location
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([oldPath])

    if (deleteError) {
      // File was copied but not deleted from old location
      // This is not ideal but not critical
      console.warn(`Warning: File copied to ${newPath} but failed to delete from ${oldPath}: ${deleteError.message}`)
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Migrate school data when slug changes
 */
export async function migrateSchoolStorage(
  oldSlug: string,
  newSlug: string
): Promise<StorageMigrationResult> {
  const results: StorageMigrationResult = {
    success: true,
    migratedFiles: [],
    errors: []
  }

  // Migrate logos bucket
  const logoResult = await migrateStorageBucketFolder("schools-logos", oldSlug, newSlug)
  if (logoResult.migratedFiles) {
    results.migratedFiles!.push(...logoResult.migratedFiles)
  }
  if (logoResult.errors) {
    results.errors!.push(...logoResult.errors)
  }

  // Migrate CSV backups bucket
  const csvResult = await migrateStorageBucketFolder("student-results-csv-backups", oldSlug, newSlug)
  if (csvResult.migratedFiles) {
    results.migratedFiles!.push(...csvResult.migratedFiles)
  }
  if (csvResult.errors) {
    results.errors!.push(...csvResult.errors)
  }

  results.success = logoResult.success && csvResult.success

  return results
}