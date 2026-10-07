'use client';

import React from 'react';
import { BackwardPassResult, ForwardPassResult, TrainingPair } from '../lib/cbow/types';
import { Vocabulary } from '../lib/cbow/vocabulary';
import { motion } from 'framer-motion';
import { ArrowLeft, GitCommit, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';

interface BackpropagationViewProps {
  forward: ForwardPassResult;
  backward: BackwardPassResult;
  currentPair: TrainingPair;
  vocab: Vocabulary;
  embeddingDim: number;
  aggregation: 'average' | 'sum';
}

export const BackpropagationView: React.FC<BackpropagationViewProps> = ({
  forward,
  backward,
  currentPair,
  vocab,
  embeddingDim,
  aggregation,
}) => {
  const { targetWord, targetId, contextWords, contextIds } = currentPair;
  const { errorVector, gradH, gradW, gradContextEmbeddings } = backward;
  const D = embeddingDim;
  const V = vocab.size;
  const C = contextWords.length;

  return (
    <div className="lab-card rounded-2xl p-6 border border-slate-800/80">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800/60 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-800/50">
              STAGE 12 & 13
            </span>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Backpropagation & Gradient Flow Derivations
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Applying the chain rule backward from the loss <span className="font-mono text-rose-300">L</span> computes exact parameter sensitivities: <span className="font-mono text-rose-300">&part;L/&part;W</span>, <span className="font-mono text-indigo-300">&part;L/&part;h</span>, and <span className="font-mono text-teal-300">&part;L/&part;E</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-rose-950/70 border border-rose-800/60 text-xs font-mono text-rose-300 font-semibold flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            Reverse Gradient Direction
          </span>
        </div>
      </div>

      {/* Visual Reverse Flow Stepper */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 my-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Gradient Backpropagation Chain
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="px-3 py-2 rounded-lg bg-rose-950/60 border border-rose-700 text-rose-300 text-center">
            Loss L
            <span className="block text-[9px] text-slate-400 font-sans mt-0.5">-ln(&ycirc;_t)</span>
          </div>

          <ArrowLeft className="w-4 h-4 text-rose-400" />

          <div className="px-3 py-2 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-200 text-center">
            Error e = &ycirc; - y
            <span className="block text-[9px] text-slate-400 font-sans mt-0.5">&isin; ℝ<sup>|V|</sup></span>
          </div>

          <ArrowLeft className="w-4 h-4 text-purple-400" />

          <div className="px-3 py-2 rounded-lg bg-purple-950/50 border border-purple-800 text-purple-200 text-center">
            &part;L/&part;W = h e^T
            <span className="block text-[9px] text-slate-400 font-sans mt-0.5">&isin; ℝ<sup>{D}&times;|V|</sup></span>
          </div>

          <ArrowLeft className="w-4 h-4 text-indigo-400" />

          <div className="px-3 py-2 rounded-lg bg-indigo-950/50 border border-indigo-800 text-indigo-200 text-center">
            &part;L/&part;h = W e
            <span className="block text-[9px] text-slate-400 font-sans mt-0.5">&isin; ℝ<sup>{D}</sup></span>
          </div>

          <ArrowLeft className="w-4 h-4 text-teal-400" />

          <div className="px-3 py-2 rounded-lg bg-teal-950/50 border border-teal-800 text-teal-200 text-center">
            &part;L/&part;v_c = 1/C &part;L/&part;h
            <span className="block text-[9px] text-slate-400 font-sans mt-0.5">&isin; ℝ<sup>{D}</sup></span>
          </div>
        </div>
      </div>

      {/* Numerical Gradient Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-4">
        {/* Component 1: Output Error Vector e = y_hat - y */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-rose-300 font-mono">
              1. Output Error Vector: e = &ycirc; - y &isin; ℝ<sup>{V}</sup>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Target ID: {targetId} ({targetWord})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5">
            Remarkable analytic derivation: For softmax + cross-entropy, the gradient simplifies to <span className="font-mono text-rose-300">e_j = &ycirc;_j - 1</span> for the target, and <span className="font-mono text-cyan-300">e_j = &ycirc;_j</span> for all other words!
          </p>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1 font-mono text-[11px]">
            <span className="text-slate-600">[</span>
            {errorVector.map((val, idx) => {
              const isTargetBit = idx === targetId;
              return (
                <span
                  key={idx}
                  className={`px-1.5 py-0.5 rounded text-center font-semibold ${
                    isTargetBit
                      ? 'bg-rose-950 border border-rose-600 text-rose-300 shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}
                  title={`Word "${vocab.getWord(idx)}": error = ${val.toFixed(3)}`}
                >
                  {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                </span>
              );
            })}
            <span className="text-slate-600">]</span>
          </div>
        </div>

        {/* Component 2: Hidden Vector Gradient dL/dh = W * e */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-indigo-300 font-mono">
              2. Backpropagated Hidden Gradient: &part;L/&part;h = W e &isin; ℝ<sup>{D}</sup>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Dimension D = {D}</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5">
            The error is projected backward through output matrix <span className="font-mono text-purple-300">W</span> into the hidden representation space.
          </p>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1 font-mono text-[11px]">
            <span className="text-slate-600">[</span>
            {gradH.map((gh, dIdx) => (
              <span
                key={dIdx}
                className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-semibold"
              >
                {gh >= 0 ? `+${gh.toFixed(3)}` : gh.toFixed(3)}
              </span>
            ))}
            <span className="text-slate-600">]</span>
          </div>
        </div>
      </div>

      {/* Component 3: Gradients for Context Word Embeddings */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-teal-900/40">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-teal-300 font-mono">
            3. Context Word Embedding Gradients: &part;L/&part;v_c = {aggregation === 'average' ? '1/C &part;L/&part;h' : '&part;L/&part;h'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Distributed to {C} context rows in E
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {contextWords.map((cw, idx) => {
            const gradVec = gradContextEmbeddings[idx] || new Array(D).fill(0);
            return (
              <div key={idx} className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs font-mono">
                <span className="text-teal-300 font-semibold block mb-1">
                  &nabla; v_&#123;{cw}&#125; (Row {contextIds[idx]}):
                </span>
                <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
                  <span className="text-slate-600">[</span>
                  {gradVec.map((v, d) => (
                    <span key={d} className="text-teal-400">
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
    </div>
  );
};
