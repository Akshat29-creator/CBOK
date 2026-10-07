'use client';

import React from 'react';
import { CBOWConfig } from '../lib/cbow/types';
import { CORPUS_PRESETS } from '../lib/cbow/demo-corpora';
import {
  X,
  Settings2,
  RefreshCw,
  BookOpen,
  SlidersHorizontal,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CorpusModalProps {
  isOpen: boolean;
  onClose: () => void;
  corpusText: string;
  onCorpusChange: (text: string) => void;
  config: CBOWConfig;
  onConfigChange: (config: CBOWConfig) => void;
  tokenCount: number;
  vocabSize: number;
  pairCount: number;
  onResetSeed: () => void;
  speed: 'slow' | 'normal' | 'fast';
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
}

export const CorpusModal: React.FC<CorpusModalProps> = ({
  isOpen,
  onClose,
  corpusText,
  onCorpusChange,
  config,
  onConfigChange,
  tokenCount,
  vocabSize,
  pairCount,
  onResetSeed,
  speed,
  onSpeedChange,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-3xl max-h-[90vh] bg-[#070b14] border border-white/[0.1] rounded-3xl p-6 overflow-y-auto shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  Corpus & Model Configuration
                </h3>
                <p className="text-xs text-slate-400">
                  Customize the training sentences, context radius, embedding dimension, and learning rate.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-white/[0.08] text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.06]">
              <span className="text-[10px] text-slate-500 uppercase font-sans block">Total Tokens</span>
              <span className="text-sm font-bold text-slate-200">{tokenCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.06]">
              <span className="text-[10px] text-slate-500 uppercase font-sans block">Vocab Cardinality |V|</span>
              <span className="text-sm font-bold text-teal-300">{vocabSize}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.06]">
              <span className="text-[10px] text-slate-500 uppercase font-sans block">Training Pairs</span>
              <span className="text-sm font-bold text-amber-300">{pairCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.06]">
              <span className="text-[10px] text-slate-500 uppercase font-sans block">Context Window</span>
              <span className="text-sm font-bold text-indigo-300">&plusmn;{config.windowSize}</span>
            </div>
          </div>

          <div className="space-y-5">
            {/* Corpus Text & Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  Corpus Sentences
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Load Preset:</span>
                  <select
                    onChange={(e) => {
                      const preset = CORPUS_PRESETS.find((p) => p.id === e.target.value);
                      if (preset) onCorpusChange(preset.text);
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    {CORPUS_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                value={corpusText}
                onChange={(e) => onCorpusChange(e.target.value)}
                rows={5}
                placeholder="Enter or paste sentences here..."
                className="w-full bg-[#050811] border border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/70 transition resize-y shadow-inner leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Each line or punctuation-separated clause is treated as an independent sentence context.
              </p>
            </div>

            {/* Hyperparameters Grid */}
            <div className="p-4 rounded-2xl bg-[#050811] border border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
                  Hyperparameters & Architecture
                </span>
                <button
                  onClick={onResetSeed}
                  className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  Re-seed Weights
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {/* Window Size */}
                <div>
                  <label className="text-slate-400 block mb-1.5">
                    Context Radius (<strong className="text-cyan-300">&plusmn;{config.windowSize}</strong>)
                  </label>
                  <div className="flex rounded-xl bg-slate-950 p-1 border border-white/[0.06]">
                    {[1, 2, 3].map((w) => (
                      <button
                        key={w}
                        onClick={() => onConfigChange({ ...config, windowSize: w })}
                        className={`flex-1 py-1 rounded-lg text-center font-mono font-medium transition ${
                          config.windowSize === w
                            ? 'bg-cyan-600 text-white font-bold shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        &plusmn;{w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Embedding Dimension */}
                <div>
                  <label className="text-slate-400 block mb-1.5">
                    Embedding Dim (<strong className="text-indigo-300">D={config.embeddingDim}</strong>)
                  </label>
                  <div className="flex rounded-xl bg-slate-950 p-1 border border-white/[0.06]">
                    {[2, 3, 5, 8].map((d) => (
                      <button
                        key={d}
                        onClick={() => onConfigChange({ ...config, embeddingDim: d })}
                        className={`flex-1 py-1 rounded-lg text-center font-mono font-medium transition ${
                          config.embeddingDim === d
                            ? 'bg-indigo-600 text-white font-bold shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning Rate */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-1.5">
                    <span>Learning Rate (&eta;)</span>
                    <strong className="text-amber-300 font-mono">{config.learningRate}</strong>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={config.learningRate}
                    onChange={(e) =>
                      onConfigChange({ ...config, learningRate: parseFloat(e.target.value) })
                    }
                    className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer mt-1"
                  />
                </div>

                {/* Aggregation Mode */}
                <div>
                  <label className="text-slate-400 block mb-1.5">Aggregation</label>
                  <div className="flex rounded-xl bg-slate-950 p-1 border border-white/[0.06]">
                    {(['average', 'sum'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => onConfigChange({ ...config, aggregation: mode })}
                        className={`flex-1 py-1 rounded-lg text-center uppercase font-mono text-[10px] font-bold transition ${
                          config.aggregation === mode
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Playback Speed */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.06]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Playback Animation Speed:
              </span>
              <div className="flex items-center gap-1.5">
                {(['slow', 'normal', 'fast'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => onSpeedChange(s)}
                    className={`px-3 py-1 rounded-lg font-medium capitalize text-xs transition ${
                      speed === s
                        ? 'bg-slate-800 text-white border border-white/20 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-950/50"
            >
              Done & Apply Parameters
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
