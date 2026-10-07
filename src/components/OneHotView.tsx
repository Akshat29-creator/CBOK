'use client';

import React from 'react';
import { TrainingPair } from '../lib/cbow/types';
import { Vocabulary } from '../lib/cbow/vocabulary';
import { motion } from 'framer-motion';
import { Hash, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface OneHotViewProps {
  currentPair: TrainingPair;
  vocab: Vocabulary;
}

export const OneHotView: React.FC<OneHotViewProps> = ({ currentPair, vocab }) => {
  const { contextWords, contextIds, targetWord, targetId } = currentPair;
  const V = vocab.size;

  return (
    <div className="lab-card rounded-2xl p-6 border border-slate-800/80">
      <div className="pb-4 mb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-950 text-purple-400 border border-purple-800/50">
            STAGE 05
          </span>
          <h3 className="text-base font-bold text-slate-100">
            One-Hot Vector Representation & Orthogonality
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Each input word is encoded as a sparse binary vector <span className="font-mono text-purple-300">x &isin; &#123;0, 1&#125;^&#123;|V|&#125;</span>, with a single 1 at its vocabulary index and 0 everywhere else.
        </p>
      </div>

      {/* Vectors Display */}
      <div className="space-y-4 my-4">
        {contextWords.map((word, idx) => {
          const cId = contextIds[idx];
          return (
            <div
              key={`${word}-${idx}`}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-teal-300 font-mono text-sm flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-400 text-xs">
                    x_&#123;{idx + 1}&#125;
                  </span>
                  Context Word: "{word}"
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  Vocabulary Index: <strong className="text-cyan-300">{cId}</strong> / {V - 1}
                </span>
              </div>

              {/* Vector Cells */}
              <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
                {Array.from({ length: V }).map((_, bitIdx) => {
                  const isOne = bitIdx === cId;
                  const wordAtBit = vocab.getWord(bitIdx);

                  return (
                    <motion.div
                      key={bitIdx}
                      initial={isOne ? { scale: 0.8, backgroundColor: '#0f172a' } : {}}
                      animate={isOne ? { scale: [1, 1.15, 1], backgroundColor: 'rgba(20, 184, 166, 0.25)' } : {}}
                      transition={{ duration: 0.5, repeat: isOne ? 1 : 0 }}
                      className={`flex flex-col items-center justify-center min-w-[28px] h-12 rounded-lg border text-center font-mono transition-all ${
                        isOne
                          ? 'border-teal-400 bg-teal-500/20 text-teal-200 font-extrabold shadow-md shadow-teal-950/50'
                          : 'border-slate-800/70 bg-slate-900/60 text-slate-500 text-xs'
                      }`}
                      title={`Bit ${bitIdx}: word "${wordAtBit}"`}
                    >
                      <span className="text-xs">{isOne ? '1' : '0'}</span>
                      <span className="text-[8px] text-slate-500 font-sans mt-0.5 max-w-[26px] truncate">
                        {wordAtBit}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Target Word One-Hot Vector (Supervision) */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-amber-300 font-mono text-sm flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-300 text-xs">
                y (Target)
              </span>
              Target Word: "{targetWord}"
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              Vocabulary Index: <strong className="text-amber-300">{targetId}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            {Array.from({ length: V }).map((_, bitIdx) => {
              const isOne = bitIdx === targetId;
              const wordAtBit = vocab.getWord(bitIdx);

              return (
                <div
                  key={bitIdx}
                  className={`flex flex-col items-center justify-center min-w-[28px] h-12 rounded-lg border text-center font-mono transition-all ${
                    isOne
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-extrabold shadow-md shadow-amber-950/50'
                      : 'border-slate-800/70 bg-slate-900/60 text-slate-500 text-xs'
                  }`}
                  title={`Bit ${bitIdx}: word "${wordAtBit}"`}
                >
                  <span className="text-xs">{isOne ? '1' : '0'}</span>
                  <span className="text-[8px] text-slate-500 font-sans mt-0.5 max-w-[26px] truncate">
                    {wordAtBit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deep Educational Note: Why Not One-Hot Directly? */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2 mt-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>The Limitation of One-Hot Vectors: The Orthogonality Problem</span>
        </div>
        <p className="leading-relaxed text-slate-300">
          In one-hot space, every single pair of distinct words is mathematically orthogonal:
          <span className="block my-1.5 font-mono text-[11px] text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800">
            x_&#123;cat&#125; &middot; x_&#123;dog&#125; = 0 &emsp;and&emsp; ||x_&#123;cat&#125; - x_&#123;dog&#125;||_2 = &radic;2
          </span>
          Because every pair has a cosine similarity of exactly 0 and an identical Euclidean distance of &radic;2, <strong>one-hot encoding contains zero semantic relationships</strong>. CBOW solves this by projecting these sparse $|V|$-dimensional vectors into a low-dimensional continuous vector space <span className="font-mono text-purple-300">ℝ<sup>D</sup></span> where similar words cluster together!
        </p>
      </div>
    </div>
  );
};
