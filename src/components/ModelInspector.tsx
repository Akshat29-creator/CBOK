'use client';

import React, { useState } from 'react';
import { CBOWModel } from '../lib/cbow/model';
import { StepCalculationState, TrainingPair } from '../lib/cbow/types';
import { X, Zap, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModelInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  model: CBOWModel;
  stepState?: StepCalculationState;
  currentPair: TrainingPair;
}

export const ModelInspector: React.FC<ModelInspectorProps> = ({
  isOpen,
  onClose,
  model,
  stepState,
  currentPair,
}) => {
  const [precision, setPrecision] = useState<2 | 4>(4);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (key: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const V = model.V;
  const D = model.D;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl max-h-[85vh] bg-slate-950 border border-slate-800 rounded-3xl p-6 overflow-y-auto shadow-2xl relative"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Model Internals & Tensor Diagnostic Inspector
              </h3>
              <p className="text-xs text-slate-400">
                Live inspection of real floating-point weights, gradients, biases, and intermediate activations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Precision Toggle */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
              <span className="text-[10px] text-slate-400 px-2">Decimals:</span>
              <button
                onClick={() => setPrecision(2)}
                className={`px-2 py-0.5 rounded font-mono ${
                  precision === 2 ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                .00
              </button>
              <button
                onClick={() => setPrecision(4)}
                className={`px-2 py-0.5 rounded font-mono ${
                  precision === 4 ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                .0000
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current State Diagnostic Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 font-sans block text-[10px]">Context</span>
            <span className="text-teal-300 font-bold">[{currentPair.contextWords.join(', ')}]</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 font-sans block text-[10px]">Target</span>
            <span className="text-amber-300 font-bold">"{currentPair.targetWord}"</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 font-sans block text-[10px]">Prediction</span>
            <span className="text-cyan-300 font-bold">
              "{stepState?.forward.predictedWord ?? 'N/A'}"
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 font-sans block text-[10px]">Loss</span>
            <span className="text-rose-400 font-bold">
              {stepState?.forward.loss.toFixed(precision) ?? 'N/A'}
            </span>
          </div>
        </div>

        {/* Accordions for Matrices & Vectors */}
        <div className="space-y-4">
          {/* 1. Embedding Matrix E */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Input Embedding Matrix E &isin; ℝ<sup>{V}&times;{D}</sup>
              </span>
              <button
                onClick={() => copyToClipboard('E', model.E)}
                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-sans"
              >
                {copiedKey === 'E' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'E' ? 'Copied' : 'Copy JSON'}
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-2 max-h-56 font-mono text-[11px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="p-1">Word</th>
                    <th className="p-1">ID</th>
                    {Array.from({ length: D }).map((_, d) => (
                      <th key={d} className="p-1 text-right">D{d + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {model.vocab.words.map((w, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 border-b border-slate-900/40">
                      <td className="p-1 text-slate-300 font-sans">{w}</td>
                      <td className="p-1 text-slate-500">{idx}</td>
                      {model.E[idx]?.map((val, d) => (
                        <td key={d} className="p-1 text-right text-cyan-300">
                          {val >= 0 ? `+${val.toFixed(precision)}` : val.toFixed(precision)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Output Projection Matrix W */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Output Weight Matrix W &isin; ℝ<sup>{D}&times;{V}</sup>
              </span>
              <button
                onClick={() => copyToClipboard('W', model.W)}
                className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 font-sans"
              >
                {copiedKey === 'W' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'W' ? 'Copied' : 'Copy JSON'}
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-2 max-h-56 font-mono text-[11px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="p-1">Dim</th>
                    {model.vocab.words.slice(0, 10).map((w, idx) => (
                      <th key={idx} className="p-1 text-right font-sans">{w}</th>
                    ))}
                    {model.vocab.words.length > 10 && <th className="p-1 text-right text-slate-600">...</th>}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: D }).map((_, d) => (
                    <tr key={d} className="hover:bg-slate-900/40 border-b border-slate-900/40">
                      <td className="p-1 text-slate-400">Dim {d + 1}</td>
                      {model.vocab.words.slice(0, 10).map((_, idx) => {
                        const val = model.W[d]?.[idx] ?? 0;
                        return (
                          <td key={idx} className="p-1 text-right text-amber-300">
                            {val >= 0 ? `+${val.toFixed(precision)}` : val.toFixed(precision)}
                          </td>
                        );
                      })}
                      {model.vocab.words.length > 10 && <td className="p-1 text-right text-slate-600">...</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Activations: Hidden Vector, Logits, Softmax */}
          {stepState && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                <span className="font-bold text-slate-200 text-xs uppercase tracking-wider block mb-2">
                  Hidden Activation Vector h &isin; ℝ<sup>{D}</sup>
                </span>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-xs overflow-x-auto">
                  [{stepState.forward.hiddenVector.map((v) => v.toFixed(precision)).join(', ')}]
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                <span className="font-bold text-slate-200 text-xs uppercase tracking-wider block mb-2">
                  Output Error Vector e &isin; ℝ<sup>{V}</sup>
                </span>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-rose-300 font-mono text-xs overflow-x-auto">
                  [{stepState.backward.errorVector.slice(0, 8).map((v) => v.toFixed(precision)).join(', ')}...]
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
