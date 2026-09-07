export type ChapterNumberCategory = 'prologue' | 'extra' | 'side_story' | 'main' | 'unknown'

export type ChapterNumber = 
  | { type: 'numeric'; major: number; minor: number; raw: string; category: 'main' }
  | { type: 'prefixed'; prefix: string; major: number; minor: number; raw: string; category: 'main' }
  | { type: 'labeled'; category: 'prologue' | 'extra' | 'side_story' | 'unknown'; raw: string }
