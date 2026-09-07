import { db } from '../../database/db';
import JSZip from 'jszip';
import type { BackupManifest } from '../models/BackupManifest';

export async function importBackup(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const zip = await JSZip.loadAsync(file);
    
    // 1. Validate Manifest
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) throw new Error('Invalid backup: manifest.json missing');
    
    const manifest: BackupManifest = JSON.parse(await manifestFile.async('string'));
    if (manifest.format !== 'manhwa-tracker' || manifest.version !== 1) {
      throw new Error('Unsupported backup format or version');
    }

    // 2. Read JSON files
    const manhwas: any[] = JSON.parse(await zip.file('manhwa.json')!.async('string'));
    const chapters: any[] = JSON.parse(await zip.file('chapters.json')!.async('string'));
    const personal: any[] = JSON.parse(await zip.file('personal.json')!.async('string'));
    const progress: any[] = JSON.parse(await zip.file('progress.json')!.async('string'));
    const mappings: any[] = JSON.parse(await zip.file('external-mappings.json')!.async('string'));

    // 3. Transactional Restore (Merge Strategy: Update if exists, Add if new)
    await db.transaction('rw', db.manhwa, db.chapters, db.personalMetadata, db.readingProgress, db.externalMappings, db.images, async () => {
      
      // Clear existing images to prevent orphaned blobs (optional, but safer for clean restore)
      await db.images.clear();

      // Restore Images first
      const imagesFolder = zip.folder('images');
      if (imagesFolder) {
        for (const [relativePath, zipEntry] of Object.entries(imagesFolder.files)) {
          if (!zipEntry.dir) {
            const blob = await zipEntry.async('blob');
            const fileId = relativePath.split('.')[0]; // Extract UUID from filename
            const mimeType = `image/${relativePath.split('.').pop() || 'jpeg'}`;
            await db.images.put({ id: fileId, blob, mimeType });
          }
        }
      }

      // Restore Data (using put to merge/update existing records safely)
      await db.manhwa.bulkPut(manhwas);
      await db.chapters.bulkPut(chapters);
      await db.personalMetadata.bulkPut(personal);
      await db.readingProgress.bulkPut(progress);
      await db.externalMappings.bulkPut(mappings);
    });

    return { success: true, message: 'Backup restored successfully!' };
  } catch (error) {
    console.error('Import failed:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to restore backup' 
    };
  }
}
