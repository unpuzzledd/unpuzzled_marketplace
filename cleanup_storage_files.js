/**
 * Storage Cleanup Script for Testing
 * 
 * This script deletes all academy photos from Supabase Storage.
 * Run this using Node.js with your Supabase credentials.
 * 
 * Usage:
 *   1. Install dependencies: npm install @supabase/supabase-js
 *   2. Set environment variables:
 *      - SUPABASE_URL=your_supabase_url
 *      - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 *   3. Run: node cleanup_storage_files.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const BUCKET_NAME = 'academy-photos';

async function deleteAllStorageFiles() {
  try {
    console.log('Starting storage cleanup...');
    console.log(`Bucket: ${BUCKET_NAME}`);
    
    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (listError) {
      throw listError;
    }
    
    if (!files || files.length === 0) {
      console.log('No files found in storage bucket.');
      return;
    }
    
    console.log(`Found ${files.length} file(s) to delete.`);
    
    // Collect all file paths (including nested folders)
    const filePaths = [];
    
    async function collectFiles(path = '') {
      const { data: items, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(path, {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        console.error(`Error listing files in ${path}:`, error);
        return;
      }
      
      if (!items) return;
      
      for (const item of items) {
        const itemPath = path ? `${path}/${item.name}` : item.name;
        
        if (item.id === null) {
          // It's a folder, recurse into it
          await collectFiles(itemPath);
        } else {
          // It's a file
          filePaths.push(itemPath);
        }
      }
    }
    
    // Collect all files recursively
    await collectFiles();
    
    console.log(`Total files to delete: ${filePaths.length}`);
    
    if (filePaths.length === 0) {
      console.log('No files to delete.');
      return;
    }
    
    // Delete files in batches (Supabase has limits)
    const BATCH_SIZE = 100;
    let deletedCount = 0;
    
    for (let i = 0; i < filePaths.length; i += BATCH_SIZE) {
      const batch = filePaths.slice(i, i + BATCH_SIZE);
      
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(batch);
      
      if (deleteError) {
        console.error(`Error deleting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, deleteError);
      } else {
        deletedCount += batch.length;
        console.log(`Deleted ${deletedCount}/${filePaths.length} files...`);
      }
    }
    
    console.log(`\n✅ Successfully deleted ${deletedCount} file(s) from storage.`);
    
  } catch (error) {
    console.error('Error during storage cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
deleteAllStorageFiles()
  .then(() => {
    console.log('\nStorage cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

