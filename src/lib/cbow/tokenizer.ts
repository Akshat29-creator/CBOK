/**
 * NLP Tokenizer for splitting raw corpus into sentences and cleaned tokens
 */
export interface TokenizedSentence {
  id: number;
  originalText: string;
  tokens: string[];
}

export function tokenizeCorpus(corpusText: string): {
  sentences: TokenizedSentence[];
  allTokens: string[];
} {
  // Normalize line breaks
  const rawLines = corpusText.split(/\r?\n/);
  const sentences: TokenizedSentence[] = [];
  let allTokens: string[] = [];
  let sentenceId = 0;

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Split sentences by punctuation followed by space or end of string (. ! ?)
    const sentenceParts = trimmed
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const part of sentenceParts) {
      // Clean sentence: lower-case, strip surrounding punctuation, split by words
      const cleanedWords = part
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .split(/\s+/)
        .map((w) => w.trim())
        .filter((w) => w.length > 0);

      if (cleanedWords.length > 0) {
        sentences.push({
          id: sentenceId++,
          originalText: part,
          tokens: cleanedWords,
        });
        allTokens.push(...cleanedWords);
      }
    }
  }

  return { sentences, allTokens };
}
