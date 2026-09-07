import { db } from '../../database/db';
import { ImageStorageService } from '../../services/images/ImageStorageService';

export interface UpdateManhwaDetailsInput {
  id: string;
  title: string;
  description?: string;
  author?: string;
  artist?: string;
  status?: string;
  genres?: string[];
  newCoverFile?: File | null;
  removeCover?: boolean;
}

export async function updateManhwaDetails(input: UpdateManhwaDetailsInput): Promise<void> {
  const existing = await db.manhwa.get(input.id);
  if (!existing) throw new Error('Manhwa not found');

  let coverImageRef = existing.coverImageRef;
  let coverImageUrl = existing.coverImageUrl;

  // যদি নতুন ছবি আপলোড করা হয়
  if (input.newCoverFile) {
    // পুরোনো লোকাল ইমেজ ডিলিট করা (যদি থাকে)
    if (coverImageRef) {
      await ImageStorageService.deleteImage(coverImageRef);
    }
    coverImageRef = await ImageStorageService.saveLocalFile(input.newCoverFile);
    coverImageUrl = null; // নতুন লোকাল ইমেজের জন্য রিমোট URL দরকার নেই
  } 
  // যদি ইউজার ছবি রিমুভ করতে চায়
  else if (input.removeCover) {
    if (coverImageRef) {
      await ImageStorageService.deleteImage(coverImageRef);
    }
    coverImageRef = null;
    coverImageUrl = null;
  }

  await db.manhwa.update(input.id, {
    title: input.title,
    description: input.description ?? existing.description,
    author: input.author ?? existing.author,
    artist: input.artist ?? existing.artist,
    status: input.status ?? existing.status,
    genres: input.genres ?? existing.genres,
    coverImageRef,
    coverImageUrl,
    updatedAt: Date.now(),
  });
}
