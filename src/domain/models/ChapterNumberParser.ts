import type { ChapterNumber } from './ChapterNumber';

const numericRegex = /^(\d+)(?:\.(\d+))?$/;
const prefixedRegex = /^([a-zA-Z\s]+?)\s*(\d+)(?:\.(\d+))?$/i;

export function parseChapterNumber(rawValue: string): ChapterNumber {
  const trimmed = rawValue.trim();
  if (!trimmed) return { type: 'labeled', category: 'unknown', raw: rawValue };

  const lower = trimmed.toLowerCase();
  if (lower.includes('prologue')) return { type: 'labeled', category: 'prologue', raw: trimmed };
  if (lower.includes('extra')) return { type: 'labeled', category: 'extra', raw: trimmed };
  if (lower.includes('side story') || lower.includes('side_story')) return { type: 'labeled', category: 'side_story', raw: trimmed };

  const numericMatch = trimmed.match(numericRegex);
  if (numericMatch) {
    return {
      type: 'numeric',
      major: parseInt(numericMatch[1], 10),
      minor: numericMatch[2] ? parseInt(numericMatch[2], 10) : 0,
      raw: trimmed,
      category: 'main'
    };
  }

  const prefixedMatch = trimmed.match(prefixedRegex);
  if (prefixedMatch) {
    return {
      type: 'prefixed',
      prefix: prefixedMatch[1].trim(),
      major: parseInt(prefixedMatch[2], 10),
      minor: prefixedMatch[3] ? parseInt(prefixedMatch[3], 10) : 0,
      raw: trimmed,
      category: 'main'
    };
  }

  return { type: 'labeled', category: 'unknown', raw: trimmed };
}
