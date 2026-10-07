'use client';

import React from 'react';
import { StepCalculationState, TrainingPair } from '../lib/cbow/types';
import { Vocabulary } from '../lib/cbow/vocabulary';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowRight, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

interface WeightUpdateViewProps {
  stepState: StepCalculationState;
  currentPair: TrainingPair;
  vocab: Vocabulary;
  learningRate: number;
  embeddingDim: number;
}

export const WeightUpdateView: React.FC<WeightUpdateViewProps> = ({
  stepState,
  currentPair,
  vocab,
  learningRate,
  embeddingDim,
}) => {
  const { weightsBefore, weightsAfter, backward } = stepState;
  const { contextWords, contextIds, targetWord, targetId } = currentPair;
  const D = embeddingDim;

  return (
    <div className="lab-card rounded-2xl p-6 border border-slate-800/80">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800/60 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
              STAGE 14
            </span>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Stochastic Gradient Descent Parameter Update
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Parameters move in the opposite direction of the gradient: <span className="font-mono text-emerald-300">&theta;_&#123;new&#125; = &theta;_&#123;old&#125; - &eta; &nabla;_&theta; L</span> with learning rate <span className="font-mono text-amber-300 font-bold">&eta; = {learningRate}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
            Learning Rate &eta; = <strong className="text-amber-400">{learningRate}</strong>
          </span>
        </div>
      </div>

      {/* Equations Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-teal-900/50">
          <span className="text-teal-400 font-bold block mb-1">Context Word Embeddings (E):</span>
          <div className="text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800">
            E_&#123;new&#125;[c, :] = E_&#123;old&#125;[c, :] - &eta; &nabla;_&#123;v_c&#125; L
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-900/50">
          <span className="text-indigo-400 font-bold block mb-1">Output Projection Matrix (W):</span>
          <div className="text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800">
            W_&#123;new&#125; = W_&#123;old&#125; - &eta; &nabla;_W L
          </div>
        </div>
      </div>

      {/* Before vs After Comparison for Context Embeddings */}
      <div className="my-6 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          Context Word Embedding Updates (Row Transitions)
        </h4>

        {contextWords.map((cw, idx) => {
          const cId = contextIds[idx];
          const beforeVec = weightsBefore.E[cId] || new Array(D).fill(0);
          const afterVec = weightsAfter.E[cId] || new Array(D).fill(0);
          const gradVec = backward.gradContextEmbeddings[idx] || new Array(D).fill(0);

          return (
            <div
              key={`${cw}-${idx}`}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-300 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  Embedding: "{cw}" (Row E[{cId}, :])
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Update step: &Delta; = -{learningRate} &times; &nabla;
                </span>
              </div>

              {/* Numerical Before -> Gradient -> After Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                {/* Before */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold block mb-1">
                    Before Step
                  </span>
                  <div className="flex items-center gap-1 overflow-x-auto text-slate-300">
                    [{beforeVec.map((v, d) => (
                      <span key={d} className="px-1 text-[11px]">
                        {v >= 0 ? `+${v.toFixed(3)}` : v.toFixed(3)}
                      </span>
                    ))}]
                  </div>
                </div>

                {/* Gradient x eta */}
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40">
                  <span className="text-[10px] text-rose-400 uppercase font-sans font-semibold block mb-1">
                    Gradient Update (&minus;&eta; &nabla;)
                  </span>
                  <div className="flex items-center gap-1 overflow-x-auto text-rose-300">
                    [{gradVec.map((g, d) => {
                      const delta = -learningRate * g;
                      return (
                        <span key={d} className="px-1 text-[11px] font-bold">
                          {delta >= 0 ? `+${delta.toFixed(3)}` : delta.toFixed(3)}
                        </span>
                      );
                    })}]
                  </div>
                </div>

                {/* After */}
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/50">
                  <span className="text-[10px] text-emerald-400 uppercase font-sans font-semibold block mb-1">
                    After Step (Updated Vector)
                  </span>
                  <div className="flex items-center gap-1 overflow-x-auto text-emerald-300 font-bold">
                    [{afterVec.map((v, d) => (
                      <span key={d} className="px-1 text-[11px]">
                        {v >= 0 ? `+${v.toFixed(3)}` : v.toFixed(3)}
                      </span>
                    ))}]
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Target Word Column in Output Matrix W */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-900/40">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-amber-300 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Output Projection Weights for Target: "{targetWord}" (Column W[:, {targetId}])
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Pulling weights closer to context hidden vector h
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Because the target error is negative (<span className="font-mono text-rose-300">&ycirc;_t - 1 &lt; 0</span>), the update moves column <span className="font-mono text-amber-300">W[:, {targetId}]</span> in the <strong>positive direction of h</strong>, increasing its dot product for future occurrences of this context!
        </p>
      </div>
    </div>
  );
};
