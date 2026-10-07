import { CBOWConfig, ForwardPassResult, BackwardPassResult, StepCalculationState, WordEmbeddingPoint } from './types';
import { PRNG } from './prng';
import { Vocabulary } from './vocabulary';
import {
  softmax,
  crossEntropyLoss,
  vectorNorm,
  cosineSimilarity,
  projectPCA2D,
} from './matrix';

export class CBOWModel {
  public config: CBOWConfig;
  public vocab: Vocabulary;
  public V: number;
  public D: number;

  // Model parameters
  // E in R^[V x D]: Embedding matrix (input representations)
  public E: number[][];
  // W in R^[D x V]: Output projection matrix
  public W: number[][];
  // b in R^V: Output bias vector
  public b: number[];

  private prng: PRNG;

  constructor(vocab: Vocabulary, config: CBOWConfig) {
    this.vocab = vocab;
    this.config = { ...config };
    this.V = vocab.size;
    this.D = config.embeddingDim;
    this.prng = new PRNG(config.seed);

    this.E = [];
    this.W = [];
    this.b = [];

    this.initWeights();
  }

  /**
   * Deterministic weight initialization
   * E is initialized with small values ~ N(0, 0.1) or Uniform(-0.5, 0.5) / sqrt(D)
   * W is initialized with Xavier/He style ~ N(0, 1 / sqrt(D))
   * b is initialized to 0
   */
  public initWeights(): void {
    this.prng = new PRNG(this.config.seed);
    const D = this.config.embeddingDim;
    const V = this.vocab.size;

    const scaleE = 1.0 / Math.sqrt(D);
    this.E = Array.from({ length: V }, () =>
      Array.from({ length: D }, () => this.prng.uniform(scaleE))
    );

    const scaleW = 1.0 / Math.sqrt(D);
    this.W = Array.from({ length: D }, () =>
      Array.from({ length: V }, () => this.prng.uniform(scaleW))
    );

    this.b = new Array(V).fill(0);
  }

  public cloneWeights(): { E: number[][]; W: number[][]; b: number[] } {
    return {
      E: this.E.map((row) => [...row]),
      W: this.W.map((row) => [...row]),
      b: [...this.b],
    };
  }

  /**
   * Forward Pass
   */
  public forward(contextIds: number[], targetId: number): ForwardPassResult {
    const C = contextIds.length;
    const D = this.D;
    const V = this.V;

    // 1. Embedding lookup: retrieve row for each context ID
    const contextEmbeddings: number[][] = contextIds.map((cid) => {
      return [...this.E[cid]];
    });

    // 2. Aggregate context embeddings into hidden vector h
    const hiddenVector = new Array(D).fill(0);
    if (C > 0) {
      for (let d = 0; d < D; d++) {
        let sum = 0;
        for (let i = 0; i < C; i++) {
          sum += contextEmbeddings[i][d];
        }
        hiddenVector[d] = this.config.aggregation === 'average' ? sum / C : sum;
      }
    }

    // 3. Compute output logits u = W^T * h + b
    const logits = new Array(V).fill(0);
    for (let j = 0; j < V; j++) {
      let score = this.b[j];
      for (let d = 0; d < D; d++) {
        score += hiddenVector[d] * this.W[d][j];
      }
      logits[j] = score;
    }

    // 4. Softmax probability distribution
    const probabilities = softmax(logits);

    // 5. Predicted word (argmax)
    let maxProb = -1;
    let predictedId = 0;
    for (let j = 0; j < V; j++) {
      if (probabilities[j] > maxProb) {
        maxProb = probabilities[j];
        predictedId = j;
      }
    }

    // 6. Cross-entropy loss L = -log(y_hat[targetId])
    const loss = crossEntropyLoss(probabilities, targetId);

    return {
      contextIds,
      targetId,
      contextEmbeddings,
      hiddenVector,
      logits,
      probabilities,
      predictedId,
      predictedWord: this.vocab.getWord(predictedId) || '',
      loss,
    };
  }

  /**
   * Backward Pass: Calculate exact gradients for CBOW
   */
  public backward(
    forward: ForwardPassResult,
    targetId: number
  ): BackwardPassResult {
    const V = this.V;
    const D = this.D;
    const C = forward.contextIds.length;

    // 1. Error vector at output: e = y_hat - y  (in R^V)
    const errorVector = new Array(V);
    for (let j = 0; j < V; j++) {
      const targetVal = j === targetId ? 1 : 0;
      errorVector[j] = forward.probabilities[j] - targetVal;
    }

    // 2. Gradient w.r.t bias b: dL/db = e
    const gradB = [...errorVector];

    // 3. Gradient w.r.t W: dL/dW = h * e^T  (in R^[D x V])
    const gradW: number[][] = Array.from({ length: D }, (_, d) => {
      const h_d = forward.hiddenVector[d];
      return Array.from({ length: V }, (_, j) => h_d * errorVector[j]);
    });

    // 4. Gradient w.r.t hidden vector h: dL/dh = W * e  (in R^D)
    const gradH = new Array(D).fill(0);
    for (let d = 0; d < D; d++) {
      let sum = 0;
      for (let j = 0; j < V; j++) {
        sum += this.W[d][j] * errorVector[j];
      }
      gradH[d] = sum;
    }

    // 5. Gradient w.r.t each context embedding v_c:
    // If average: dL/dv_c = (1/C) * gradH
    // If sum: dL/dv_c = gradH
    const scale = this.config.aggregation === 'average' ? 1 / (C || 1) : 1;
    const gradContextEmbeddings: number[][] = forward.contextIds.map(() => {
      return gradH.map((gh) => gh * scale);
    });

    return {
      errorVector,
      gradW,
      gradB,
      gradH,
      gradContextEmbeddings,
    };
  }

  /**
   * Perform Gradient Descent step using computed gradients
   */
  public applyGradients(
    forward: ForwardPassResult,
    backward: BackwardPassResult
  ): void {
    const lr = this.config.learningRate;
    const D = this.D;
    const V = this.V;

    // 1. Update W: W = W - lr * gradW
    for (let d = 0; d < D; d++) {
      for (let j = 0; j < V; j++) {
        this.W[d][j] -= lr * backward.gradW[d][j];
      }
    }

    // 2. Update b: b = b - lr * gradB
    for (let j = 0; j < V; j++) {
      this.b[j] -= lr * backward.gradB[j];
    }

    // 3. Update E for context words
    for (let i = 0; i < forward.contextIds.length; i++) {
      const cid = forward.contextIds[i];
      const grad_vc = backward.gradContextEmbeddings[i];
      for (let d = 0; d < D; d++) {
        this.E[cid][d] -= lr * grad_vc[d];
      }
    }
  }

  /**
   * Single training step capturing before & after states for visualizer
   */
  public step(
    contextIds: number[],
    targetId: number,
    pairIndex: number
  ): StepCalculationState {
    const weightsBefore = this.cloneWeights();
    const forward = this.forward(contextIds, targetId);
    const backward = this.backward(forward, targetId);

    this.applyGradients(forward, backward);
    const weightsAfter = this.cloneWeights();

    return {
      currentPairIndex: pairIndex,
      forward,
      backward,
      weightsBefore,
      weightsAfter,
    };
  }

  /**
   * Train full epoch over all pairs and return average epoch loss
   */
  public trainEpoch(
    pairs: { contextIds: number[]; targetId: number }[]
  ): number {
    let totalLoss = 0;
    for (const pair of pairs) {
      const forward = this.forward(pair.contextIds, pair.targetId);
      const backward = this.backward(forward, pair.targetId);
      this.applyGradients(forward, backward);
      totalLoss += forward.loss;
    }
    return totalLoss / (pairs.length || 1);
  }

  /**
   * Extract 2D projected embeddings and nearest neighbors for all vocabulary words
   */
  public getEmbeddingPlotData(): WordEmbeddingPoint[] {
    const V = this.V;
    if (V === 0) return [];

    // 2D projection via PCA
    const coords = projectPCA2D(this.E);

    const points: WordEmbeddingPoint[] = [];

    for (let i = 0; i < V; i++) {
      const word = this.vocab.getWord(i) || `word_${i}`;
      const vecI = this.E[i];

      // Calculate similarities to all other words
      const simList: { word: string; similarity: number }[] = [];
      for (let j = 0; j < V; j++) {
        if (i === j) continue;
        const otherWord = this.vocab.getWord(j) || `word_${j}`;
        const sim = cosineSimilarity(vecI, this.E[j]);
        simList.push({ word: otherWord, similarity: sim });
      }

      simList.sort((a, b) => b.similarity - a.similarity);

      points.push({
        id: i,
        word,
        x: Number((coords[i]?.x ?? 0).toFixed(4)),
        y: Number((coords[i]?.y ?? 0).toFixed(4)),
        rawVector: vecI.map((v) => Number(v.toFixed(4))),
        nearestWords: simList.slice(0, 5).map((s) => ({
          word: s.word,
          similarity: Number(s.similarity.toFixed(4)),
        })),
      });
    }

    return points;
  }
}
