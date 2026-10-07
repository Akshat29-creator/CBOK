'use client';

import React from 'react';
import { TrainingPair } from '../lib/cbow/types';
import { motion } from 'framer-motion';
import { Plus, Equal, Divide, Sparkles, Layers } from 'lucide-react';

interface ContextAggregationViewProps {
  contextEmbeddings: number[][]; // [C x D]
  hiddenVector: number[]; // h in R^D
  currentPair: TrainingPair;
  aggregation: 'average' | 'sum';
  onToggleAggregation: (mode: 'average' | 'sum') => void;
  embeddingDim: number;
}

export const ContextAggregationView: React.FC<ContextAggregationViewProps> = ({
  contextEmbeddings,
  hiddenVector,
  currentPair,
  aggregation,
  onToggleAggregation,
  embeddingDim,
}) => {
  const { contextWords } = currentPair;
  const C = contextWords.length;
  const D = embeddingDim;

  // Compute intermediate element-wise sum
  const sumVector = new Array(D).fill(0);
  for (let d = 0; d < D; d++) {
    let s = 0;
    for (let i = 0; i < C; i++) {
      s += contextEmbeddings[i]?.[d] ?? 0;
    }
    sumVector[d] = s;
  }

  return (
    <div className="lab-card rounded-2xl p-6 border border-slate-800/80">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800/60 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-800/50">
              STAGE 07
            </span>
            <h3 className="text-base font-bold text-slate-100">
              Context Embedding Aggregation & Projection into Hidden Vector h
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            CBOW combines the context vectors into a single fixed-length hidden representation <span className="font-mono text-indigo-300 font-bold">h &isin; ℝ<sup>D</sup></span>, discarding order to produce a continuous "Bag" of words.
          </p>
        </div>

        {/* Aggregation Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 px-2 font-medium">Mode:</span>
          {(['average', 'sum'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onToggleAggregation(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold transition ${
                aggregation === mode
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Step-by-Step Numerical Aggregation Pipeline */}
      <div className="my-6 space-y-6">
        {/* Step 1: Input Context Vectors */}
        <div>
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-teal-400 font-mono text-[10px] flex items-center justify-center font-bold">
              1
            </span>
            Individual Context Embeddings (v_c)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {contextWords.map((cw, idx) => {
              const vec = contextEmbeddings[idx] || new Array(D).fill(0);
              return (
                <div
                  key={`${cw}-${idx}`}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-teal-900/40"
                >
                  <div className="text-xs font-semibold text-teal-300 font-mono mb-2 flex items-center justify-between">
                    <span>v_&#123;{cw}&#125;</span>
                    <span className="text-[10px] text-slate-500 font-sans">Index {idx + 1}/{C}</span>
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto py-1 font-mono text-xs">
                    <span className="text-slate-600">[</span>
                    {vec.map((v, d) => (
                      <span
                        key={d}
                        className="px-1.5 py-0.5 rounded bg-slate-900 text-teal-300 font-semibold"
                      >
                        {v >= 0 ? `+${v.toFixed(3)}` : v.toFixed(3)}
                      </span>
                    ))}
                    <span className="text-slate-600">]</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Intermediate Element-Wise Sum */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-mono text-[10px] flex items-center justify-center font-bold">
              2
            </span>
            Vector Accumulation: &Sigma; v_c
          </div>

          <div className="flex items-center gap-2 flex-wrap font-mono text-xs text-slate-300">
            <span className="text-indigo-400 font-bold">&Sigma; =</span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-slate-600">[</span>
              {sumVector.map((sv, d) => (
                <span
                  key={d}
                  className="px-2 py-1 rounded bg-indigo-950/80 border border-indigo-800/60 text-indigo-200 font-semibold"
                >
                  {sv >= 0 ? `+${sv.toFixed(3)}` : sv.toFixed(3)}
                </span>
              ))}
              <span className="text-slate-600">]</span>
            </div>
          </div>
        </div>

        {/* Step 3: Normalization / Final Hidden Vector h */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 border border-indigo-600/50 shadow-lg shadow-indigo-950/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                3
              </span>
              Final Hidden Layer Vector h &isin; ℝ<sup>{D}</sup>
            </div>
            <span className="text-xs font-mono text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded border border-indigo-700/60">
              {aggregation === 'average'
                ? `Formula: h = (1 / ${C}) &Sigma; v_c`
                : 'Formula: h = &Sigma; v_c'}
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto py-2 font-mono text-sm">
            <span className="text-slate-400 font-bold">h =</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-bold text-lg">[</span>
              {hiddenVector.map((val, d) => (
                <motion.div
                  key={d}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center justify-center px-3 py-2 rounded-lg bg-indigo-900/60 border border-indigo-500/80 text-indigo-100 font-bold shadow-inner"
                >
                  <span>{val >= 0 ? `+${val.toFixed(3)}` : val.toFixed(3)}</span>
                  <span className="text-[9px] text-indigo-300 font-sans mt-0.5">Dim {d + 1}</span>
                </motion.div>
              ))}
              <span className="text-slate-600 font-bold text-lg">]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Callout: Average vs Sum */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
        <strong className="text-indigo-400">Why Average Context Embeddings? </strong>
        Averaging normalizes for variable context window sizes (e.g., when a target word is near sentence boundaries where C &lt; 2 &times; c). Without averaging, sentences with larger context windows would generate hidden vectors with much larger magnitudes, destabilizing the gradient updates.
      </div>
    </div>
  );
};
