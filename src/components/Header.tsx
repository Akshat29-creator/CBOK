'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Presentation,
  BookOpen,
  Cpu,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';

interface HeaderProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  isProfessorMode: boolean;
  onToggleProfessorMode: () => void;
  activeTab: 'pipeline' | 'training' | 'embeddings' | 'similarity';
  setActiveTab: (tab: 'pipeline' | 'training' | 'embeddings' | 'similarity') => void;
  onOpenMath: () => void;
  onOpenInspector: () => void;
  onOpenCorpusSettings?: () => void;
  stepNumber: number;
  totalSteps: number;
}

export const Header: React.FC<HeaderProps> = ({
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onReset,
  isProfessorMode,
  onToggleProfessorMode,
  activeTab,
  setActiveTab,
  onOpenMath,
  onOpenInspector,
  onOpenCorpusSettings,
  stepNumber,
  totalSteps,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#070b14]/90 backdrop-blur-xl px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-teal-400 p-[1px] shadow-lg shadow-indigo-950/40">
            <div className="w-full h-full bg-[#090d16] rounded-[11px] flex items-center justify-center">
              <Cpu className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                CBOW Word2Vec Studio
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                v2.0 &bull; Interactive Lab
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Continuous Bag of Words &bull; Step-by-Step Mathematical Simulator
            </p>
          </div>
        </div>

        {/* Studio Tabs (Segmented Control) */}
        {!isProfessorMode && (
          <nav className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/[0.08] text-xs font-medium shadow-inner">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pipeline Studio
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'training'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Trainer
            </button>
            <button
              onClick={() => setActiveTab('embeddings')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'embeddings'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D Vector Space
            </button>
            <button
              onClick={() => setActiveTab('similarity')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'similarity'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cosine Similarity
            </button>
          </nav>
        )}

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          {/* Quick Corpus Settings Trigger */}
          {onOpenCorpusSettings && (
            <button
              onClick={onOpenCorpusSettings}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Corpus & Model Parameters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Params</span>
            </button>
          )}

          {/* Stepper / Playback Controller */}
          <div className="flex items-center bg-slate-900/90 border border-white/[0.08] rounded-xl p-1 gap-1 shadow-sm">
            <button
              onClick={onStepBackward}
              disabled={stepNumber <= 1}
              title="Previous Stage (Left Arrow)"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onTogglePlay}
              title={isPlaying ? 'Pause Demo (Space)' : 'Run Step-by-Step (Space)'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" /> Run
                </>
              )}
            </button>

            <button
              onClick={onStepForward}
              disabled={stepNumber >= totalSteps}
              title="Next Stage (Right Arrow)"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

            <button
              onClick={onReset}
              title="Reset Parameters & Step (R)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Math Reference */}
          <button
            onClick={onOpenMath}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Formal Mathematics Sheet"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Math</span>
          </button>

          {/* Model Tensors */}
          <button
            onClick={onOpenInspector}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Inspect Tensors & Weights"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Tensors</span>
          </button>

          {/* Professor Mode Button */}
          <button
            onClick={onToggleProfessorMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              isProfessorMode
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-900/50'
                : 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 text-purple-200 border-purple-700/50 hover:border-purple-500 hover:text-white'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>{isProfessorMode ? 'Exit Keynote' : 'Professor Mode'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
