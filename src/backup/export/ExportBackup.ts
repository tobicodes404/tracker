import { db } from '../../database/db';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { BackupManifest } from '../models/BackupManifest';

export async function exportBackup(): Promise<void> {
  const zip = new JSZip();
  
  // 1. Create Manifest
  const manifest: BackupManifest = {
    format: 'manhwa-tracker',
    version: 1,
    createdAt: Date.now(),
    appVersion: '1.0.0'
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // 2. Export Data Tables
  const manhwas = await db.manhwa.toArray();
  zip.file('manhwa.json', JSON.stringify(manhwas, null, 2));

  const chapters = await db.chapters.toArray();
  zip.file('chapters.json', JSON.stringify(chapters, null, 2));

  const personal = await db.personalMetadata.toArray();
  zip.file('personal.json', JSON.stringify(personal, null, 2));

  const progress = await db.readingProgress.toArray();
  zip.file('progress.json', JSON.stringify(progress, null, 2));

  const mappings = await db.externalMappings.toArray();
  zip.file('external-mappings.json', JSON.stringify(mappings, null, 2));

  // 3. Export Images
  const images = await db.images.toArray();
  const imagesFolder = zip.folder('images')!;
  
  for (const img of images) {
    // Add blob directly to zip
    imagesFolder.file(`${img.id}.${img.mimeType.split('/')[1] || 'jpg'}`, img.blob);
  }

  // 4. Generate and Download ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  const dateStr = new Date().toISOString().split('T')[0];
  saveAs(content, `ManhwaTracker_Backup_${dateStr}.zip`);
}
