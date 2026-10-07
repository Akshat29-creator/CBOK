'use client';

import React from 'react';
import { X, BookOpen, Layers, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MathPanelProps {
  isOpen: boolean;
  onClose: () => void;
  vocabSize: number;
  embeddingDim: number;
  windowSize: number;
}

export const MathPanel: React.FC<MathPanelProps> = ({
  isOpen,
  onClose,
  vocabSize,
  embeddingDim,
  windowSize,
}) => {
  if (!isOpen) return null;

  const V = vocabSize;
  const D = embeddingDim;
  const C = windowSize * 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[85vh] bg-slate-950 border border-slate-800 rounded-3xl p-6 overflow-y-auto shadow-2xl relative"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                CBOW Formal Mathematical Reference Sheet
              </h3>
              <p className="text-xs text-slate-400">
                Rigorous tensor shapes, linear transformations, and analytical gradient derivations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Tensor Dimensions Grid */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Active Tensor Dimensionality (Current Corpus State)
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-sans">Vocab Cardinality |V|</span>
              <span className="text-base font-bold text-teal-400">{V}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-sans">Embedding Dim D</span>
              <span className="text-base font-bold text-indigo-400">{D}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-sans">Input Matrix E</span>
              <span className="text-base font-bold text-cyan-400">{V} &times; {D}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-sans">Output Matrix W</span>
              <span className="text-base font-bold text-amber-400">{D} &times; {V}</span>
            </div>
          </div>
        </div>

        {/* Mathematical Derivations Sections */}
        <div className="space-y-4 font-mono text-xs">
          {/* 1. Embedding Lookup */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="font-sans font-bold text-slate-200 text-sm block mb-1">
              1. Embedding Layer Lookup
            </span>
            <div className="p-3 rounded-lg bg-slate-950 text-cyan-300 border border-slate-800/80 mb-2">
              v_c = E^T x_c &emsp;&equiv;&emsp; E[c, :] &isin; ℝ<sup>{D}</sup>
            </div>
            <p className="text-slate-400 font-sans text-xs">
              Where <span className="font-mono text-slate-300">x_c &isin; &#123;0, 1&#125;^{V}</span> is the one-hot column vector for context word <span className="font-mono text-slate-300">c</span>, and <span className="font-mono text-slate-300">E &isin; ℝ<sup>{V}&times;{D}</sup></span> is the input embedding matrix.
            </p>
          </div>

          {/* 2. Context Aggregation */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="font-sans font-bold text-slate-200 text-sm block mb-1">
              2. Context Aggregation (Hidden Representation)
            </span>
            <div className="p-3 rounded-lg bg-slate-950 text-indigo-300 border border-slate-800/80 mb-2">
              h = (1 / C) &Sigma;_&#123;i=1&#125;^C v_i &isin; ℝ<sup>{D}</sup>
            </div>
            <p className="text-slate-400 font-sans text-xs">
              Unlike standard neural networks, CBOW uses <em>no non-linear activation</em> (e.g. ReLU or Tanh) at the hidden layer. The hidden representation <span className="font-mono text-slate-300">h</span> is simply the average of context word vectors.
            </p>
          </div>

          {/* 3. Output Projection & Logits */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="font-sans font-bold text-slate-200 text-sm block mb-1">
              3. Output Projection & Logits
            </span>
            <div className="p-3 rounded-lg bg-slate-950 text-purple-300 border border-slate-800/80 mb-2">
              u = W^T h + b &isin; ℝ<sup>{V}</sup> &emsp;where&emsp; u_j = w'_j^T h + b_j
            </div>
            <p className="text-slate-400 font-sans text-xs">
              <span className="font-mono text-slate-300">W &isin; ℝ<sup>{D}&times;{V}</sup></span> contains the output representation vectors for every vocabulary word in its columns.
            </p>
          </div>

          {/* 4. Softmax Probability */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="font-sans font-bold text-slate-200 text-sm block mb-1">
              4. Softmax Categorical Probability
            </span>
            <div className="p-3 rounded-lg bg-slate-950 text-amber-300 border border-slate-800/80 mb-2">
              P(w_i | Context) = &ycirc;_i = exp(u_i) / &Sigma;_&#123;j=1&#125;^{V} exp(u_j)
            </div>
          </div>

          {/* 5. Cross-Entropy Loss */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="font-sans font-bold text-slate-200 text-sm block mb-1">
              5. Cross-Entropy Loss
            </span>
            <div className="p-3 rounded-lg bg-slate-950 text-rose-300 border border-slate-800/80 mb-2">
              L = - &Sigma;_&#123;j=1&#125;^{V} y_j ln(&ycirc;_j) = -ln(&ycirc;_&#123;target&#125;)
            </div>
          </div>

          {/* 6. Analytical Gradients */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="font-sans font-bold text-slate-200 text-sm block mb-1">
              6. Analytical Backpropagation Gradients
            </span>
            <div className="p-3 rounded-lg bg-slate-950 text-rose-300 border border-slate-800/80 space-y-1 mb-2">
              <div>&part;L/&part;u = e = &ycirc; - y &isin; ℝ<sup>{V}</sup></div>
              <div>&part;L/&part;W = h e^T &isin; ℝ<sup>{D}&times;{V}</sup></div>
              <div>&part;L/&part;h = W e &isin; ℝ<sup>{D}</sup></div>
              <div>&part;L/&part;v_c = (1 / C) &part;L/&part;h &isin; ℝ<sup>{D}</sup></div>
            </div>
          </div>

          {/* 7. Stochastic Gradient Descent Updates */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="font-sans font-bold text-slate-200 text-sm block mb-1">
              7. SGD Parameter Updates
            </span>
            <div className="p-3 rounded-lg bg-slate-950 text-emerald-300 border border-slate-800/80 space-y-1">
              <div>W_&#123;new&#125; = W_&#123;old&#125; - &eta; (h e^T)</div>
              <div>E_&#123;new&#125;[c, :] = E_&#123;old&#125;[c, :] - &eta; (1 / C &part;L/&part;h)</div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-medium text-xs hover:bg-cyan-500 transition"
          >
            Close Reference Sheet
          </button>
        </div>
      </motion.div>
    </div>
  );
};
