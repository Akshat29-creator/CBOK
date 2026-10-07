'use client';

import React, { useState, useMemo } from 'react';
import { WordEmbeddingPoint } from '../lib/cbow/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Search,
  Crosshair,
  ZoomIn,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';

interface EmbeddingPlotProps {
  embeddingPoints: WordEmbeddingPoint[];
  selectedWord: string | null;
  onSelectWord: (word: string) => void;
  embeddingDim: number;
}

export const EmbeddingPlot: React.FC<EmbeddingPlotProps> = ({
  embeddingPoints,
  selectedWord,
  onSelectWord,
  embeddingDim,
}) => {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Active point
  const activePoint = useMemo(() => {
    return (
      embeddingPoints.find((p) => p.word === (hoveredWord || selectedWord)) ||
      embeddingPoints[0] ||
      null
    );
  }, [embeddingPoints, hoveredWord, selectedWord]);

  // Filtered points by search
  const filteredPoints = useMemo(() => {
    if (!searchQuery.trim()) return embeddingPoints;
    return embeddingPoints.filter((p) =>
      p.word.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [embeddingPoints, searchQuery]);

  // SVG coordinate dimensions
  const svgWidth = 720;
  const svgHeight = 480;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2;
  const scale = 210 * zoomLevel;

  // Project point (x, y) [-1, 1] to SVG coordinates
  const toSvgX = (x: number) => cx + x * scale;
  const toSvgY = (y: number) => cy - y * scale; // invert Y for standard Cartesian

  // Intelligent non-colliding label placement with leader lines
  const labelPositions = useMemo(() => {
    const rawPos = filteredPoints.map((pt) => {
      const px = toSvgX(pt.x);
      const py = toSvgY(pt.y);
      const labelWidth = pt.word.length * 7 + 16;
      const labelHeight = 20;

      // Initial quadrant placement based on position from center
      let angle = Math.atan2(py - cy, px - cx);
      let dx = Math.cos(angle) * 20;
      let dy = Math.sin(angle) * 20;

      // Ensure minimal offset
      if (Math.abs(dx) < 14) dx = dx >= 0 ? 16 : -16;
      if (Math.abs(dy) < 12) dy = dy >= 0 ? 14 : -14;

      return {
        id: pt.id,
        word: pt.word,
        px,
        py,
        labelX: px + dx,
        labelY: py + dy,
        labelWidth,
        labelHeight,
      };
    });

    // Multi-pass label separation to eliminate all overlaps
    for (let pass = 0; pass < 6; pass++) {
      for (let i = 0; i < rawPos.length; i++) {
        for (let j = i + 1; j < rawPos.length; j++) {
          const a = rawPos[i];
          const b = rawPos[j];

          const dx = a.labelX - b.labelX;
          const dy = a.labelY - b.labelY;
          const dist = Math.hypot(dx, dy);
          const minDist = 30;

          if (dist < minDist && dist > 0.001) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;

            a.labelX += nx * overlap;
            a.labelY += ny * overlap;
            b.labelX -= nx * overlap;
            b.labelY -= ny * overlap;
          }
        }

        // Clamp to SVG canvas boundary
        const a = rawPos[i];
        a.labelX = Math.max(30, Math.min(svgWidth - 60, a.labelX));
        a.labelY = Math.max(30, Math.min(svgHeight - 25, a.labelY));
      }
    }

    return rawPos.map((pos) => ({
      ...pos,
      hasLeader: Math.hypot(pos.labelX - pos.px, pos.labelY - pos.py) > 16,
    }));
  }, [filteredPoints, svgWidth, svgHeight, zoomLevel, scale]);

  return (
    <div className="lab-card rounded-2xl p-5 border border-white/[0.08] shadow-2xl bg-[#090d16]/95">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.06] gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest font-bold text-teal-400 uppercase">
              VECTOR SPACE PROJECTION &bull; 2D PCA
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400">Principal Component Analysis</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Continuous Semantic Embedding Projector
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            High-dimensional representation space <span className="font-mono text-teal-300">ℝ<sup>{embeddingDim}</sup></span> projected onto orthogonal principal axes. Words in similar context neighborhoods gravitate toward proximate coordinates.
          </p>
        </div>

        {/* Search & Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find word in space..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/90 border border-white/[0.08] rounded-xl pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 w-36 sm:w-44 font-mono"
            />
          </div>

          <div className="flex items-center rounded-xl bg-slate-900 border border-white/[0.08] p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.25))}
              className="p-1 hover:text-white text-slate-400 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-400">
              {zoomLevel.toFixed(1)}x
            </span>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:text-white text-slate-400 transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-2">
        {/* SVG Projection Canvas (Left Column) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050811] shadow-inner">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-[440px] select-none"
            >
              <defs>
                <filter id="plotGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#050811" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width={svgWidth} height={svgHeight} fill="url(#centerGlow)" />

              {/* Grid Lines */}
              {[-160, -100, -50, 50, 100, 160].map((offset) => (
                <g key={offset} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.35">
                  <line x1="0" y1={cy + offset * zoomLevel} x2={svgWidth} y2={cy + offset * zoomLevel} />
                  <line x1={cx + offset * zoomLevel} y1="0" x2={cx + offset * zoomLevel} y2={svgHeight} />
                </g>
              ))}

              {/* Concentric Distance Rings */}
              {[60, 120, 180].map((radius) => (
                <circle
                  key={radius}
                  cx={cx}
                  cy={cy}
                  r={radius * zoomLevel}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
              ))}

              {/* Principal Cartesian Axes */}
              <line x1="20" y1={cy} x2={svgWidth - 20} y2={cy} stroke="#334155" strokeWidth="1.2" opacity="0.6" />
              <line x1={cx} y1="20" x2={cx} y2={svgHeight - 20} stroke="#334155" strokeWidth="1.2" opacity="0.6" />

              {/* Axis Labels */}
              <text x={svgWidth - 24} y={cy - 8} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">
                +PC 1
              </text>
              <text x="24" y={cy - 8} fill="#64748b" fontSize="10" fontFamily="monospace">
                -PC 1
              </text>
              <text x={cx + 10} y="26" fill="#64748b" fontSize="10" fontFamily="monospace">
                +PC 2
              </text>
              <text x={cx + 10} y={svgHeight - 16} fill="#64748b" fontSize="10" fontFamily="monospace">
                -PC 2
              </text>

              {/* Nearest Neighbor Connecting Rays from Active Point */}
              {activePoint && (
                <g>
                  {/* Origin vector line */}
                  <line
                    x1={cx}
                    y1={cy}
                    x2={toSvgX(activePoint.x)}
                    y2={toSvgY(activePoint.y)}
                    stroke="#14b8a6"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.35"
                  />

                  {/* Clean connecting rays to nearest neighbors (NO overlapping midpoint boxes!) */}
                  {activePoint.nearestWords.slice(0, 4).map((neighbor, idx) => {
                    const target = embeddingPoints.find((p) => p.word === neighbor.word);
                    if (!target) return null;

                    const sx = toSvgX(activePoint.x);
                    const sy = toSvgY(activePoint.y);
                    const tx = toSvgX(target.x);
                    const ty = toSvgY(target.y);

                    return (
                      <line
                        key={idx}
                        x1={sx}
                        y1={sy}
                        x2={tx}
                        y2={ty}
                        stroke="#2dd4bf"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        opacity={0.65}
                      />
                    );
                  })}
                </g>
              )}

              {/* Data Points and Clean Leader Labels */}
              {filteredPoints.map((pt, idx) => {
                const pos = labelPositions[idx] || {
                  px: toSvgX(pt.x),
                  py: toSvgY(pt.y),
                  labelX: toSvgX(pt.x) + 14,
                  labelY: toSvgY(pt.y) - 14,
                  labelWidth: pt.word.length * 7 + 16,
                  labelHeight: 20,
                  hasLeader: false,
                };

                const isSelected = selectedWord === pt.word;
                const isHovered = hoveredWord === pt.word;
                const isNeighbor = activePoint?.nearestWords
                  .slice(0, 3)
                  .some((n) => n.word === pt.word);

                const px = pos.px;
                const py = pos.py;

                return (
                  <g
                    key={pt.word}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredWord(pt.word)}
                    onMouseLeave={() => setHoveredWord(null)}
                    onClick={() => onSelectWord(pt.word)}
                  >
                    {/* Leader Line if label is displaced */}
                    {pos.hasLeader && (
                      <line
                        x1={px}
                        y1={py}
                        x2={pos.labelX}
                        y2={pos.labelY}
                        stroke={isSelected ? '#38bdf8' : isNeighbor ? '#a855f7' : '#475569'}
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        opacity={isSelected || isNeighbor ? 0.8 : 0.4}
                      />
                    )}

                    {/* Node Dot */}
                    <circle
                      cx={px}
                      cy={py}
                      r={isSelected ? 7 : isNeighbor ? 5.5 : 4.5}
                      fill={
                        isSelected
                          ? '#0284c7'
                          : isNeighbor
                          ? '#7e22ce'
                          : isHovered
                          ? '#0f766e'
                          : '#115e59'
                      }
                      stroke={
                        isSelected
                          ? '#38bdf8'
                          : isNeighbor
                          ? '#c084fc'
                          : isHovered
                          ? '#2dd4bf'
                          : '#14b8a6'
                      }
                      strokeWidth={isSelected || isNeighbor ? 2.5 : 1.5}
                      filter={isSelected || isHovered ? 'url(#plotGlow)' : undefined}
                    />

                    {/* Clean Label Pill */}
                    <g transform={`translate(${pos.labelX}, ${pos.labelY})`}>
                      <rect
                        x={-pos.labelWidth / 2}
                        y={-10}
                        width={pos.labelWidth}
                        height={pos.labelHeight}
                        rx={6}
                        fill={
                          isSelected
                            ? '#0369a1'
                            : isNeighbor
                            ? '#581c87'
                            : '#090d16'
                        }
                        stroke={
                          isSelected
                            ? '#38bdf8'
                            : isNeighbor
                            ? '#a855f7'
                            : '#334155'
                        }
                        strokeWidth={isSelected || isNeighbor ? 1.5 : 0.8}
                        opacity={0.95}
                      />
                      <text
                        x={0}
                        y={3.5}
                        fill={
                          isSelected
                            ? '#f0f9ff'
                            : isNeighbor
                            ? '#f3e8ff'
                            : '#e2e8f0'
                        }
                        fontSize={isSelected ? '11' : '10'}
                        fontWeight={isSelected || isNeighbor ? 'bold' : 'normal'}
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {pt.word}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Plot Legend */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Selected</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span>Cosine Neighbor</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span>Vocabulary Node</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              Click any node to inspect semantic neighbors
            </span>
          </div>
        </div>

        {/* Selected Word Inspector Card (Right Column) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          {activePoint ? (
            <div className="p-4 rounded-2xl bg-[#050811] border border-white/[0.06] shadow-inner space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold font-mono">
                    Selected Word Node
                  </span>
                  <h4 className="text-xl font-bold font-mono text-cyan-300">
                    "{activePoint.word}"
                  </h4>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-white/[0.06]">
                  ID: {activePoint.id}
                </span>
              </div>

              {/* 2D Coordinates */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/[0.06]">
                  <span className="text-slate-500 text-[10px] block font-sans">PC 1 Coordinate</span>
                  <span className="text-cyan-400 font-bold">
                    {activePoint.x >= 0 ? `+${activePoint.x.toFixed(3)}` : activePoint.x.toFixed(3)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/[0.06]">
                  <span className="text-slate-500 text-[10px] block font-sans">PC 2 Coordinate</span>
                  <span className="text-indigo-400 font-bold">
                    {activePoint.y >= 0 ? `+${activePoint.y.toFixed(3)}` : activePoint.y.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* High-Dim Vector Coordinates */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                  Learned Vector v &isin; ℝ<sup>{embeddingDim}</sup>
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/[0.06] font-mono text-xs flex flex-wrap gap-1.5">
                  <span className="text-slate-500">[</span>
                  {activePoint.rawVector.map((val: number, idx: number) => (
                    <span
                      key={idx}
                      className={val >= 0 ? 'text-teal-300' : 'text-rose-400'}
                    >
                      {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                      {idx < activePoint.rawVector.length - 1 ? ',' : ''}
                    </span>
                  ))}
                  <span className="text-slate-500">]</span>
                </div>
              </div>

              {/* Nearest Context Neighbors */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    Nearest Context Neighbors
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">cos(v_A, v_B)</span>
                </div>

                <div className="space-y-1.5">
                  {activePoint.nearestWords.slice(0, 5).map((n, idx) => (
                    <div
                      key={n.word}
                      onClick={() => onSelectWord(n.word)}
                      className="p-2 rounded-xl bg-slate-950 border border-white/[0.04] hover:border-purple-500/40 cursor-pointer transition flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px]">#{idx + 1}</span>
                        <span className="text-slate-200 font-bold">"{n.word}"</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-400 to-purple-400 rounded-full"
                            style={{
                              width: `${Math.max(0, ((n.similarity + 1) / 2) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-teal-300 font-bold text-[11px] w-8 text-right">
                          {n.similarity.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#050811] border border-white/[0.06] text-center text-slate-500 text-xs">
              Select any node in the vector space to inspect semantic neighbors.
            </div>
          )}

          {/* Theoretical Note Card */}
          <div className="p-3.5 rounded-2xl bg-[#050811] border border-white/[0.06] text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300 font-semibold block mb-0.5">
              Representation Topology:
            </strong>
            Words frequently co-occurring in identical context windows develop aligned weight update trajectories, naturally organizing into topological semantic clusters.
          </div>
        </div>
      </div>
    </div>
  );
};
