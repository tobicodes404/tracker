import { inflate } from 'pako';
import * as protobuf from 'protobufjs';
import JSZip from 'jszip';

let root: protobuf.Root | null = null;

async function getProtoRoot(): Promise<protobuf.Root> {
  if (root) return root;
  const protoContent = await fetch('/src/backup/mihon/mihon.proto').then(res => res.text());
  root = protobuf.parse(protoContent).root;
  return root;
}

export interface ParsedMihonManga {
  title: string;
  sourceId: string;
  status: number;
  genres: string[];
  categories: string[];
  lastReadChapterUrl: string | null;
  lastReadTimestamp: number | null;
  author: string;
  artist: string;
  description: string;
}

export async function parseMihonBackup(file: File): Promise<ParsedMihonManga[]> {
  try {
    let protoBytes: Uint8Array;
    try {
      const zip = await JSZip.loadAsync(file);
      let protoGzFile: JSZip.JSZipObject | null = null;
      
      zip.forEach((relativePath, zipEntry) => {
        if (relativePath.endsWith('.proto.gz')) {
          protoGzFile = zipEntry;
        }
      });

      if (!protoGzFile) throw new Error('No .proto.gz file found inside the archive.');
      
      const compressedData = await protoGzFile.async('uint8array');
      protoBytes = inflate(compressedData);
    } catch (zipError) {
      const arrayBuffer = await file.arrayBuffer();
      protoBytes = inflate(new Uint8Array(arrayBuffer));
    }

    const protoRoot = await getProtoRoot();
    const Backup = protoRoot.lookupType('Backup');
    const message = Backup.decode(protoBytes);
    const backupData = Backup.toObject(message, { longs: String, enums: String, defaults: true, arrays: true });

    const parsedMangas: ParsedMihonManga[] = [];
    if (backupData.backupManga) {
      for (const manga of backupData.backupManga) {
        let lastReadChapterUrl: string | null = null;
        let lastReadTimestamp: number | null = null;

        if (manga.history && manga.history.length > 0) {
          const lastHistory = manga.history[manga.history.length - 1];
          lastReadChapterUrl = lastHistory.url || null;
          lastReadTimestamp = lastHistory.lastRead ? Number(lastHistory.lastRead) : null;
        }

        const categories = (manga.categories || []).map((cat: any) => cat.title || `Category ${cat.id}`).filter(Boolean);

        parsedMangas.push({
          title: manga.title || 'Unknown Title',
          sourceId: String(manga.source || 'unknown'),
          status: manga.status || 0,
          genres: manga.genre || [],
          categories: categories,
          lastReadChapterUrl,
          lastReadTimestamp,
          author: manga.author || 'Unknown',
          artist: manga.artist || 'Unknown',
          description: manga.description || '',
        });
      }
    }
    return parsedMangas;
  } catch (error) {
    console.error('Failed to parse Mihon backup:', error);
    throw new Error(error instanceof Error ? error.message : 'Invalid or corrupted backup file.');
  }
}
