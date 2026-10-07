'use client';

import React from 'react';
import { PIPELINE_STEPS } from './PipelineStepper';
import { TrainingPair } from '../lib/cbow/types';
import {
  SlidersHorizontal,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const PHASES = [
  { id: 1, name: 'Phase 1: Dataset', steps: [1, 2, 3, 4, 5], color: 'from-teal-500 to-cyan-500' },
  { id: 2, name: 'Phase 2: Forward Inference', steps: [6, 7, 8, 9, 10], color: 'from-cyan-500 to-indigo-500' },
  { id: 3, name: 'Phase 3: Backpropagation', steps: [11, 12, 13, 14, 15], color: 'from-rose-500 to-amber-500' },
];

interface StudioCommandBarProps {
  currentStep: number;
  onSelectStep: (stepId: number) => void;
  currentPairIndex: number;
  onSelectPairIndex: (index: number) => void;
  pairs: TrainingPair[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  corpusName: string;
  vocabSize: number;
  embeddingDim: number;
  windowSize: number;
  showTheoryGuide: boolean;
  onToggleTheoryGuide: () => void;
}

export const StudioCommandBar: React.FC<StudioCommandBarProps> = ({
  currentStep,
  onSelectStep,
  currentPairIndex,
  onSelectPairIndex,
  pairs,
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onReset,
  onOpenSettings,
  corpusName,
  vocabSize,
  embeddingDim,
  windowSize,
  showTheoryGuide,
  onToggleTheoryGuide,
}) => {
  const currentStepDef = PIPELINE_STEPS[currentStep - 1] || PIPELINE_STEPS[0];
  const activePair = pairs[currentPairIndex] || pairs[0];

  // Determine current active phase
  const currentPhase =
    PHASES.find((p) => p.steps.includes(currentStep)) || PHASES[0];

  return (
    <div className="w-full mb-6 space-y-3">
      {/* Primary Executive Studio Ribbon */}
      <div className="lab-card rounded-2xl p-3 px-4 border border-white/[0.08] shadow-xl bg-[#090d16]/90 backdrop-blur-xl">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-3">
          {/* Left: Active Corpus & Hyperparameter Capsule */}
          <div className="flex items-center gap-2 flex-wrap justify-between w-full xl:w-auto">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-white/[0.08] hover:border-cyan-500/40 transition text-xs group"
              title="Click to customize corpus, dimension, window, learning rate"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
              <span className="font-semibold text-slate-200">{corpusName}</span>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 pl-1 border-l border-white/[0.08]">
                <span>|V|:{vocabSize}</span>
                <span>D={embeddingDim}</span>
                <span>&plusmn;{windowSize}</span>
              </div>
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform ml-0.5" />
            </button>

            {/* Quick Primer Toggle */}
            <button
              onClick={onToggleTheoryGuide}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition border ${
                showTheoryGuide
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                  : 'bg-slate-900/70 text-slate-400 border-white/[0.06] hover:text-slate-200'
              }`}
              title="Toggle CBOW Architecture Primer"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showTheoryGuide ? 'Hide Primer' : 'Theory Primer'}</span>
            </button>
          </div>

          {/* Center: Phase Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-white/[0.06] text-xs font-medium">
            {PHASES.map((phase) => {
              const isPhaseActive = phase.id === currentPhase.id;
              return (
                <button
                  key={phase.id}
                  onClick={() => onSelectStep(phase.steps[0])}
                  className={`px-3 py-1 rounded-lg transition-all text-xs font-semibold ${
                    isPhaseActive
                      ? 'bg-slate-800 text-white shadow-sm border border-white/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {phase.name}
                </button>
              );
            })}
          </div>

          {/* Right: Active Training Pair Scrubber & Playback */}
          <div className="flex items-center gap-2 justify-between w-full xl:w-auto">
            {/* Pair Context -> Target Preview */}
            {activePair && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-white/[0.06] text-xs font-mono">
                <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Pair:</span>
                <span className="text-slate-300">
                  [{activePair.contextWords.map((w) => `"${w}"`).join(', ')}]
                </span>
                <span className="text-slate-500">&rarr;</span>
                <span className="text-amber-300 font-bold">"{activePair.targetWord}"</span>

                {/* Scrubber Buttons */}
                <div className="flex items-center gap-0.5 ml-1 pl-1.5 border-l border-white/[0.08]">
                  <button
                    onClick={() =>
                      onSelectPairIndex((currentPairIndex - 1 + pairs.length) % pairs.length)
                    }
                    className="p-1 hover:text-white text-slate-400 transition"
                    title="Previous Pair"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] text-slate-400 min-w-8 text-center">
                    {currentPairIndex + 1}/{pairs.length}
                  </span>
                  <button
                    onClick={() => onSelectPairIndex((currentPairIndex + 1) % pairs.length)}
                    className="p-1 hover:text-white text-slate-400 transition"
                    title="Next Pair"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Stepper Controls */}
            <div className="flex items-center bg-slate-900/90 border border-white/[0.08] rounded-xl p-0.5 gap-1">
              <button
                onClick={onStepBackward}
                disabled={currentStep <= 1}
                title="Previous Stage"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <SkipBack className="w-3 h-3" />
              </button>

              <button
                onClick={onTogglePlay}
                title={isPlaying ? 'Pause' : 'Run Step-by-Step'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
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
                disabled={currentStep >= PIPELINE_STEPS.length}
                title="Next Stage"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <SkipForward className="w-3 h-3" />
              </button>

              <button
                onClick={onReset}
                title="Reset Stage"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Phase Sub-Track: Steps in the Active Phase */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5">
            {currentPhase.steps.map((stepId) => {
              const step = PIPELINE_STEPS[stepId - 1];
              if (!step) return null;
              const isActive = currentStep === step.id;
              const isPassed = currentStep > step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => onSelectStep(step.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap border ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 font-bold shadow-md shadow-cyan-950/30'
                      : isPassed
                      ? 'bg-slate-900/60 text-slate-300 border-white/[0.06] hover:text-white hover:bg-slate-800/80'
                      : 'bg-slate-950/40 text-slate-500 border-transparent hover:text-slate-400'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold ${
                      isActive
                        ? 'bg-cyan-400 text-slate-950'
                        : isPassed
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {step.id}
                  </span>
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0 pl-3 border-l border-white/[0.06]">
            <span>
              Stage <strong className="text-cyan-300">{currentStep}</strong> / 15
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
