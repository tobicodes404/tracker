import { db } from '../../database/db';

export class ImageStorageService {
  // . ইন্টারনেট থেকে ডাউনলোড করে সেভ করা (Fallback URL সহ)
  static async downloadAndSave(url: string): Promise<{ localId: string | null, remoteUrl: string }> {
    try {
      const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const id = crypto.randomUUID();
      const mimeType = blob.type || 'image/jpeg';

      await db.images.add({ id, blob, mimeType });
      return { localId: id, remoteUrl: url };
    } catch (error) {
      return { localId: null, remoteUrl: url };
    }
  }

  // ২. ইউজারের ডিভাইস থেকে সিলেক্ট করা ফাইল সেভ করা (নতুন ফাংশন)
  static async saveLocalFile(file: File): Promise<string> {
    const id = crypto.randomUUID();
    const mimeType = file.type || 'image/jpeg';
    
    await db.images.add({
      id,
      blob: file, // File object is a type of Blob
      mimeType,
    });
    
    return id;
  }

  // ৩. আইডি দিয়ে ইমেজ বের করা
  static async getImageBlob(id: string): Promise<Blob | undefined> {
    const record = await db.images.get(id);
    return record?.blob;
  }

  // ৪. পুরোনো ইমেজ ডিলিট করা (যখন ইউজার কভার চেঞ্জ করবে)
  static async deleteImage(id: string): Promise<void> {
    await db.images.delete(id);
  }
}
