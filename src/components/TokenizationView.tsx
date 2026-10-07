'use client';

import React, { useState } from 'react';
import { TokenizedSentence } from '../lib/cbow/tokenizer';
import { Vocabulary } from '../lib/cbow/vocabulary';
import { Hash, Sparkles, Copy, Layers, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface TokenizationViewProps {
  sentences: TokenizedSentence[];
  vocab: Vocabulary;
  onWordClick?: (word: string) => void;
}

export const TokenizationView: React.FC<TokenizationViewProps> = ({
  sentences,
  vocab,
  onWordClick,
}) => {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(0);
  const [showAllSentences, setShowAllSentences] = useState<boolean>(false);

  const activeSentence = sentences[activeSentenceIdx] || sentences[0];

  return (
    <div className="lab-card rounded-2xl p-6 border border-white/[0.08] shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-white/[0.06] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest font-bold text-cyan-400 uppercase">
              DATA PIPELINE &bull; STAGE 1
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400">Lexical Segmentation</span>
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            Corpus Tokenization & Integer Sequence Encoding
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Raw natural text is normalized, lowercased, and mapped to discrete integer indices for tensor lookup.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-slate-300 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sentences:</span>
            <strong className="text-cyan-300">{sentences.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-slate-300 flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-teal-400" />
            <span>Vocab |V|:</span>
            <strong className="text-teal-300">{vocab.size}</strong>
          </span>
        </div>
      </div>

      {/* Sentence Navigation Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-4 p-2 rounded-xl bg-[#050811] border border-white/[0.06]">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {sentences.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveSentenceIdx(idx);
                setShowAllSentences(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                activeSentenceIdx === idx && !showAllSentences
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Sentence {idx + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAllSentences(!showAllSentences)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition border ${
            showAllSentences
              ? 'bg-slate-800 text-white border-white/20'
              : 'bg-slate-900 text-slate-400 border-white/[0.06] hover:text-white'
          }`}
        >
          {showAllSentences ? 'Show Single' : 'View All (7)'}
        </button>
      </div>

      {/* Sentence Content View */}
      {showAllSentences ? (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
          {sentences.map((sent, sIdx) => (
            <div
              key={sent.id}
              className="p-3.5 rounded-xl bg-[#050811] border border-white/[0.06] hover:border-white/[0.12] transition"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-slate-300">
                  Sentence {sIdx + 1}: <span className="font-mono text-slate-400 italic">"{sent.originalText}"</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500">{sent.tokens.length} tokens</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {sent.tokens.map((token, tIdx) => {
                  const tokenId = vocab.getId(token);
                  const isHovered = hoveredWord === token;

                  return (
                    <div
                      key={`${sent.id}-${tIdx}`}
                      onMouseEnter={() => setHoveredWord(token)}
                      onMouseLeave={() => setHoveredWord(null)}
                      onClick={() => onWordClick && onWordClick(token)}
                      className={`cursor-pointer px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
                        isHovered
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900 border-white/[0.06] text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <span className="font-semibold">{token}</span>
                      <span className="text-[10px] text-slate-500">#{tokenId}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : activeSentence ? (
        <div className="p-5 rounded-2xl bg-[#050811] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.06]">
            <span className="font-medium text-slate-300">
              Active String: <span className="font-mono text-cyan-300 italic">"{activeSentence.originalText}"</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {activeSentence.tokens.length} tokens &bull; Sentence {activeSentenceIdx + 1} of {sentences.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5 py-2">
            {activeSentence.tokens.map((token, tIdx) => {
              const tokenId = vocab.getId(token);
              const isHovered = hoveredWord === token;
              const freq = vocab.wordCounts.get(token) || 1;

              return (
                <motion.div
                  key={`${activeSentence.id}-${tIdx}`}
                  whileHover={{ y: -2 }}
                  onMouseEnter={() => setHoveredWord(token)}
                  onMouseLeave={() => setHoveredWord(null)}
                  onClick={() => onWordClick && onWordClick(token)}
                  className={`cursor-pointer px-3.5 py-2.5 rounded-xl border transition-all flex items-center gap-2 shadow-sm ${
                    isHovered
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-cyan-950/60'
                      : 'bg-slate-900/90 border-white/[0.08] text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <span className="text-sm font-semibold tracking-wide font-mono">
                    {token}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isHovered
                        ? 'bg-cyan-950 text-cyan-200'
                        : 'bg-slate-950 text-slate-400 border border-white/[0.06]'
                    }`}
                  >
                    ID:{tokenId}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs text-slate-400">
            <span>Hover or click tokens to inspect vocabulary lookup index and frequency.</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSentenceIdx((prev) => Math.max(0, prev - 1))}
                disabled={activeSentenceIdx <= 0}
                className="p-1 rounded-lg bg-slate-900 border border-white/[0.06] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveSentenceIdx((prev) => Math.min(sentences.length - 1, prev + 1))}
                disabled={activeSentenceIdx >= sentences.length - 1}
                className="p-1 rounded-lg bg-slate-900 border border-white/[0.06] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Educational Callout */}
      <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-cyan-300">Why Map Tokens to IDs?</strong> Neural networks cannot compute gradients over arbitrary ASCII strings. Tokenization assigns each word a fixed integer index in <span className="font-mono text-cyan-300">0 &le; ID &lt; |V|</span>, which acts as the lookup coordinate into the embedding weight matrix <span className="font-mono text-teal-300">E</span>.
        </div>
      </div>
    </div>
  );
};
