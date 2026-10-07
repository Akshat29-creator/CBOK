'use client';

import React, { useState } from 'react';
import { Vocabulary } from '../lib/cbow/vocabulary';
import { dotProduct, vectorNorm, cosineSimilarity } from '../lib/cbow/matrix';
import { Compass, Equal, Divide, Sparkles, ChevronRight, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

interface CosineSimilarityExplorerProps {
  E: number[][];
  vocab: Vocabulary;
  embeddingDim: number;
}

export const CosineSimilarityExplorer: React.FC<CosineSimilarityExplorerProps> = ({
  E,
  vocab,
  embeddingDim,
}) => {
  const words = vocab.words;
  const [wordA, setWordA] = useState<string>(words[0] || 'cat');
  const [wordB, setWordB] = useState<string>(words[1] || words[0] || 'dog');

  const idA = vocab.getId(wordA) ?? 0;
  const idB = vocab.getId(wordB) ?? 0;

  const vecA = E[idA] || new Array(embeddingDim).fill(0);
  const vecB = E[idB] || new Array(embeddingDim).fill(0);

  const dot = dotProduct(vecA, vecB);
  const normA = vectorNorm(vecA);
  const normB = vectorNorm(vecB);
  const sim = cosineSimilarity(vecA, vecB);

  // Angle in degrees: theta = acos(clamp(sim, -1, 1))
  const clampedSim = Math.max(-1, Math.min(1, sim));
  const angleRad = Math.acos(clampedSim);
  const angleDeg = (angleRad * 180) / Math.PI;

  return (
    <div className="lab-card rounded-2xl p-6 border border-slate-800/80">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800/60 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/50">
              STAGE 17
            </span>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Interactive Cosine Similarity & Vector Angle Explorer
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Measures the cosine of the angle &theta; between two continuous embedding vectors, invariant to vector magnitude: <span className="font-mono text-amber-300">cos(&theta;) = (A &middot; B) / (||A|| ||B||)</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Angle: <strong className="text-amber-400">{angleDeg.toFixed(1)}&deg;</strong>
          </span>
        </div>
      </div>

      {/* Word Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {/* Word A */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-teal-900/50">
          <label className="text-xs font-bold text-teal-300 uppercase tracking-wider block mb-2">
            Select Word A
          </label>
          <select
            value={wordA}
            onChange={(e) => setWordA(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-teal-500"
          >
            {words.map((w) => (
              <option key={w} value={w}>
                "{w}" (ID: {vocab.getId(w)})
              </option>
            ))}
          </select>

          {/* Vector A Preview */}
          <div className="mt-3 text-xs font-mono text-slate-400">
            <span className="text-teal-400 font-semibold block mb-1">Vector A &isin; ℝ<sup>{embeddingDim}</sup>:</span>
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              [{vecA.map((v, i) => (
                <span key={i} className="text-teal-300 px-1">
                  {v >= 0 ? `+${v.toFixed(3)}` : v.toFixed(3)}
                </span>
              ))}]
            </div>
          </div>
        </div>

        {/* Word B */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-900/50">
          <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-2">
            Select Word B
          </label>
          <select
            value={wordB}
            onChange={(e) => setWordB(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
          >
            {words.map((w) => (
              <option key={w} value={w}>
                "{w}" (ID: {vocab.getId(w)})
              </option>
            ))}
          </select>

          {/* Vector B Preview */}
          <div className="mt-3 text-xs font-mono text-slate-400">
            <span className="text-indigo-400 font-semibold block mb-1">Vector B &isin; ℝ<sup>{embeddingDim}</sup>:</span>
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              [{vecB.map((v, i) => (
                <span key={i} className="text-indigo-300 px-1">
                  {v >= 0 ? `+${v.toFixed(3)}` : v.toFixed(3)}
                </span>
              ))}]
            </div>
          </div>
        </div>
      </div>

      {/* Mathematical Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-slate-400 block mb-1 font-sans font-semibold">
            1. Dot Product (A &middot; B)
          </span>
          <span className="text-lg font-bold text-cyan-300">
            {dot >= 0 ? `+${dot.toFixed(4)}` : dot.toFixed(4)}
          </span>
          <span className="block text-[10px] text-slate-500 font-sans mt-1">
            &Sigma; (A_i &times; B_i)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-slate-400 block mb-1 font-sans font-semibold">
            2. Magnitudes (||A|| &times; ||B||)
          </span>
          <span className="text-lg font-bold text-purple-300">
            {(normA * normB).toFixed(4)}
          </span>
          <span className="block text-[10px] text-slate-500 font-sans mt-1">
            ||A|| = {normA.toFixed(2)}, ||B|| = {normB.toFixed(2)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-800/50">
          <span className="text-slate-400 block mb-1 font-sans font-semibold">
            3. Cosine Similarity cos(&theta;)
          </span>
          <motion.span
            key={sim}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-lg font-bold ${
              sim > 0.6
                ? 'text-emerald-400'
                : sim > 0.2
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {sim.toFixed(4)}
          </motion.span>
          <span className="block text-[10px] text-slate-500 font-sans mt-1">
            Range: [-1.0 &le; cos &le; 1.0]
          </span>
        </div>
      </div>

      {/* Visual Radial Angle Gauge / Scale */}
      <div className="mt-6 p-5 rounded-xl bg-slate-950/90 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>Angle &theta; = 180&deg; (Opposite)</span>
            <span>&theta; = 90&deg; (Orthogonal)</span>
            <span>&theta; = 0&deg; (Identical)</span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full relative overflow-hidden border border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 opacity-80" />
            {/* Indicator Marker */}
            <motion.div
              className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-lg"
              style={{
                left: `${((clampedSim + 1) / 2) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="text-center sm:text-right">
          <span className="text-xs text-slate-400 font-semibold block">
            Semantic Interpretation:
          </span>
          <span
            className={`text-sm font-bold ${
              sim > 0.7
                ? 'text-emerald-400'
                : sim > 0.3
                ? 'text-cyan-300'
                : sim > -0.2
                ? 'text-slate-400'
                : 'text-rose-400'
            }`}
          >
            {sim > 0.7
              ? 'High Semantic Proximity'
              : sim > 0.3
              ? 'Moderate Association'
              : sim > -0.2
              ? 'Nearly Orthogonal / Independent'
              : 'Opposite Context Distribution'}
          </span>
        </div>
      </div>
    </div>
  );
};
