'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface StepDefinition {
  id: number;
  title: string;
  shortTitle: string;
  category: 'prep' | 'forward' | 'loss' | 'backward' | 'update';
  phase: string;
}

export const PIPELINE_STEPS: StepDefinition[] = [
  { id: 1, title: 'Corpus Tokenization', shortTitle: 'Tokens', category: 'prep', phase: 'Data Pipeline' },
  { id: 2, title: 'Vocabulary Construction', shortTitle: 'Vocab', category: 'prep', phase: 'Data Pipeline' },
  { id: 3, title: 'Sliding Context Window', shortTitle: 'Window', category: 'prep', phase: 'Data Pipeline' },
  { id: 4, title: 'Supervised Training Pairs', shortTitle: 'Pairs', category: 'prep', phase: 'Data Pipeline' },
  { id: 5, title: 'One-Hot Sparse Encoding', shortTitle: 'One-Hot', category: 'prep', phase: 'Data Pipeline' },
  { id: 6, title: 'Embedding Matrix Lookup', shortTitle: 'Lookup', category: 'forward', phase: 'Forward Pass' },
  { id: 7, title: 'Context Vector Aggregation', shortTitle: 'Aggregate', category: 'forward', phase: 'Forward Pass' },
  { id: 8, title: 'Neural Signal Architecture', shortTitle: 'Network', category: 'forward', phase: 'Forward Pass' },
  { id: 9, title: 'Output Projection Logits', shortTitle: 'Logits', category: 'forward', phase: 'Forward Pass' },
  { id: 10, title: 'Softmax Normalization', shortTitle: 'Softmax', category: 'forward', phase: 'Forward Pass' },
  { id: 11, title: 'Categorical Cross-Entropy Loss', shortTitle: 'Loss', category: 'loss', phase: 'Objective' },
  { id: 12, title: 'Output Error Flow e = ŷ - y', shortTitle: 'Error Flow', category: 'backward', phase: 'Backpropagation' },
  { id: 13, title: 'Parameter Gradients ∇W & ∇E', shortTitle: 'Gradients', category: 'backward', phase: 'Backpropagation' },
  { id: 14, title: 'SGD Parameter Update', shortTitle: 'Update', category: 'update', phase: 'Optimization' },
  { id: 15, title: 'Iterative Epoch Trainer', shortTitle: 'Trainer', category: 'update', phase: 'Optimization' },
];

const PHASES = [
  { name: 'Data Pipeline', steps: [1, 2, 3, 4, 5], color: 'teal' },
  { name: 'Forward Pass', steps: [6, 7, 8, 9, 10], color: 'cyan' },
  { name: 'Objective', steps: [11], color: 'rose' },
  { name: 'Backprop', steps: [12, 13], color: 'purple' },
  { name: 'Optimization', steps: [14, 15], color: 'amber' },
];

interface PipelineStepperProps {
  currentStep: number;
  onSelectStep: (stepId: number) => void;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  currentStep,
  onSelectStep,
}) => {
  const currentStepDef = PIPELINE_STEPS[currentStep - 1] || PIPELINE_STEPS[0];

  return (
    <div className="w-full mb-6 lab-card rounded-2xl p-4 border border-white/[0.08] shadow-md transition-all">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-white/[0.06] gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-slate-400">
            {currentStepDef.phase}
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="font-semibold text-slate-100">
            Stage {currentStep}: {currentStepDef.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            Step <strong className="text-cyan-300">{currentStep}</strong> / {PIPELINE_STEPS.length}
          </span>
        </div>
      </div>

      {/* Structured Stepper Track */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {PIPELINE_STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isPassed = currentStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white border-cyan-400/80 shadow-md shadow-cyan-950/40 font-bold'
                  : isPassed
                  ? 'bg-slate-900/90 text-slate-300 border-white/[0.06] hover:border-slate-600'
                  : 'bg-slate-950/60 text-slate-500 border-transparent hover:border-slate-800 hover:text-slate-400'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold font-mono transition-colors ${
                  isActive
                    ? 'bg-cyan-400 text-slate-950'
                    : isPassed
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step.id}
              </span>
              <span className="text-[11px]">{step.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-3">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / PIPELINE_STEPS.length) * 100}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>
    </div>
  );
};
