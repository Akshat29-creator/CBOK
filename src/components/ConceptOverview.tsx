'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, HelpCircle, ChevronDown, ChevronUp, Layers, Target, Compass, Sparkles, X, Info } from 'lucide-react';

export const ConceptOverview: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return (
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsDismissed(false)}
          className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/[0.06]"
        >
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Show Architecture Primer</span>
        </button>
      </div>
    );
  }

  return (
    <div className="lab-card rounded-2xl p-4 sm:p-5 mb-6 border border-white/[0.08] shadow-lg transition-all">
      {/* High-Level Visual Flow Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-mono">
              Continuous Bag of Words (CBOW) Objective
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            In Word2Vec CBOW, the neural network learns to <span className="text-amber-300 font-semibold">predict a central target word</span> conditioned on an aggregated bag of its <span className="text-emerald-300 font-semibold">surrounding context words</span>.
          </p>
        </div>

        {/* Visual Animated Example: The cat ___ on the mat */}
        <div className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-[#050811] border border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <span className="text-[10px] text-emerald-400 font-sans uppercase font-bold">Context:</span>
            <span>["The", "cat", "on", "the"]</span>
          </div>

          <motion.div
            animate={{ x: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </motion.div>

          <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            <span>CBOW Net</span>
          </div>

          <motion.div
            animate={{ x: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.3 }}
          >
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </motion.div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
            <Target className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] text-amber-400 font-sans uppercase font-bold">Target:</span>
            <span>"sits"</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isExpanded ? 'Hide Details' : 'Deep Dive'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition"
            title="Dismiss Primer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Explanation with WHAT, WHY, HOW Cards */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden pt-4 mt-3 border-t border-white/[0.06]"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              {/* WHAT */}
              <div className="p-3.5 rounded-xl bg-[#050811] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 mb-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  1. Mathematical Objective
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Maximizes log likelihood of center target word conditioned on context window:
                  <span className="block my-1.5 font-mono text-[11px] text-emerald-300 bg-slate-950 p-2 rounded-lg border border-white/[0.06]">
                    max &Sigma; log P(w_t | w_&#123;t-c&#125;, ..., w_&#123;t+c&#125;)
                  </span>
                  "Bag of Words" indicates context token order is discarded during embedding aggregation.
                </p>
              </div>

              {/* WHY */}
              <div className="p-3.5 rounded-xl bg-[#050811] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 mb-1.5 text-indigo-400 font-bold text-xs uppercase tracking-wider font-mono">
                  <Compass className="w-3.5 h-3.5" />
                  2. Distributional Hypothesis
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Words that appear in similar linguistic contexts share semantic proximity (Harris, 1954).
                  <span className="block mt-1 text-slate-400 text-[11px]">
                    Because "cat" and "dog" frequently share contexts ("___ sits on the floor"), backpropagation coordinates their vector trajectories toward topological clusters.
                  </span>
                </p>
              </div>

              {/* HOW */}
              <div className="p-3.5 rounded-xl bg-[#050811] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 mb-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                  <Layers className="w-3.5 h-3.5" />
                  3. Forward & Backward Flow
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  1. One-hot contexts look up rows in embedding matrix <span className="font-mono text-amber-300">E</span>.
                  <br />
                  2. Vectors average into hidden representation <span className="font-mono text-indigo-300">h</span>.
                  <br />
                  3. Weight matrix <span className="font-mono text-cyan-300">W</span> projects <span className="font-mono">h</span> into logits.
                  <br />
                  4. Softmax produces probabilities for gradient updates.
                </p>
              </div>
            </div>

            {/* CBOW vs Skip-Gram Comparison Callout */}
            <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.06] text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-300">
              <div>
                <strong className="text-cyan-400">CBOW vs Skip-Gram: </strong>
                CBOW predicts <em>Target given Context</em> (faster training, optimal for dense frequent words). Skip-Gram predicts <em>Context given Target</em> (effective for rare words and larger corpora).
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/[0.06] whitespace-nowrap">
                Linear Projection &bull; No Non-Linearity
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
