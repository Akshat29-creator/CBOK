import { VocabularyWord } from './types';

export class Vocabulary {
  public words: string[] = [];
  public wordToId: Map<string, number> = new Map();
  public idToWord: Map<number, string> = new Map();
  public wordCounts: Map<string, number> = new Map();
  public wordList: VocabularyWord[] = [];

  constructor(tokens: string[]) {
    this.build(tokens);
  }

  private build(tokens: string[]): void {
    this.words = [];
    this.wordToId.clear();
    this.idToWord.clear();
    this.wordCounts.clear();

    // Count frequencies
    for (const token of tokens) {
      this.wordCounts.set(token, (this.wordCounts.get(token) || 0) + 1);
    }

    // Sort words by frequency (descending), then alphabetically for stability
    const uniqueSorted = Array.from(this.wordCounts.keys()).sort((a, b) => {
      const countDiff = (this.wordCounts.get(b) || 0) - (this.wordCounts.get(a) || 0);
      if (countDiff !== 0) return countDiff;
      return a.localeCompare(b);
    });

    this.words = uniqueSorted;
    const V = uniqueSorted.length;

    this.wordList = uniqueSorted.map((word, idx) => {
      this.wordToId.set(word, idx);
      this.idToWord.set(idx, word);

      // Construct sparse one-hot vector representation
      const oneHot = new Array(V).fill(0);
      oneHot[idx] = 1;

      return {
        id: idx,
        word,
        count: this.wordCounts.get(word) || 1,
        oneHot,
      };
    });
  }

  public get size(): number {
    return this.words.length;
  }

  public getId(word: string): number | undefined {
    return this.wordToId.get(word);
  }

  public getWord(id: number): string | undefined {
    return this.idToWord.get(id);
  }

  public getOneHot(wordOrId: string | number): number[] {
    const id = typeof wordOrId === 'string' ? this.getId(wordOrId) : wordOrId;
    const vec = new Array(this.size).fill(0);
    if (id !== undefined && id >= 0 && id < this.size) {
      vec[id] = 1;
    }
    return vec;
  }
}
