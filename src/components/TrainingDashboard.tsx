'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CBOWModel } from '../lib/cbow/model';
import { TrainingPair, TrainingLossPoint } from '../lib/cbow/types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  TrendingDown,
  Layers,
  Zap,
  CheckCircle2,
  AlertCircle,
  Activity,
  Flame,
} from 'lucide-react';

interface TrainingDashboardProps {
  model: CBOWModel;
  pairs: TrainingPair[];
  onModelUpdated: () => void;
  speed: 'slow' | 'normal' | 'fast';
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
}

export const TrainingDashboard: React.FC<TrainingDashboardProps> = ({
  model,
  pairs,
  onModelUpdated,
  speed,
  onSpeedChange,
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(1);
  const [targetEpochs, setTargetEpochs] = useState(100);
  const [lossHistory, setLossHistory] = useState<TrainingLossPoint[]>([]);
  const [lastStepInfo, setLastStepInfo] = useState<{
    context: string[];
    target: string;
    prediction: string;
    loss: number;
    isCorrect: boolean;
  } | null>(null);

  const trainingRef = useRef<boolean>(false);
  trainingRef.current = isTraining;

  // Single step training function
  const runSingleStep = (pairIdx: number) => {
    if (pairs.length === 0) return;
    const pair = pairs[pairIdx % pairs.length];
    const stepState = model.step(pair.contextIds, pair.targetId, pairIdx);

    setLastStepInfo({
      context: pair.contextWords,
      target: pair.targetWord,
      prediction: stepState.forward.predictedWord,
      loss: stepState.forward.loss,
      isCorrect: stepState.forward.predictedId === pair.targetId,
    });

    onModelUpdated();
  };

  // Full epoch training
  const runEpoch = (epochNum: number) => {
    if (pairs.length === 0) return 0;
    let epochLoss = 0;
    let lastPair = pairs[0];
    let lastForward = model.forward(lastPair.contextIds, lastPair.targetId);

    for (let i = 0; i < pairs.length; i++) {
      const p = pairs[i];
      const step = model.step(p.contextIds, p.targetId, i);
      epochLoss += step.forward.loss;
      lastPair = p;
      lastForward = step.forward;
    }

    const avgLoss = epochLoss / pairs.length;

    setLossHistory((prev) => [
      ...prev.slice(-99),
      {
        step: prev.length + 1,
        epoch: epochNum,
        loss: Number(avgLoss.toFixed(4)),
        targetWord: lastPair.targetWord,
        predictedWord: lastForward.predictedWord,
      },
    ]);

    setLastStepInfo({
      context: lastPair.contextWords,
      target: lastPair.targetWord,
      prediction: lastForward.predictedWord,
      loss: lastForward.loss,
      isCorrect: lastForward.predictedId === lastPair.targetId,
    });

    onModelUpdated();
    return avgLoss;
  };

  // Automated Training Loop Effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      if (!trainingRef.current) return;

      if (currentEpoch >= targetEpochs) {
        setIsTraining(false);
        return;
      }

      runEpoch(currentEpoch);
      setCurrentEpoch((prev) => prev + 1);

      const delay = speed === 'slow' ? 350 : speed === 'normal' ? 70 : 10;
      timeoutId = setTimeout(tick, delay);
    };

    if (isTraining) {
      tick();
    }

    return () => clearTimeout(timeoutId);
  }, [isTraining, currentEpoch, targetEpochs, speed]);

  const handleReset = () => {
    setIsTraining(false);
    setCurrentEpoch(1);
    setLossHistory([]);
    setLastStepInfo(null);
    model.initWeights();
    onModelUpdated();
  };

  const initialLoss = lossHistory[0]?.loss;
  const currentLoss = lossHistory[lossHistory.length - 1]?.loss;
  const lossDelta = initialLoss && currentLoss ? initialLoss - currentLoss : null;

  return (
    <div className="lab-card rounded-2xl p-6 border border-white/[0.08] shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/[0.06] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest font-bold text-indigo-400 uppercase">
              SGD OPTIMIZATION &bull; STAGE 15
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400">Gradient Descent Loop</span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Iterative Epoch Training & Convergence Monitor
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real in-browser stochastic gradient descent training loop. Cross-entropy loss curve is plotted analytically from batch predictions.
          </p>
        </div>

        {/* Training Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsTraining(!isTraining)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-md ${
              isTraining
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isTraining ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Start Training
              </>
            )}
          </button>

          <button
            onClick={() => {
              runEpoch(currentEpoch);
              setCurrentEpoch((p) => p + 1);
            }}
            disabled={isTraining}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white disabled:opacity-40 transition"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Epoch +1</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-900 border border-white/[0.08] text-slate-400 hover:text-white transition"
            title="Reset Model Weights & History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Epoch Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#050811] border border-white/[0.06] shadow-inner">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
            Epoch Progress
          </span>
          <div className="text-lg font-bold font-mono text-cyan-300">
            {currentEpoch} <span className="text-xs text-slate-500 font-normal">/ {targetEpochs}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#050811] border border-white/[0.06] shadow-inner">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
            Current Epoch Loss
          </span>
          <div className="text-lg font-bold font-mono text-rose-400 flex items-center gap-2">
            <span>{currentLoss ? currentLoss.toFixed(4) : 'N/A'}</span>
            {lossDelta && lossDelta > 0 && (
              <span className="text-[10px] font-sans font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">
                -{(lossDelta).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#050811] border border-white/[0.06] shadow-inner">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
            Pairs per Epoch
          </span>
          <div className="text-lg font-bold font-mono text-teal-300">
            {pairs.length} <span className="text-xs text-slate-500 font-normal">pairs</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#050811] border border-white/[0.06] shadow-inner">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
            Speed Preset
          </span>
          <div className="flex items-center gap-1 mt-1 font-mono">
            {(['slow', 'normal', 'fast'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 rounded text-[10px] capitalize transition ${
                  speed === s
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Recharts Loss Curve */}
      <div className="p-4 rounded-2xl bg-[#050811] border border-white/[0.06] shadow-inner">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            Convergence Curve: L = -log(P(target))
          </span>
          <span className="text-[11px] font-mono text-slate-500 font-normal">
            {lossHistory.length} data points
          </span>
        </div>

        <div className="h-64 w-full">
          {lossHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
              <TrendingDown className="w-8 h-8 opacity-40 text-rose-400" />
              <span>Click "Start Training" or "Epoch +1" to observe real gradient descent convergence.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lossHistory} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="lossAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                <XAxis
                  dataKey="epoch"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  label={{ value: 'Loss', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                  itemStyle={{ color: '#fb7185' }}
                />
                <Area
                  type="monotone"
                  dataKey="loss"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="url(#lossAreaGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Last Step Inspection Card */}
      {lastStepInfo && (
        <div className="p-4 rounded-xl bg-[#090d16] border border-white/[0.08] text-xs">
          <div className="text-slate-400 text-[10px] uppercase font-bold mb-2 flex items-center justify-between">
            <span>Last Iteration Pair Snapshot</span>
            {lastStepInfo.isCorrect ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Accurate Hit
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" /> Updating Weights
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 font-mono">
            <div>
              <span className="text-slate-500">Context: </span>
              <span className="text-teal-300 font-bold">
                [{lastStepInfo.context.map((w) => `"${w}"`).join(', ')}]
              </span>
            </div>
            <div>
              <span className="text-slate-500">Target: </span>
              <span className="text-amber-300 font-bold">"{lastStepInfo.target}"</span>
            </div>
            <div>
              <span className="text-slate-500">Predicted: </span>
              <span className="text-cyan-300 font-bold">"{lastStepInfo.prediction}"</span>
            </div>
            <div>
              <span className="text-slate-500">Loss: </span>
              <span className="text-rose-400 font-bold">{lastStepInfo.loss.toFixed(4)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
