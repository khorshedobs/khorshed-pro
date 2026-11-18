const WORDS_PER_MINUTE = 220;

export interface ReadingTimeResult {
  minutes: number;
  words: number;
  label: string;
}

export function getReadingTime(rawContent: string | undefined): ReadingTimeResult {
  if (!rawContent) {
    return { minutes: 1, words: 0, label: '1 min read' };
  }

  // Strip MDX imports/exports, fenced code markers, and markdown punctuation before counting words.
  const cleaned = rawContent
    .replace(/^import\s+.*$/gm, ' ')
    .replace(/^export\s+.*$/gm, ' ')
    .replace(/```[\s\S]*?```/g, (block) => {
      // Count code tokens at a lighter weight so long listings remain realistic
      const codeWords = block
        .replace(/```[a-zA-Z0-9_-]*/g, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      return ' code '.repeat(Math.ceil(codeWords * 0.45));
    })
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~[\]()!-]/g, ' ');

  const words = cleaned.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

  return {
    minutes,
    words,
    label: `${minutes} min read`,
  };
}
