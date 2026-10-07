'use client';

import React from 'react';
import { TrainingPair } from '../lib/cbow/types';
import { Vocabulary } from '../lib/cbow/vocabulary';
import { motion } from 'framer-motion';
import { Table, ArrowRight, Sparkles, Check } from 'lucide-react';

interface EmbeddingLayerViewProps {
  E: number[][]; // [V x D]
  currentPair: TrainingPair;
  vocab: Vocabulary;
  embeddingDim: number;
}

export const EmbeddingLayerView: React.FC<EmbeddingLayerViewProps> = ({
  E,
  currentPair,
  vocab,
  embeddingDim,
}) => {
  const { contextWords, contextIds } = currentPair;
  const V = vocab.size;
  const D = embeddingDim;

  return (
    <div className="lab-card rounded-2xl p-6 border border-slate-800/80">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800/60 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/50">
              STAGE 06
            </span>
            <h3 className="text-base font-bold text-slate-100">
              Embedding Layer Matrix Lookup (Input Representations)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Embedding weights form a continuous matrix <span className="font-mono text-cyan-300 font-bold">E &isin; ℝ<sup>|V| &times; D</sup></span>. Multiplying one-hot vector <span className="font-mono text-teal-300">x_c</span> by <span className="font-mono text-cyan-300">E</span> is mathematically equivalent to looking up row <span className="font-mono text-amber-300">c</span>!
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            Shape: <strong className="text-cyan-300">[{V} &times; {D}]</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4">
        {/* Left Side: Embedding Matrix E Table */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-cyan-400" />
              Weight Matrix E &isin; ℝ<sup>{V} &times; {D}</sup>
            </span>
            <span className="text-[11px] text-teal-400 font-semibold">
              Highlighted = Active Context Rows
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/70 max-h-80">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2 font-semibold">Word (Row)</th>
                  <th className="px-3 py-2 font-semibold text-center">ID</th>
                  {Array.from({ length: D }).map((_, d) => (
                    <th key={d} className="px-3 py-2 text-right font-semibold text-cyan-400">
                      Dim {d + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {vocab.words.map((word, wIdx) => {
                  const isContextWord = contextIds.includes(wIdx);
                  const rowVec = E[wIdx] || new Array(D).fill(0);

                  return (
                    <motion.tr
                      key={wIdx}
                      animate={
                        isContextWord
                          ? { backgroundColor: 'rgba(20, 184, 166, 0.15)' }
                          : { backgroundColor: 'rgba(20, 184, 166, 0)' }
                      }
                      className={`transition-colors ${
                        isContextWord
                          ? 'text-teal-200 font-bold border-l-2 border-teal-400'
                          : 'text-slate-400 hover:bg-slate-900/30'
                      }`}
                    >
                      <td className="px-3 py-2 font-sans font-medium text-slate-200 flex items-center gap-2">
                        {isContextWord && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                        )}
                        {word}
                      </td>
                      <td className="px-3 py-2 text-center text-slate-500 font-bold">
                        {wIdx}
                      </td>
                      {rowVec.map((val, dIdx) => (
                        <td
                          key={dIdx}
                          className={`px-3 py-2 text-right ${
                            isContextWord ? 'text-teal-300 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          {val >= 0 ? `+${val.toFixed(3)}` : val.toFixed(3)}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Retrieved Context Embeddings Breakdown */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Retrieved Context Vectors (v_c)
              </span>
              <span className="text-[11px] font-mono text-cyan-400">C = {contextWords.length} words</span>
            </div>

            <div className="space-y-3">
              {contextWords.map((cw, idx) => {
                const cId = contextIds[idx];
                const vec = E[cId] || new Array(D).fill(0);

                return (
                  <motion.div
                    key={`${cw}-${idx}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-teal-800/40 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-teal-300 font-mono flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-teal-950 text-teal-400 text-[10px] border border-teal-800">
                          v_&#123;{cw}&#125;
                        </span>
                        Word: "{cw}" (ID: {cId})
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Row E[{cId}, :]
                      </span>
                    </div>

                    {/* Vector Display */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 font-mono text-[11px]">
                      <span className="text-slate-600">[</span>
                      {vec.map((val, dIdx) => (
                        <span
                          key={dIdx}
                          className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-teal-300 text-center font-semibold"
                        >
                          {val >= 0 ? `+${val.toFixed(3)}` : val.toFixed(3)}
                        </span>
                      ))}
                      <span className="text-slate-600">]</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Technical Equivalence Note */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Technical Equivalence in Implementation</span>
            </div>
            <p className="leading-relaxed text-slate-300 text-[11px]">
              In theory: <span className="font-mono text-cyan-300">v_c = E^T x_c</span> where <span className="font-mono text-teal-300">x_c</span> is a one-hot vector.
              <br />
              In practice: Multiplying a matrix by a one-hot vector wastes millions of floating point multiplications by 0! Therefore, high-performance implementations treat the input layer as an <strong>index lookup</strong> into row <span className="font-mono text-amber-300">c</span> of <span className="font-mono text-cyan-300">E</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
