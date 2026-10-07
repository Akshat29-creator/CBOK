export interface CorpusPreset {
  id: string;
  name: string;
  description: string;
  text: string;
}

export const CORPUS_PRESETS: CorpusPreset[] = [
  {
    id: 'default',
    name: 'University NLP Benchmark (Default)',
    description: 'Classic university NLP corpus demonstrating syntactic & semantic roles.',
    text: `The cat sits on the mat.
The dog sits on the floor.
The cat likes the dog.
The dog likes the cat.
Machine learning is interesting.
Machine learning is powerful.
Deep learning is a part of machine learning.`,
  },
  {
    id: 'pets',
    name: 'Pet & Action Dynamics',
    description: 'Compact 4-sentence corpus emphasizing word substitution (cat <-> dog).',
    text: `The cat sits on the mat.
The dog sits on the floor.
The cat likes the dog.
The dog likes the cat.`,
  },
  {
    id: 'ai-ml',
    name: 'Neural & Deep Learning Concepts',
    description: 'Domain-specific technical corpus demonstrating concept clustering.',
    text: `Machine learning is powerful.
Deep learning is a subset of machine learning.
Neural networks learn embeddings from context.
Deep learning uses artificial neural networks.
Embeddings capture semantic vector representations.`,
  },
  {
    id: 'king-queen',
    name: 'Analogy & Role Symmetry',
    description: 'Sentences with clear contextual pairing for royalty & leadership.',
    text: `The king rules the royal castle.
The queen rules the royal castle.
The king wears a golden crown.
The queen wears a golden crown.
A wise king leads the people.
A wise queen leads the people.`,
  },
];
