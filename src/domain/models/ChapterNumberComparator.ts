import type { ChapterNumber } from './ChapterNumber';

const categoryOrder: Record<string, number> = {
  prologue: 0,
  main: 1,
  extra: 2,
  side_story: 3,
  unknown: 4
};

export function compareChapterNumbers(a: ChapterNumber, b: ChapterNumber): number {
  const catDiff = categoryOrder[a.category] - categoryOrder[b.category];
  if (catDiff !== 0) return catDiff;

  if (a.type === 'numeric' && b.type === 'numeric') {
    if (a.major !== b.major) return a.major - b.major;
    return a.minor - b.minor;
  }

  if (a.type === 'prefixed' && b.type === 'prefixed') {
    if (a.prefix !== b.prefix) return a.prefix.localeCompare(b.prefix);
    if (a.major !== b.major) return a.major - b.major;
    return a.minor - b.minor;
  }

  if ((a.type === 'numeric' && b.type === 'prefixed') || (a.type === 'prefixed' && b.type === 'numeric')) {
    const numA = a.type === 'numeric' ? a : (a as any);
    const numB = b.type === 'numeric' ? b : (b as any);
    if (numA.major !== numB.major) return numA.major - numB.major;
    return numA.minor - numB.minor;
  }

  return a.raw.localeCompare(b.raw);
}
