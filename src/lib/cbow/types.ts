export interface CBOWConfig {
  windowSize: number; // c, words on each side (1, 2, or 3)
  embeddingDim: number; // D (2, 3, 5, 8, 10)
  learningRate: number; // eta (0.01 - 0.5)
  epochs: number; // total epochs for full training
  aggregation: 'average' | 'sum';
  seed: number;
}

export interface VocabularyWord {
  id: number;
  word: string;
  count: number;
  oneHot: number[];
}

export interface TrainingPair {
  id: number;
  sentenceIndex: number;
  targetIndex: number;
  targetWord: string;
  targetId: number;
  contextWords: string[];
  contextIds: number[];
  fullSentenceTokens: string[];
}

export interface ForwardPassResult {
  contextIds: number[];
  targetId: number;
  contextEmbeddings: number[][]; // [C][D]
  hiddenVector: number[]; // h in R^D
  logits: number[]; // u in R^V
  probabilities: number[]; // y_hat in R^V
  predictedId: number;
  predictedWord: string;
  loss: number;
}

export interface BackwardPassResult {
  errorVector: number[]; // e = y_hat - y in R^V
  gradW: number[][]; // dL/dW in R^[D x V]
  gradB: number[]; // dL/db in R^V
  gradH: number[]; // dL/dh in R^D
  gradContextEmbeddings: number[][]; // dL/dv_c in R^[C x D]
}

export interface StepCalculationState {
  currentPairIndex: number;
  forward: ForwardPassResult;
  backward: BackwardPassResult;
  weightsBefore: {
    E: number[][];
    W: number[][];
    b: number[];
  };
  weightsAfter: {
    E: number[][];
    W: number[][];
    b: number[];
  };
}

export interface TrainingLossPoint {
  step: number;
  epoch: number;
  loss: number;
  targetWord: string;
  predictedWord: string;
}

export interface WordEmbeddingPoint {
  id: number;
  word: string;
  x: number;
  y: number;
  rawVector: number[];
  nearestWords: {
    word: string;
    similarity: number;
  }[];
}
