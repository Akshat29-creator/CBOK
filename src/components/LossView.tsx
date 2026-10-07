'use client';

import React from 'react';
import { ForwardPassResult, TrainingPair } from '../lib/cbow/types';
import { motion } from 'framer-motion';
import { Flame, AlertTriangle, TrendingDown, CheckCircle2 } from 'lucide-react';

interface LossViewProps {
  forward: ForwardPassResult;
  currentPair: TrainingPair;
}

export const LossView: React.FC<LossViewProps> = ({ forward, currentPair }) => {
  const { probabilities, predictedId, predictedWord, loss } = forward;
  const { targetId, targetWord } = currentPair;

  const targetProb = Math.max(1e-12, probabilities[targetId] || 1e-12);
  const isMatch = predictedId === targetId;

  // SVG dimensions for the logarithmic penalty curve
  const svgW = 380;
  const svgH = 180;
  const padding = 35;

  // Function to project (p, loss) to SVG coordinates
  // p in [0.02, 1.0], loss in [0, 4.0]
  const toCurveX = (p: number) => padding + ((p - 0.02) / 0.98) * (svgW - padding * 2);
  const toCurveY = (l: number) => svgH - padding - (Math.min(4.0, l) / 4.0) * (svgH - padding * 2);

  // Generate SVG path for L = -ln(p)
  const curvePoints: string[] = [];
  for (let i = 0; i <= 50; i++) {
    const p = 0.02 + (i / 50) * 0.98;
    const l = -Math.log(p);
    const x = toCurveX(p);
    const y = toCurveY(l);
    curvePoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const curvePath = curvePoints.join(' ');

  const currentMarkerX = toCurveX(Math.min(1.0, Math.max(0.02, targetProb)));
  const currentMarkerY = toCurveY(loss);

  return (
    <div className="lab-card rounded-2xl p-5 border border-white/[0.08] shadow-2xl bg-[#090d16]/95">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.06] gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest font-bold text-rose-400 uppercase">
              OBJECTIVE FUNCTION &bull; STAGE 11
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400">Loss Evaluation</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Categorical Cross-Entropy Loss Formulation
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Penalizes the divergence between the true one-hot target distribution <span className="font-mono text-amber-300">y</span> and model predicted softmax probabilities <span className="font-mono text-cyan-300">ŷ</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-2">
        {/* Left: Active Step-by-Step Calculation */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="p-4 rounded-2xl bg-[#050811] border border-white/[0.06] shadow-inner space-y-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Analytical Calculation Breakdown</span>
              <span className="font-mono text-rose-400 font-bold">L = -ln P(target | Context)</span>
            </div>

            {/* Numerical Step Sequence */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/[0.06] font-mono text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">1. True Target Token:</span>
                <span className="text-amber-300 font-bold">"{targetWord}" (ID: {targetId})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">2. Assigned Model Probability:</span>
                <span className="text-cyan-300 font-bold">
                  {targetProb.toFixed(4)} ({(targetProb * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="text-slate-400 font-sans">3. Negative Natural Log:</span>
                <span className="text-rose-300">
                  -ln({targetProb.toFixed(4)})
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-sm">
                <span className="font-sans font-bold text-slate-200">Current Cross-Entropy Loss:</span>
                <motion.span
                  key={loss}
                  initial={{ scale: 1.15, color: '#f43f5e' }}
                  animate={{ scale: 1, color: '#fb7185' }}
                  className="font-bold font-mono text-base"
                >
                  {loss.toFixed(4)}
                </motion.span>
              </div>
            </div>

            {/* Match Status Callout */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                isMatch
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
              }`}
            >
              {isMatch ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Model correctly predicted "{targetWord}". Loss is relatively low ({loss.toFixed(3)}), causing minimal gradient perturbation.
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    Model predicted "{predictedWord}" instead of target "{targetWord}". High loss ({loss.toFixed(3)}) will induce strong backpropagation gradients.
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Interactive Logarithmic Penalty Curve */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="p-4 rounded-2xl bg-[#050811] border border-white/[0.06] shadow-inner space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Asymptotic Penalty Curve: L = -ln(p)
            </span>

            {/* SVG Curve */}
            <div className="w-full relative bg-slate-950 rounded-xl border border-white/[0.04] p-2">
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-[150px]">
                <defs>
                  <filter id="lossGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Axes */}
                <line x1={padding} y1={svgH - padding} x2={svgW - padding + 15} y2={svgH - padding} stroke="#334155" strokeWidth="1" />
                <line x1={padding} y1={svgH - padding} x2={padding} y2={padding - 10} stroke="#334155" strokeWidth="1" />

                {/* Axis Labels */}
                <text x={svgW - padding + 15} y={svgH - padding + 12} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
                  Prob p &rarr; 1.0
                </text>
                <text x={padding - 5} y={padding - 10} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
                  Loss L &uarr;
                </text>

                {/* Log Curve Path */}
                <path d={curvePath} fill="none" stroke="#f43f5e" strokeWidth="2" opacity="0.8" />

                {/* Projection Lines to Current Point */}
                <line
                  x1={currentMarkerX}
                  y1={svgH - padding}
                  x2={currentMarkerX}
                  y2={currentMarkerY}
                  stroke="#fb7185"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.6"
                />
                <line
                  x1={padding}
                  y1={currentMarkerY}
                  x2={currentMarkerX}
                  y2={currentMarkerY}
                  stroke="#fb7185"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.6"
                />

                {/* Current Operating Point Marker */}
                <circle
                  cx={currentMarkerX}
                  cy={currentMarkerY}
                  r="5.5"
                  fill="#f43f5e"
                  stroke="#ffe4e6"
                  strokeWidth="2"
                  filter="url(#lossGlow)"
                />

                {/* Marker Value Tooltip */}
                <text
                  x={Math.min(svgW - padding - 40, currentMarkerX + 8)}
                  y={Math.max(padding + 10, currentMarkerY - 8)}
                  fill="#fecdd3"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  L={loss.toFixed(2)}
                </text>
              </svg>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              When target probability approaches 0, loss approaches &infin;. Backpropagation uses this gradient cliff to push weights toward higher likelihood.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
