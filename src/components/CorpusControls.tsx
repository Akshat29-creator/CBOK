'use client';

import React, { useState } from 'react';
import { CBOWConfig } from '../lib/cbow/types';
import { CORPUS_PRESETS } from '../lib/cbow/demo-corpora';
import {
  Settings2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Zap,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CorpusControlsProps {
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

export const CorpusControls: React.FC<CorpusControlsProps> = ({
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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('default');

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = CORPUS_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onCorpusChange(preset.text);
    }
  };

  const currentPresetName =
    CORPUS_PRESETS.find((p) => p.id === selectedPresetId)?.name || 'Custom Corpus';

  return (
    <div className="lab-card rounded-2xl mb-6 border border-white/[0.08] shadow-lg transition-all overflow-hidden">
      {/* Slim Executive Control Bar (Always Visible) */}
      <div className="p-3.5 px-5 flex flex-col md:flex-row items-center justify-between gap-3 bg-[#0a0f1d]/80">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-bold text-slate-200">Active Corpus:</span>
            <span className="text-xs font-mono text-cyan-300 font-semibold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
              {currentPresetName}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>&bull;</span>
            <span>Tokens: <strong className="text-slate-200">{tokenCount}</strong></span>
            <span>&bull;</span>
            <span>Vocab |V|: <strong className="text-teal-300">{vocabSize}</strong></span>
            <span>&bull;</span>
            <span>Window: <strong className="text-indigo-300">&plusmn;{config.windowSize}</strong></span>
            <span>&bull;</span>
            <span>Dim: <strong className="text-purple-300">D={config.embeddingDim}</strong></span>
            <span>&bull;</span>
            <span>Pairs: <strong className="text-amber-300">{pairCount}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {vocabSize < 3 ? (
            <span className="text-rose-400 text-xs flex items-center gap-1 font-medium mr-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Need &ge; 3 words
            </span>
          ) : (
            <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium mr-2 hidden lg:flex">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              isExpanded
                ? 'bg-slate-800 text-white border-white/20'
                : 'bg-slate-900/80 text-slate-300 border-white/[0.08] hover:bg-slate-800 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isExpanded ? 'Collapse Settings' : 'Configure Corpus & Parameters'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Studio Configuration Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-t border-white/[0.08] p-5 bg-[#070b14]/90"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column: Editable Corpus Area & Presets */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    Training Corpus Sentences
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Preset:</span>
                    <select
                      value={selectedPresetId}
                      onChange={(e) => handlePresetSelect(e.target.value)}
                      className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
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
                  onChange={(e) => {
                    onCorpusChange(e.target.value);
                    setSelectedPresetId('custom');
                  }}
                  rows={5}
                  placeholder="Type or paste sentences here..."
                  className="w-full bg-[#050811] border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/70 transition-all resize-y shadow-inner leading-relaxed"
                />

                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                  <span>Each line or punctuation-separated clause is treated as an independent sentence context.</span>
                  <span className="font-mono text-cyan-400">{allTokensTokenCount(corpusText)} tokens</span>
                </div>
              </div>

              {/* Right Column: Hyperparameters & Dimensions */}
              <div className="w-full lg:w-96 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800/80 lg:pl-6 pt-4 lg:pt-0">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
                      Hyperparameters
                    </span>
                    <button
                      onClick={onResetSeed}
                      title="Re-seed deterministic weights"
                      className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset Seed
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Window Size c */}
                    <div>
                      <label className="text-slate-400 block mb-1">
                        Context Radius (<span className="font-mono text-cyan-300 font-bold">&plusmn;{config.windowSize}</span>)
                      </label>
                      <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                        {[1, 2, 3].map((w) => (
                          <button
                            key={w}
                            onClick={() => onConfigChange({ ...config, windowSize: w })}
                            className={`flex-1 py-1 rounded-md text-center font-mono font-medium transition ${
                              config.windowSize === w
                                ? 'bg-cyan-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            &plusmn;{w}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Embedding Dimension D */}
                    <div>
                      <label className="text-slate-400 block mb-1">
                        Dimension (<span className="font-mono text-indigo-300 font-bold">D = {config.embeddingDim}</span>)
                      </label>
                      <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                        {[2, 3, 5, 8].map((d) => (
                          <button
                            key={d}
                            onClick={() => onConfigChange({ ...config, embeddingDim: d })}
                            className={`flex-1 py-1 rounded-md text-center font-mono font-medium transition ${
                              config.embeddingDim === d
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Learning Rate eta */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Learning Rate (&eta;)</span>
                        <span className="font-mono text-amber-300 font-semibold">{config.learningRate}</span>
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
                        className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Aggregation Mode */}
                    <div>
                      <label className="text-slate-400 block mb-1">Context Aggregation</label>
                      <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                        {(['average', 'sum'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => onConfigChange({ ...config, aggregation: mode })}
                            className={`flex-1 py-1 rounded-md text-center uppercase font-mono text-[10px] font-bold transition ${
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

                {/* Speed Controls */}
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Playback Speed:
                  </span>
                  <div className="flex items-center gap-1">
                    {(['slow', 'normal', 'fast'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => onSpeedChange(s)}
                        className={`px-2.5 py-0.5 rounded-md font-medium capitalize text-[11px] transition ${
                          speed === s
                            ? 'bg-slate-800 text-white border border-slate-700 font-bold'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function allTokensTokenCount(text: string): number {
  return text.toLowerCase().replace(/[^\w\s]/g, '').trim().split(/\s+/).filter(Boolean).length;
}
