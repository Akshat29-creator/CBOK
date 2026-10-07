'use client';

import React, { useState } from 'react';
import { Vocabulary } from '../lib/cbow/vocabulary';
import { Search, Hash, Sparkles, Filter, ExternalLink } from 'lucide-react';

interface VocabularyTableProps {
  vocab: Vocabulary;
  selectedWord: string | null;
  onSelectWord: (word: string) => void;
}

export const VocabularyTable: React.FC<VocabularyTableProps> = ({
  vocab,
  selectedWord,
  onSelectWord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWords = vocab.wordList.filter((w) =>
    w.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lab-card rounded-2xl p-6 border border-slate-800/80">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800/60 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-teal-950 text-teal-400 border border-teal-800/50">
              STAGE 02
            </span>
            <h3 className="text-base font-bold text-slate-100">
              Vocabulary Construction & Frequency Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Each unique token forms the basis of dimension <span className="font-mono text-teal-300 font-bold">|V| = {vocab.size}</span>. Click any word to inspect its one-hot index and embeddings.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search word..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Vocabulary Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60 max-h-96">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Word</th>
              <th className="px-4 py-3 font-semibold text-center">ID</th>
              <th className="px-4 py-3 font-semibold text-center">Corpus Frequency</th>
              <th className="px-4 py-3 font-semibold">One-Hot Encoding Vector e_i</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {filteredWords.map((item) => {
              const isSelected = selectedWord === item.word;

              // Build one-hot snippet
              const oneHotSnippet = item.oneHot
                .map((val, idx) => (idx === item.id ? '1' : '0'))
                .slice(0, 10)
                .join(',');
              const hasMore = item.oneHot.length > 10;

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectWord(item.word)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-teal-950/60 text-teal-200 font-bold'
                      : 'hover:bg-slate-900/50 text-slate-300'
                  }`}
                >
                  <td className="px-4 py-2.5 font-sans font-semibold text-slate-100 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-teal-400 animate-pulse' : 'bg-slate-700'
                      }`}
                    />
                    {item.word}
                  </td>
                  <td className="px-4 py-2.5 text-center text-teal-400 font-bold">
                    {item.id}
                  </td>
                  <td className="px-4 py-2.5 text-center text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {item.count}x
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">
                    <span className="text-slate-500">[</span>
                    <span className="text-teal-400">{oneHotSnippet}</span>
                    {hasMore && <span className="text-slate-500">, ...</span>}
                    <span className="text-slate-500">]</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWord(item.word);
                      }}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700/80 text-[10px] text-teal-300 hover:bg-teal-950 transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Educational Footer */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>
            Total unique words in vocabulary: <strong className="text-teal-300 font-mono">|V| = {vocab.size}</strong>
          </span>
        </div>
        <span className="text-slate-500 text-[11px]">
          One-hot dimension matches vocabulary cardinality exactly.
        </span>
      </div>
    </div>
  );
};
