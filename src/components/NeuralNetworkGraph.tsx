'use client';

import React, { useState } from 'react';
import { TrainingPair, ForwardPassResult, BackwardPassResult } from '../lib/cbow/types';
import { Vocabulary } from '../lib/cbow/vocabulary';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Activity, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface NeuralNetworkGraphProps {
  forward: ForwardPassResult;
  backward?: BackwardPassResult;
  currentPair: TrainingPair;
  vocab: Vocabulary;
  embeddingDim: number;
  isBackwardMode?: boolean;
}

export const NeuralNetworkGraph: React.FC<NeuralNetworkGraphProps> = ({
  forward,
  backward,
  currentPair,
  vocab,
  embeddingDim,
  isBackwardMode = false,
}) => {
  const [internalBackwardMode, setInternalBackwardMode] = useState<boolean>(isBackwardMode);
  const activeBackward = isBackwardMode || internalBackwardMode;

  const { contextWords, targetWord, targetId } = currentPair;
  const { hiddenVector, logits, probabilities, predictedWord, predictedId } = forward;
  const D = Math.min(embeddingDim, 5); // display up to 5 neurons
  const isCorrect = predictedId === targetId;

  // Selected vocabulary words to display: target, predicted, and top probability words
  const sortedProbIndices = probabilities
    .map((p, idx) => ({ idx, p }))
    .sort((a, b) => b.p - a.p)
    .map((item) => item.idx);

  const displayVocabIds = Array.from(
    new Set([targetId, predictedId, ...sortedProbIndices.slice(0, 4)])
  ).slice(0, 6);

  // SVG coordinate constants
  const X_INPUT = 80;
  const X_LOOKUP = 240;
  const X_HIDDEN = 450;
  const X_OUTPUT = 660;
  const X_TARGET = 835;

  return (
    <div className="lab-card rounded-2xl p-5 border border-white/[0.08] shadow-2xl bg-[#090d16]/95">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.06] gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest font-bold text-indigo-400 uppercase">
              COMPUTATIONAL GRAPH &bull; STAGE 8
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400">Tensor Signal Flow</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Neural Signal Propagation & Analytical Gradients
            {activeBackward ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold">
                BACKWARD GRADIENT FLOW &larr;
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                FORWARD INFERENCE FLOW &rarr;
              </span>
            )}
          </h3>
        </div>

        {/* Direction Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInternalBackwardMode(!activeBackward)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              activeBackward
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 shadow-sm shadow-rose-950/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30 shadow-sm shadow-cyan-950/40'
            }`}
          >
            {activeBackward ? (
              <>
                <ArrowLeft className="w-3.5 h-3.5" /> Switch to Forward Pass
              </>
            ) : (
              <>
                <ArrowRight className="w-3.5 h-3.5" /> Switch to Backpropagation
              </>
            )}
          </button>
        </div>
      </div>

      {/* SVG Neural Diagram */}
      <div className="w-full overflow-x-auto py-1">
        <svg
          viewBox="0 0 940 380"
          className="w-full min-w-[780px] h-[380px] bg-[#050811] rounded-2xl border border-white/[0.08] shadow-inner"
        >
          <defs>
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <radialGradient id="centerAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#050811" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Aura */}
          <rect width="940" height="380" fill="url(#centerAura)" />

          {/* LAYER 1: Input Context Words (X = 80) */}
          <g>
            <text x={X_INPUT} y="28" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
              INPUT CONTEXT
            </text>
            <text x={X_INPUT} y="42" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
              x_c &isin; &#123;0,1&#125;^{vocab.size}
            </text>

            {contextWords.map((cw, idx) => {
              const y = 80 + idx * (240 / Math.max(1, contextWords.length - 1 || 1));
              return (
                <g key={`cw-${idx}`}>
                  <circle
                    cx={X_INPUT}
                    cy={y}
                    r="18"
                    fill="#042f2e"
                    stroke="#14b8a6"
                    strokeWidth="2"
                    filter="url(#nodeGlow)"
                  />
                  <text x={X_INPUT} y={y + 4} textAnchor="middle" fill="#5eead4" fontSize="10" fontWeight="bold">
                    {cw.length > 5 ? cw.slice(0, 4) + '..' : cw}
                  </text>
                  <text x={X_INPUT - 32} y={y + 3} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
                    x_{idx + 1}
                  </text>
                </g>
              );
            })}
          </g>

          {/* LAYER 2: Embedding Matrix Rows Lookup (X = 240) */}
          <g>
            <text x={X_LOOKUP} y="28" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
              EMBEDDING LOOKUP
            </text>
            <text x={X_LOOKUP} y="42" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
              v_c = Eᵀ x_c
            </text>

            {contextWords.map((cw, idx) => {
              const y = 80 + idx * (240 / Math.max(1, contextWords.length - 1 || 1));
              return (
                <g key={`el-${idx}`}>
                  {/* Connector Line from Input to Embedding */}
                  <line
                    x1={X_INPUT + 18}
                    y1={y}
                    x2={X_LOOKUP - 30}
                    y2={y}
                    stroke={activeBackward ? '#f43f5e' : '#14b8a6'}
                    strokeWidth="1.8"
                    strokeDasharray={activeBackward ? '4 2' : 'none'}
                    opacity="0.75"
                  />
                  <rect
                    x={X_LOOKUP - 30}
                    y={y - 13}
                    width="60"
                    height="26"
                    rx="8"
                    fill="#042f2e"
                    stroke="#14b8a6"
                    strokeWidth="1.5"
                  />
                  <text x={X_LOOKUP} y={y + 4} textAnchor="middle" fill="#5eead4" fontSize="10" fontWeight="bold">
                    v_{cw.length > 4 ? cw.slice(0, 3) : cw}
                  </text>
                </g>
              );
            })}
          </g>

          {/* CONNECTIONS: Embedding Lookups -> Hidden Layer h */}
          {contextWords.map((_, cIdx) => {
            const y1 = 80 + cIdx * (240 / Math.max(1, contextWords.length - 1 || 1));
            return Array.from({ length: D }).map((_, hIdx) => {
              const y2 = 85 + hIdx * (220 / Math.max(1, D - 1 || 1));
              return (
                <line
                  key={`c-h-${cIdx}-${hIdx}`}
                  x1={X_LOOKUP + 30}
                  y1={y1}
                  x2={X_HIDDEN - 20}
                  y2={y2}
                  stroke={activeBackward ? '#f43f5e' : '#6366f1'}
                  strokeWidth="1.2"
                  opacity={activeBackward ? 0.4 : 0.25}
                />
              );
            });
          })}

          {/* LAYER 3: Hidden Representation h (X = 450) */}
          <g>
            <text x={X_HIDDEN} y="28" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="bold">
              HIDDEN LAYER (h)
            </text>
            <text x={X_HIDDEN} y="42" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
              h = 1/C &Sigma; v_c &isin; ℝ^{embeddingDim}
            </text>

            {Array.from({ length: D }).map((_, hIdx) => {
              const y = 85 + hIdx * (220 / Math.max(1, D - 1 || 1));
              const val = hiddenVector[hIdx] ?? 0;
              return (
                <g key={`h-${hIdx}`}>
                  <circle
                    cx={X_HIDDEN}
                    cy={y}
                    r="19"
                    fill="#1e1b4b"
                    stroke="#818cf8"
                    strokeWidth="2"
                    filter="url(#nodeGlow)"
                  />
                  <text x={X_HIDDEN} y={y + 4} textAnchor="middle" fill="#e0e7ff" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                  </text>
                  <text x={X_HIDDEN - 34} y={y + 3} textAnchor="end" fill="#818cf8" fontSize="8" fontFamily="monospace">
                    h_{hIdx + 1}
                  </text>
                </g>
              );
            })}
          </g>

          {/* CONNECTIONS: Hidden Layer -> Output Logits */}
          {Array.from({ length: D }).map((_, hIdx) => {
            const y1 = 85 + hIdx * (220 / Math.max(1, D - 1 || 1));
            return displayVocabIds.map((vId, vIdx) => {
              const y2 = 70 + vIdx * 45;
              const isTargetSynapse = vId === targetId;
              const isPredSynapse = vId === predictedId;

              return (
                <line
                  key={`h-out-${hIdx}-${vIdx}`}
                  x1={X_HIDDEN + 20}
                  y1={y1}
                  x2={X_OUTPUT - 55}
                  y2={y2}
                  stroke={
                    activeBackward
                      ? '#f43f5e'
                      : isTargetSynapse
                      ? '#f59e0b'
                      : isPredSynapse
                      ? '#38bdf8'
                      : '#334155'
                  }
                  strokeWidth={isTargetSynapse || isPredSynapse ? 2 : 0.8}
                  opacity={isTargetSynapse ? 0.9 : isPredSynapse ? 0.7 : 0.18}
                />
              );
            });
          })}

          {/* LAYER 4: Output Projection Logits & Softmax (X = 660) */}
          <g>
            <text x={X_OUTPUT} y="28" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
              OUTPUT & SOFTMAX
            </text>
            <text x={X_OUTPUT} y="42" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
              u = Wᵀ h + b &rarr; ŷ
            </text>

            {displayVocabIds.map((vId, idx) => {
              const y = 70 + idx * 45;
              const word = vocab.getWord(vId) || `w${vId}`;
              const prob = (probabilities[vId] || 0) * 100;
              const isTarget = vId === targetId;
              const isPredicted = vId === predictedId;

              return (
                <g key={`out-${vId}`}>
                  <rect
                    x={X_OUTPUT - 55}
                    y={y - 14}
                    width="114"
                    height="28"
                    rx="8"
                    fill={isTarget ? '#451a03' : isPredicted ? '#082f49' : '#0f172a'}
                    stroke={isTarget ? '#f59e0b' : isPredicted ? '#0284c7' : '#334155'}
                    strokeWidth={isTarget || isPredicted ? 2 : 1}
                  />
                  <text x={X_OUTPUT - 43} y={y + 4} fill={isTarget ? '#fde68a' : '#cbd5e1'} fontSize="10" fontWeight="bold">
                    {word}
                  </text>
                  <text x={X_OUTPUT + 47} y={y + 4} textAnchor="end" fill={isTarget ? '#fbbf24' : '#38bdf8'} fontSize="10" fontFamily="monospace" fontWeight="bold">
                    {prob.toFixed(1)}%
                  </text>
                </g>
              );
            })}
          </g>

          {/* LAYER 5: Predicted Target Capsule (X = 835) */}
          <g>
            <text x={X_TARGET} y="28" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="bold">
              PREDICTED TARGET
            </text>
            <text x={X_TARGET} y="42" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
              argmax(ŷ)
            </text>

            <line x1={X_OUTPUT + 59} y1="160" x2={X_TARGET - 50} y2="160" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />

            <g>
              <rect
                x={X_TARGET - 50}
                y="130"
                width="100"
                height="60"
                rx="14"
                fill={isCorrect ? '#064e3b' : '#451a03'}
                stroke={isCorrect ? '#10b981' : '#f59e0b'}
                strokeWidth="2.5"
                filter="url(#nodeGlow)"
              />
              <text x={X_TARGET} y="157" textAnchor="middle" fill={isCorrect ? '#6ee7b7' : '#fef08a'} fontSize="13" fontWeight="bold">
                "{predictedWord}"
              </text>
              <text x={X_TARGET} y="176" textAnchor="middle" fill={isCorrect ? '#a7f3d0' : '#fed7aa'} fontSize="10" fontFamily="monospace">
                {((probabilities[predictedId] || 0) * 100).toFixed(1)}% conf
              </text>
            </g>
          </g>

          {/* DYNAMIC SIGNAL WAVE ANIMATIONS */}
          {!activeBackward ? (
            <g>
              {/* Forward signal packet waves traveling along active pathways */}
              {contextWords.slice(0, 3).map((_, cIdx) => {
                const startY = 80 + cIdx * (240 / Math.max(1, contextWords.length - 1 || 1));
                const midY = 85 + (cIdx % D) * (220 / Math.max(1, D - 1 || 1));
                return (
                  <motion.circle
                    key={`fw-wave-${cIdx}`}
                    r="4"
                    fill="#38bdf8"
                    filter="url(#nodeGlow)"
                    animate={{
                      cx: [X_INPUT, X_LOOKUP, X_HIDDEN, X_OUTPUT, X_TARGET],
                      cy: [startY, startY, midY, 160, 160],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: cIdx * 0.45,
                    }}
                  />
                );
              })}
            </g>
          ) : (
            <g>
              {/* Backward gradient pulse waves traveling from error vector to embeddings */}
              {[0, 1, 2].map((pIdx) => (
                <motion.circle
                  key={`bw-wave-${pIdx}`}
                  r="4"
                  fill="#f43f5e"
                  filter="url(#nodeGlow)"
                  animate={{
                    cx: [X_TARGET, X_OUTPUT, X_HIDDEN, X_LOOKUP, X_INPUT],
                    cy: [160, 160, 85 + (pIdx % D) * 45, 110 + pIdx * 40, 110 + pIdx * 40],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: pIdx * 0.45,
                  }}
                />
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* Network Architecture Footer */}
      <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            <strong className="text-slate-300">Signal Flow: </strong>
            Context words &rarr; Embedding Rows <span className="font-mono text-cyan-300">v_c</span> &rarr; Hidden Pool <span className="font-mono text-indigo-300">h &isin; ℝ<sup>{embeddingDim}</sup></span> &rarr; Linear Projection <span className="font-mono text-amber-300">Wᵀ h</span> &rarr; Softmax <span className="font-mono text-teal-300">ŷ</span>.
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            Target: "{targetWord}"
          </span>
          <span
            className={`px-2.5 py-1 rounded-lg border ${
              isCorrect
                ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                : 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20'
            }`}
          >
            Prediction: "{predictedWord}" {isCorrect && '&bull; Match'}
          </span>
        </div>
      </div>
    </div>
  );
};
