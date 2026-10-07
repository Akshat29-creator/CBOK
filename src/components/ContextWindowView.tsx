'use client';

import React from 'react';
import { TrainingPair } from '../lib/cbow/types';
import { motion } from 'framer-motion';
import { Target, Layers, ArrowRight, ChevronLeft, ChevronRight, Sparkles, Sliders } from 'lucide-react';

interface ContextWindowViewProps {
  pairs: TrainingPair[];
  currentPairIndex: number;
  onSelectPairIndex: (index: number) => void;
  windowSize: number;
}

export const ContextWindowView: React.FC<ContextWindowViewProps> = ({
  pairs,
  currentPairIndex,
  onSelectPairIndex,
  windowSize,
}) => {
  const currentPair = pairs[currentPairIndex] || pairs[0];

  if (!currentPair) {
    return (
      <div className="lab-card rounded-2xl p-6 text-center text-slate-400">
        No training pairs generated. Please add more words to your corpus.
      </div>
    );
  }

  const { fullSentenceTokens, targetIndex, targetWord, contextWords } = currentPair;

  return (
    <div className="lab-card rounded-2xl p-6 border border-slate-800/80 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800/60 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/50">
              STAGE 03 & 04 &bull; DATASET
            </span>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Sliding Context Window & Supervised Pair Extraction
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            A window of radius <span className="font-mono text-cyan-300 font-semibold">&plusmn;{windowSize}</span> slides across the sequence. Symmetrical context words frame the center target word without manual annotation.
          </p>
        </div>

        {/* Pair Stepper Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectPairIndex(Math.max(0, currentPairIndex - 1))}
            disabled={currentPairIndex <= 0}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Previous Training Pair"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
            Pair <span className="text-amber-400 font-bold">{currentPairIndex + 1}</span> of{' '}
            <span className="text-slate-400">{pairs.length}</span>
          </span>
          <button
            onClick={() => onSelectPairIndex(Math.min(pairs.length - 1, currentPairIndex + 1))}
            disabled={currentPairIndex >= pairs.length - 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Next Training Pair"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sleek Sequence Tape / Horizontal Token Track */}
      <div className="my-4 p-6 rounded-2xl bg-[#050811] border border-slate-800/90 relative overflow-hidden shadow-inner">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Active Token Sequence Track
          </span>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
            Window Radius c = &plusmn;{windowSize}
          </span>
        </div>

        {/* Horizontal Tokens Line */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-6">
          {fullSentenceTokens.map((token, idx) => {
            const isTarget = idx === targetIndex;
            const isContext =
              !isTarget && Math.abs(idx - targetIndex) <= windowSize;

            return (
              <motion.div
                key={idx}
                layout
                className={`relative px-4 py-3 rounded-xl border font-mono text-sm sm:text-base font-bold transition-all duration-300 shadow-lg ${
                  isTarget
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 shadow-amber-950/80 scale-110 z-20'
                    : isContext
                    ? 'bg-teal-500/15 border-teal-500/70 text-teal-200 shadow-teal-950/50 z-10'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-50'
                }`}
              >
                {/* Floating Role Label */}
                {isTarget && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-sans uppercase font-extrabold bg-amber-400 text-slate-950 tracking-wider shadow-md">
                    TARGET
                  </span>
                )}
                {isContext && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-sans uppercase font-extrabold bg-teal-600 text-white tracking-wider shadow-md">
                    CONTEXT
                  </span>
                )}

                <span>{token}</span>

                <span className="block text-[9px] text-center font-normal opacity-60 mt-0.5 font-mono">
                  pos {idx}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Current Pair Formulation Summary */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">Context Window Bag:</span>
            <div className="flex items-center gap-1.5">
              {contextWords.map((cw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-teal-950/80 border border-teal-800/60 text-teal-300 font-mono font-semibold shadow-sm"
                >
                  "{cw}"
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
            <span className="text-slate-400">Supervised Target Label:</span>
            <span className="px-3.5 py-1 rounded-lg bg-amber-950/80 border border-amber-600/70 text-amber-300 font-mono font-bold text-sm shadow-sm">
              "{targetWord}"
            </span>
          </div>
        </div>
      </div>

      {/* Generated Training Pairs Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Generated CBOW Training Dataset ({pairs.length} Pairs)
          </h4>
          <span className="text-[11px] text-slate-500">
            Click any row to simulate that training step
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60 max-h-56">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800">
              <tr>
                <th className="px-3 py-2 font-semibold text-center w-12">#</th>
                <th className="px-4 py-2 font-semibold">Context Words (Inputs)</th>
                <th className="px-4 py-2 font-semibold">Target Word (Supervision)</th>
                <th className="px-4 py-2 font-semibold">Sentence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {pairs.map((p, idx) => {
                const isSelected = idx === currentPairIndex;
                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectPairIndex(idx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-950/40 text-amber-200 font-bold border-l-2 border-amber-400'
                        : 'hover:bg-slate-900/40 text-slate-300'
                    }`}
                  >
                    <td className="px-3 py-2 text-center text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-2 text-teal-300">
                      [{p.contextWords.map((w) => `"${w}"`).join(', ')}]
                    </td>
                    <td className="px-4 py-2 text-amber-300 font-bold font-sans">
                      "{p.targetWord}"
                    </td>
                    <td className="px-4 py-2 text-slate-400 font-sans truncate max-w-xs">
                      {p.fullSentenceTokens.join(' ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
