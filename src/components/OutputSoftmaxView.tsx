'use client';

import React, { useState } from 'react';
import { ForwardPassResult, TrainingPair } from '../lib/cbow/types';
import { Vocabulary } from '../lib/cbow/vocabulary';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface OutputSoftmaxViewProps {
  forward: ForwardPassResult;
  currentPair: TrainingPair;
  vocab: Vocabulary;
}

export const OutputSoftmaxView: React.FC<OutputSoftmaxViewProps> = ({
  forward,
  currentPair,
  vocab,
}) => {
  const [showSoftmaxTheory, setShowSoftmaxTheory] = useState(false);
  const [sortBy, setSortBy] = useState<'prob' | 'vocab'>('prob');

  const { logits, probabilities, predictedId, predictedWord } = forward;
  const { targetId, targetWord } = currentPair;

  const maxLogit = Math.max(...logits);

  // Build sorted item list
  const rawItems = vocab.wordList.map((item) => {
    const logit = logits[item.id] ?? 0;
    const expVal = Math.exp(logit - maxLogit);
    const prob = probabilities[item.id] ?? 0;
    return {
      id: item.id,
      word: item.word,
      logit,
      expVal,
      prob,
      isTarget: item.id === targetId,
      isPredicted: item.id === predictedId,
    };
  });

  const items = [...rawItems].sort((a, b) => {
    if (sortBy === 'prob') return b.prob - a.prob;
    return a.id - b.id;
  });

  const targetProb = probabilities[targetId] ?? 0;
  const isMatch = predictedId === targetId;

  return (
    <div className="lab-card rounded-2xl p-5 border border-white/[0.08] shadow-2xl bg-[#090d16]/95">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.06] gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest font-bold text-amber-400 uppercase">
              OUTPUT INFERENCE &bull; STAGES 9 & 10
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400">Softmax Normalization</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Projection Logits & Softmax Probability Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Linear projection produces unconstrained real scores <span className="font-mono text-cyan-300 font-semibold">u = Wᵀ h + b</span>. Softmax normalizes them into categorical probabilities across the vocabulary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Selector */}
          <div className="flex items-center rounded-xl bg-slate-900/90 border border-white/[0.08] p-0.5 text-xs font-mono">
            <button
              onClick={() => setSortBy('prob')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                sortBy === 'prob'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Highest Prob
            </button>
            <button
              onClick={() => setSortBy('vocab')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                sortBy === 'vocab'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vocab ID
            </button>
          </div>

          <button
            onClick={() => setShowSoftmaxTheory(!showSoftmaxTheory)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Formulas</span>
            {showSoftmaxTheory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expandable Mathematical Softmax Theory */}
      <AnimatePresence>
        {showSoftmaxTheory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4 p-4 rounded-xl bg-[#050811] border border-amber-500/20 text-xs text-slate-300 space-y-2"
          >
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              The Softmax Operator: Turning Arbitrary Real Logits into Probabilities
            </div>
            <div className="font-mono text-xs bg-slate-950 p-2.5 rounded-lg border border-white/[0.08] text-amber-200">
              P(w_i | Context) = ŷ_i = exp(u_i) / &Sigma;_&#123;j=1&#125;^{vocab.size} exp(u_j)
            </div>
            <p className="leading-relaxed text-slate-300 text-xs">
              <strong className="text-amber-200">1. Numerator Exponentiation (exp(u_i)):</strong> Ensures strictly positive outputs (&gt; 0), projecting arbitrary real values to (0, &infin;).
              <br />
              <strong className="text-amber-200">2. Normalization (1 / &Sigma; exp):</strong> Forces &Sigma; ŷ_i = 1.0, satisfying probability axioms required for cross-entropy loss computation.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Probability Bars + Inference Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-2">
        {/* Probability Bars (Left Column) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Vocabulary Probability Distribution P(w | Context)</span>
            <span className="font-mono text-[11px] text-teal-400">Total Sum = 100.0%</span>
          </div>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const probPercent = item.prob * 100;
              const isMatchPrediction = item.isTarget && item.isPredicted;

              return (
                <motion.div
                  layout
                  key={item.id}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isMatchPrediction
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                      : item.isPredicted
                      ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-950/20'
                      : item.isTarget
                      ? 'bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-950/20'
                      : 'bg-slate-950/60 border-white/[0.04] hover:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 w-4">
                        #{idx + 1}
                      </span>
                      <span
                        className={`font-bold font-mono text-sm ${
                          isMatchPrediction
                            ? 'text-emerald-300'
                            : item.isPredicted
                            ? 'text-cyan-300'
                            : item.isTarget
                            ? 'text-amber-300'
                            : 'text-slate-200'
                        }`}
                      >
                        {item.word}
                      </span>

                      {item.isTarget && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          GROUND TRUTH
                        </span>
                      )}

                      {item.isPredicted && !item.isTarget && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          TOP PREDICTION
                        </span>
                      )}

                      {isMatchPrediction && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          CORRECT MATCH
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-slate-500 text-[11px]">
                        logit: {item.logit >= 0 ? `+${item.logit.toFixed(2)}` : item.logit.toFixed(2)}
                      </span>
                      <strong
                        className={`text-xs ${
                          isMatchPrediction
                            ? 'text-emerald-300'
                            : item.isPredicted
                            ? 'text-cyan-300'
                            : item.isTarget
                            ? 'text-amber-300'
                            : 'text-slate-300'
                        }`}
                      >
                        {probPercent.toFixed(1)}%
                      </strong>
                    </div>
                  </div>

                  {/* Fluid Spring Probability Fill Bar */}
                  <div className="w-full bg-slate-900/90 h-2 rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                    <motion.div
                      className={`h-full rounded-full transition-all ${
                        isMatchPrediction
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : item.isPredicted
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                          : item.isTarget
                          ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                          : 'bg-slate-700/60'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(2, probPercent)}%` }}
                      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Inference Summary Card (Right Column) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="p-4 rounded-2xl bg-[#050811] border border-white/[0.06] shadow-inner space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Model Inference Summary
            </span>

            {/* Ground Truth Card */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                  Ground-Truth Target (y)
                </span>
                <span className="text-base font-bold font-mono text-amber-200">
                  "{targetWord}"
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-bold text-amber-300">
                  {(targetProb * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 block">assigned prob</span>
              </div>
            </div>

            {/* Model Prediction Card */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between ${
                isMatch
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-cyan-950/20 border-cyan-500/30'
              }`}
            >
              <div>
                <span
                  className={`text-[10px] font-mono uppercase font-bold block ${
                    isMatch ? 'text-emerald-400' : 'text-cyan-400'
                  }`}
                >
                  Model Top Prediction (argmax ŷ)
                </span>
                <span
                  className={`text-base font-bold font-mono ${
                    isMatch ? 'text-emerald-200' : 'text-cyan-200'
                  }`}
                >
                  "{predictedWord}"
                </span>
              </div>
              <div className="text-right font-mono">
                <span
                  className={`text-sm font-bold ${
                    isMatch ? 'text-emerald-300' : 'text-cyan-300'
                  }`}
                >
                  {((probabilities[predictedId] || 0) * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 block">confidence</span>
              </div>
            </div>

            {/* Verdict Status */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                isMatch
                  ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-600/40 text-rose-300'
              }`}
            >
              {isMatch ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Accurate Prediction: Model successfully assigned highest probability to ground-truth "{targetWord}".
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    Prediction Error: Model favored "{predictedWord}" over "{targetWord}". Cross-entropy loss will penalize this during backpropagation.
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Linear Projection Breakdown Card */}
          <div className="p-4 rounded-2xl bg-[#050811] border border-white/[0.06] text-xs font-mono text-slate-300 space-y-1.5">
            <span className="text-slate-400 text-[10px] uppercase font-sans font-bold block">
              Linear Projection Formulation
            </span>
            <div className="text-[11px] text-slate-400">
              Hidden Vector h: <span className="text-indigo-300">ℝ<sup>{forward.hiddenVector.length}</sup></span>
            </div>
            <div className="text-[11px] text-slate-400">
              Weight Matrix W: <span className="text-amber-300">ℝ<sup>{forward.hiddenVector.length} &times; {vocab.size}</sup></span>
            </div>
            <div className="text-[11px] text-slate-400">
              Logit Vector u: <span className="text-cyan-300">u_i = &Sigma;_d W[d, i] &times; h[d] + b[i]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
