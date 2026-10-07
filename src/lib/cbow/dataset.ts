import { TokenizedSentence } from './tokenizer';
import { Vocabulary } from './vocabulary';
import { TrainingPair } from './types';

/**
 * Generate CBOW training pairs using a sliding context window over sentences.
 * Target word = w_t
 * Context words = { w_i | max(0, t - windowSize) <= i <= min(N-1, t + windowSize), i != t }
 */
export function generateTrainingPairs(
  sentences: TokenizedSentence[],
  vocab: Vocabulary,
  windowSize: number
): TrainingPair[] {
  const pairs: TrainingPair[] = [];
  let pairId = 0;

  for (const sentence of sentences) {
    const tokens = sentence.tokens;
    const N = tokens.length;
    if (N < 2) continue; // Need at least target + 1 context word

    for (let t = 0; t < N; t++) {
      const targetWord = tokens[t];
      const targetId = vocab.getId(targetWord);
      if (targetId === undefined) continue;

      const contextWords: string[] = [];
      const contextIds: number[] = [];

      const start = Math.max(0, t - windowSize);
      const end = Math.min(N - 1, t + windowSize);

      for (let i = start; i <= end; i++) {
        if (i === t) continue; // Exclude target word itself
        const cWord = tokens[i];
        const cId = vocab.getId(cWord);
        if (cId !== undefined) {
          contextWords.push(cWord);
          contextIds.push(cId);
        }
      }

      if (contextWords.length > 0) {
        pairs.push({
          id: pairId++,
          sentenceIndex: sentence.id,
          targetIndex: t,
          targetWord,
          targetId,
          contextWords,
          contextIds,
          fullSentenceTokens: tokens,
        });
      }
    }
  }

  return pairs;
}
