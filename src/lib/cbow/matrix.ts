/**
 * High-performance Linear Algebra and Numerical Operations for CBOW
 */

export function vectorAdd(a: number[], b: number[]): number[] {
  const len = a.length;
  const res = new Array(len);
  for (let i = 0; i < len; i++) {
    res[i] = a[i] + b[i];
  }
  return res;
}

export function vectorSub(a: number[], b: number[]): number[] {
  const len = a.length;
  const res = new Array(len);
  for (let i = 0; i < len; i++) {
    res[i] = a[i] - b[i];
  }
  return res;
}

export function vectorScale(a: number[], s: number): number[] {
  const len = a.length;
  const res = new Array(len);
  for (let i = 0; i < len; i++) {
    res[i] = a[i] * s;
  }
  return res;
}

export function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export function vectorNorm(a: number[]): number {
  return Math.sqrt(dotProduct(a, a));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const normA = vectorNorm(a);
  const normB = vectorNorm(b);
  if (normA < 1e-12 || normB < 1e-12) return 0;
  return dotProduct(a, b) / (normA * normB);
}

/**
 * Numerically stable Softmax calculation
 */
export function softmax(logits: number[]): number[] {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) {
    if (logits[i] > max) max = logits[i];
  }

  const exp = new Array(logits.length);
  let sumExp = 0;
  for (let i = 0; i < logits.length; i++) {
    const val = Math.exp(logits[i] - max);
    exp[i] = val;
    sumExp += val;
  }

  const probs = new Array(logits.length);
  for (let i = 0; i < logits.length; i++) {
    probs[i] = exp[i] / (sumExp || 1e-12);
  }
  return probs;
}

/**
 * Categorical Cross-Entropy Loss: L = -log(prob[targetId])
 */
export function crossEntropyLoss(probs: number[], targetId: number): number {
  const p = Math.max(1e-12, Math.min(1.0, probs[targetId] || 1e-12));
  return -Math.log(p);
}

/**
 * Transpose of matrix M [rows x cols] -> [cols x rows]
 */
export function transpose(M: number[][]): number[][] {
  const rows = M.length;
  if (rows === 0) return [];
  const cols = M[0].length;
  const result: number[][] = Array.from({ length: cols }, () => new Array(rows));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][r] = M[r][c];
    }
  }
  return result;
}

/**
 * Outer product: a in R^N, b in R^M -> result in R^[N x M]
 */
export function outerProduct(a: number[], b: number[]): number[][] {
  const N = a.length;
  const M = b.length;
  const res: number[][] = Array.from({ length: N }, () => new Array(M));
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      res[i][j] = a[i] * b[j];
    }
  }
  return res;
}

/**
 * PCA 2D projection using Power Iteration to extract the top 2 principal components
 * Input: matrix X of shape [V x D] (V samples, D features)
 * Output: 2D coordinates [V x 2] normalized between [-1, 1]
 */
export function projectPCA2D(X: number[][]): { x: number; y: number }[] {
  const N = X.length;
  if (N === 0) return [];
  const D = X[0].length;

  if (D === 1) {
    return X.map((row) => ({ x: row[0], y: 0 }));
  }

  if (D === 2) {
    // Already 2D! Just center and normalize
    let meanX = 0;
    let meanY = 0;
    for (let i = 0; i < N; i++) {
      meanX += X[i][0];
      meanY += X[i][1];
    }
    meanX /= N;
    meanY /= N;

    let maxDist = 1e-6;
    const centered = X.map((row) => {
      const cx = row[0] - meanX;
      const cy = row[1] - meanY;
      const dist = Math.sqrt(cx * cx + cy * cy);
      if (dist > maxDist) maxDist = dist;
      return { x: cx, y: cy };
    });

    return centered.map((pt) => ({
      x: pt.x / maxDist,
      y: pt.y / maxDist,
    }));
  }

  // 1. Mean-center X
  const mean = new Array(D).fill(0);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < D; j++) {
      mean[j] += X[i][j];
    }
  }
  for (let j = 0; j < D; j++) mean[j] /= N;

  const centeredX: number[][] = Array.from({ length: N }, (_, i) => {
    return Array.from({ length: D }, (_, j) => X[i][j] - mean[j]);
  });

  // 2. Compute Covariance Matrix: C = (X_c^T * X_c) / N  [D x D]
  const cov: number[][] = Array.from({ length: D }, () => new Array(D).fill(0));
  for (let i = 0; i < D; i++) {
    for (let j = 0; j < D; j++) {
      let sum = 0;
      for (let k = 0; k < N; k++) {
        sum += centeredX[k][i] * centeredX[k][j];
      }
      cov[i][j] = sum / (N || 1);
    }
  }

  // 3. Power Iteration for 1st eigenvector
  function powerIteration(A: number[][], deflatedVectors: number[][] = []): number[] {
    let v = Array.from({ length: D }, (_, i) => Math.sin(i + 1));
    // Orthogonalize against deflated
    for (const d of deflatedVectors) {
      const proj = dotProduct(v, d);
      v = vectorSub(v, vectorScale(d, proj));
    }
    let norm = vectorNorm(v) || 1;
    v = vectorScale(v, 1 / norm);

    for (let iter = 0; iter < 40; iter++) {
      // w = A * v
      const w = new Array(D).fill(0);
      for (let r = 0; r < D; r++) {
        for (let c = 0; c < D; c++) {
          w[r] += A[r][c] * v[c];
        }
      }
      // Deflate
      let wDeflated = [...w];
      for (const d of deflatedVectors) {
        const proj = dotProduct(wDeflated, d);
        wDeflated = vectorSub(wDeflated, vectorScale(d, proj));
      }
      norm = vectorNorm(wDeflated);
      if (norm < 1e-12) break;
      v = vectorScale(wDeflated, 1 / norm);
    }
    return v;
  }

  const pc1 = powerIteration(cov, []);
  const pc2 = powerIteration(cov, [pc1]);

  // 4. Project centeredX onto pc1 and pc2
  const rawProjected: { x: number; y: number }[] = [];
  let maxX = 1e-6;
  let maxY = 1e-6;

  for (let i = 0; i < N; i++) {
    const px = dotProduct(centeredX[i], pc1);
    const py = dotProduct(centeredX[i], pc2);
    if (Math.abs(px) > maxX) maxX = Math.abs(px);
    if (Math.abs(py) > maxY) maxY = Math.abs(py);
    rawProjected.push({ x: px, y: py });
  }

  // Scale independently so both dimensions span comfortably within [-0.72, 0.72]
  const scaled = rawProjected.map((p) => ({
    x: (p.x / maxX) * 0.72,
    y: (p.y / maxY) * 0.72,
  }));

  // 5. Anti-collision relaxation: ensure points don't awkwardly stack on top of each other
  const pts = scaled.map((p) => ({ ...p }));
  const minDistance = 0.16; // comfortable visual separation

  for (let iter = 0; iter < 35; iter++) {
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance && dist > 1e-6) {
          const overlap = (minDistance - dist) * 0.5;
          const nx = (dx / dist) * overlap * 0.35;
          const ny = (dy / dist) * overlap * 0.35;
          pts[i].x = Math.max(-0.76, Math.min(0.76, pts[i].x + nx));
          pts[i].y = Math.max(-0.76, Math.min(0.76, pts[i].y + ny));
          pts[j].x = Math.max(-0.76, Math.min(0.76, pts[j].x - nx));
          pts[j].y = Math.max(-0.76, Math.min(0.76, pts[j].y - ny));
        }
      }
    }
  }

  return pts;
}
