'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Presentation,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  Maximize2,
  GraduationCap,
} from 'lucide-react';
import { CBOWModel } from '../lib/cbow/model';
import { TrainingPair, StepCalculationState, WordEmbeddingPoint } from '../lib/cbow/types';
import { TokenizedSentence } from '../lib/cbow/tokenizer';

// Import visualizations to embed in professor slides
import { TokenizationView } from './TokenizationView';
import { VocabularyTable } from './VocabularyTable';
import { ContextWindowView } from './ContextWindowView';
import { OneHotView } from './OneHotView';
import { EmbeddingLayerView } from './EmbeddingLayerView';
import { ContextAggregationView } from './ContextAggregationView';
import { NeuralNetworkGraph } from './NeuralNetworkGraph';
import { OutputSoftmaxView } from './OutputSoftmaxView';
import { LossView } from './LossView';
import { BackpropagationView } from './BackpropagationView';
import { WeightUpdateView } from './WeightUpdateView';
import { TrainingDashboard } from './TrainingDashboard';
import { EmbeddingPlot } from './EmbeddingPlot';

interface SlideConfig {
  id: number;
  title: string;
  subtitle: string;
  formula: string;
  dimensionBadge: string;
  whatHappening: string;
  lectureNotes: string;
}

const PROFESSOR_SLIDES: SlideConfig[] = [
  {
    id: 1,
    title: '1. What is CBOW? Distributional Hypothesis',
    subtitle: 'Predicting a central target word from surrounding symmetric context words',
    formula: 'max_θ  Σ log P(w_t | w_{t-c}, ..., w_{t+c})',
    dimensionBadge: 'Continuous Vector Space ℝ^D',
    whatHappening:
      'CBOW reverses the traditional n-gram statistical language model by learning continuous dense vector representations in a lower-dimensional space, capturing latent semantic relationships through context co-occurrence.',
    lectureNotes:
      'Explain to the professor: "Traditional NLP represents words as orthogonal one-hot vectors, which lack semantic distance. CBOW operationalizes Zellig Harris’s Distributional Hypothesis: words that occur in similar contexts share similar vector embeddings."',
  },
  {
    id: 2,
    title: '2. Corpus Tokenization & Lexical IDs',
    subtitle: 'Segmenting unstructured text into discrete integer vocabulary tokens',
    formula: 'w ∈ V = {0, 1, ..., |V| - 1}',
    dimensionBadge: '|V| Unique Vocabulary Tokens',
    whatHappening:
      'The raw corpus is normalized, stripped of non-alphanumeric punctuation, and converted to integer identifiers that serve as row indices in our embedding lookup table.',
    lectureNotes:
      '"Notice how each word is deterministically mapped to an ID. Even repeated tokens point to the same index, establishing our vocabulary basis."',
  },
  {
    id: 3,
    title: '3. Vocabulary Construction & Frequencies',
    subtitle: 'Establishing the finite categorical dimension |V|',
    formula: '|V| = Cardinality of Lexicon',
    dimensionBadge: 'Vocabulary Cardinality |V|',
    whatHappening:
      'We sort unique words by corpus frequency. Each word represents a basis vector in the original one-hot vector space.',
    lectureNotes:
      '"The vocabulary size |V| determines both the rows of the input embedding matrix E and the output dimension of our softmax layer."',
  },
  {
    id: 4,
    title: '4. Sliding Context Window Mechanism',
    subtitle: 'Extracting local word neighborhoods with symmetric radius c',
    formula: 'Context(w_t) = { w_i | |i - t| ≤ c, i ≠ t }',
    dimensionBadge: 'Window Radius ±c Words',
    whatHappening:
      'A sliding window of radius c moves across each sentence. For each center target word, the 2c surrounding words are collected as context features.',
    lectureNotes:
      '"Observe how the window slides. Near sentence boundaries, the context window naturally truncates, which is why averaging rather than summing context embeddings is crucial."',
  },
  {
    id: 5,
    title: '5. Training Pair Generation',
    subtitle: 'Supervised dataset creation from self-supervised corpus',
    formula: 'Dataset D = { (Context_k, Target_k) }',
    dimensionBadge: 'N Training Examples',
    whatHappening:
      'Word2Vec is a self-supervised formulation: no human annotation is required because the context acts as input features and the center word acts as the ground-truth label.',
    lectureNotes:
      '"This self-supervised trick is what allowed Word2Vec to scale to billions of words on the web without manual human labeling."',
  },
  {
    id: 6,
    title: '6. One-Hot Representation & The Orthogonality Problem',
    subtitle: 'Why discrete sparse encodings fail to capture semantics',
    formula: 'x_i · x_j = 0  (∀ i ≠ j),  ||x_i - x_j||_2 = √2',
    dimensionBadge: 'Sparse Vectors x ∈ {0, 1}^|V|',
    whatHappening:
      'Each input word is represented as a sparse vector with a 1 at its vocabulary index and 0 elsewhere. Because every pair is orthogonal, one-hot vectors have zero cosine similarity.',
    lectureNotes:
      '"In one-hot space, cat and dog are just as distant as cat and refrigerator. Word2Vec projects this sparse basis into a continuous semantic manifold."',
  },
  {
    id: 7,
    title: '7. Embedding Layer Lookup',
    subtitle: 'Continuous input projection matrix E ∈ ℝ^(|V| × D)',
    formula: 'v_c = E^T x_c ≡ E[c, :] ∈ ℝ^D',
    dimensionBadge: 'Input Weights E ∈ ℝ^(|V| × D)',
    whatHappening:
      'Multiplying a matrix by a one-hot vector is algebraically identical to retrieving that word’s row in matrix E. This row contains the continuous D-dimensional vector representation.',
    lectureNotes:
      '"Emphasize the implementation efficiency: instead of calculating E^T x_c with matrix multiplications, modern NLP libraries implement this as an O(1) row index lookup."',
  },
  {
    id: 8,
    title: '8. Context Embedding Aggregation (Bag of Words)',
    subtitle: 'Collapsing variable context lengths into a unified hidden vector h',
    formula: 'h = (1 / C) Σ_{i=1}^C v_{c_i} ∈ ℝ^D',
    dimensionBadge: 'Hidden Representation h ∈ ℝ^D',
    whatHappening:
      'CBOW sums or averages the retrieved context vectors. This operation is permutation-invariant—hence Continuous "Bag of Words"—discarding syntactic word order in favor of semantic topic mixture.',
    lectureNotes:
      '"Notice that Word2Vec CBOW has NO non-linear activation at the hidden layer! It is a linear projection layer, making training orders of magnitude faster than earlier feedforward neural language models like Bengio et al. (2003)."',
  },
  {
    id: 9,
    title: '9. Neural Architecture & Absence of Hidden Non-Linearity',
    subtitle: 'Forward pass from input context to output logits',
    formula: 'u = W^T h + b ∈ ℝ^|V|',
    dimensionBadge: 'Output Weights W ∈ ℝ^(D × |V|)',
    whatHappening:
      'The hidden vector h is projected through output matrix W to produce unnormalized score logits u for every word in the vocabulary.',
    lectureNotes:
      '"Each column of W represents an output embedding for that candidate word. The dot product w_j^T h measures how compatible candidate word j is with the aggregated context."',
  },
  {
    id: 10,
    title: '10. Softmax Categorical Probability Distribution',
    subtitle: 'Exponentiating and normalizing logits into valid probabilities',
    formula: 'P(w_i | Context) = ŷ_i = exp(u_i) / Σ exp(u_j)',
    dimensionBadge: 'Categorical Distribution ŷ ∈ [0, 1]^|V|',
    whatHappening:
      'Softmax maps the real-valued logits u onto a valid probability simplex where all probabilities are strictly positive and sum to 1.',
    lectureNotes:
      '"Explain why Softmax is used: it amplifies high-scoring candidates exponentially and normalizes across the full vocabulary, enabling maximum likelihood estimation."',
  },
  {
    id: 11,
    title: '11. Categorical Cross-Entropy Loss',
    subtitle: 'Penalizing error relative to the true target word',
    formula: 'L = -Σ y_i log(ŷ_i) = -log(ŷ_{target})',
    dimensionBadge: 'Scalar Loss L ≥ 0',
    whatHappening:
      'The objective maximizes the log probability of the true target word, which is mathematically identical to minimizing negative log-likelihood.',
    lectureNotes:
      '"Show what happens when the model is confident vs wrong. If the target probability is 0.01, loss explodes to 4.6, triggering large corrective weight updates."',
  },
  {
    id: 12,
    title: '12. Analytic Backpropagation & Error Signal',
    subtitle: 'Exact gradient derivation through chain rule',
    formula: 'e = ŷ - y,   ∂L/∂W = h e^T,   ∂L/∂h = W e',
    dimensionBadge: 'Error Vector e ∈ ℝ^|V|',
    whatHappening:
      'The combined derivative of cross-entropy loss with softmax produces an exceptionally clean error signal: predicted probability minus target indicator (1 for target, 0 elsewhere).',
    lectureNotes:
      '"Point out the mathematical elegance: ∂L/∂u = ŷ - y. The gradient is simply the prediction error! Positive error reduces weights; negative error increases weights for the target."',
  },
  {
    id: 13,
    title: '13. Stochastic Gradient Descent Parameter Updates',
    subtitle: 'Updating both input and output embedding matrices',
    formula: 'W := W - η (h e^T),   E[c, :] := E[c, :] - η (1/C W e)',
    dimensionBadge: 'Learning Rate η',
    whatHappening:
      'Gradient descent shifts both matrix E and matrix W. The context words in E are pulled closer to the target word representation in W.',
    lectureNotes:
      '"This is how embeddings learn: each training step nudges the context word rows in E and the target word column in W into closer alignment."',
  },
  {
    id: 14,
    title: '14. Multi-Epoch Training Loop & Convergence',
    subtitle: 'Repeated optimization over the corpus dataset',
    formula: 'L_epoch = (1 / N) Σ L_k → min',
    dimensionBadge: 'Epoch Iterations 1 .. E',
    whatHappening:
      'As training iterates through epochs, the average cross-entropy loss steadily declines as the model learns to anticipate target words from their surrounding contexts.',
    lectureNotes:
      '"Demonstrate the live loss curve. The descent validates that our in-browser SGD optimizer is driving actual learning on the given text."',
  },
  {
    id: 15,
    title: '15. Learned Embedding Space Geometry',
    subtitle: 'Emergence of continuous semantic clustering in 2D/3D',
    formula: 'cos(A, B) = (A · B) / (||A|| ||B||)',
    dimensionBadge: 'Semantic Manifold in ℝ^D',
    whatHappening:
      'Words that appear in interchangeable contexts (like "cat" and "dog") converge to adjacent coordinates in vector space, verified by high cosine similarity.',
    lectureNotes:
      '"Conclude by testing cosine similarity between words. Even on our compact educational corpus, words sharing identical context structures exhibit higher similarity scores."',
  },
];

interface ProfessorModeProps {
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onClose: () => void;
  model: CBOWModel;
  sentences: TokenizedSentence[];
  pairs: TrainingPair[];
  currentPairIndex: number;
  onSelectPairIndex: (index: number) => void;
  stepState: StepCalculationState;
  embeddingPoints: WordEmbeddingPoint[];
  selectedWord: string | null;
  onSelectWord: (word: string) => void;
  onModelUpdated: () => void;
  speed: 'slow' | 'normal' | 'fast';
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
}

export const ProfessorMode: React.FC<ProfessorModeProps> = ({
  currentSlideIndex,
  onSelectSlide,
  onClose,
  model,
  sentences,
  pairs,
  currentPairIndex,
  onSelectPairIndex,
  stepState,
  embeddingPoints,
  selectedWord,
  onSelectWord,
  onModelUpdated,
  speed,
  onSpeedChange,
}) => {
  const currentSlide = PROFESSOR_SLIDES[currentSlideIndex] || PROFESSOR_SLIDES[0];
  const totalSlides = PROFESSOR_SLIDES.length;

  const currentPair = pairs[currentPairIndex] || pairs[0];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSlideIndex < totalSlides - 1) {
        onSelectSlide(currentSlideIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentSlideIndex > 0) {
        onSelectSlide(currentSlideIndex - 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, totalSlides, onSelectSlide, onClose]);

  // Render matching visual component for the active slide
  const renderSlideVisualization = () => {
    switch (currentSlide.id) {
      case 1:
        return (
          <div className="p-8 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-6">
            <h4 className="text-xl font-bold text-cyan-300">
              The CBOW Word2Vec Pipeline Flow
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-mono">
              <span className="px-3 py-2 rounded-xl bg-teal-950 border border-teal-700 text-teal-300">
                Context Words
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-3 py-2 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-300">
                Embedding Lookup E
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-3 py-2 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-300">
                Average Pool h
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-3 py-2 rounded-xl bg-purple-950 border border-purple-700 text-purple-300">
                Output Matrix W
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-3 py-2 rounded-xl bg-amber-950 border border-amber-700 text-amber-300">
                Softmax Target ŷ
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-xl mx-auto leading-relaxed">
              Use the "Next &rarr;" button to step through each mathematical operation in real-time.
            </p>
          </div>
        );
      case 2:
        return <TokenizationView sentences={sentences} vocab={model.vocab} onWordClick={onSelectWord} />;
      case 3:
        return <VocabularyTable vocab={model.vocab} selectedWord={selectedWord} onSelectWord={onSelectWord} />;
      case 4:
      case 5:
        return (
          <ContextWindowView
            pairs={pairs}
            currentPairIndex={currentPairIndex}
            onSelectPairIndex={onSelectPairIndex}
            windowSize={model.config.windowSize}
          />
        );
      case 6:
        return <OneHotView currentPair={currentPair} vocab={model.vocab} />;
      case 7:
        return (
          <EmbeddingLayerView
            E={model.E}
            currentPair={currentPair}
            vocab={model.vocab}
            embeddingDim={model.D}
          />
        );
      case 8:
        return (
          <ContextAggregationView
            contextEmbeddings={stepState.forward.contextEmbeddings}
            hiddenVector={stepState.forward.hiddenVector}
            currentPair={currentPair}
            aggregation={model.config.aggregation}
            onToggleAggregation={() => {}}
            embeddingDim={model.D}
          />
        );
      case 9:
        return (
          <NeuralNetworkGraph
            forward={stepState.forward}
            backward={stepState.backward}
            currentPair={currentPair}
            vocab={model.vocab}
            embeddingDim={model.D}
            isBackwardMode={false}
          />
        );
      case 10:
        return <OutputSoftmaxView forward={stepState.forward} currentPair={currentPair} vocab={model.vocab} />;
      case 11:
        return <LossView forward={stepState.forward} currentPair={currentPair} />;
      case 12:
        return (
          <div className="space-y-6">
            <NeuralNetworkGraph
              forward={stepState.forward}
              backward={stepState.backward}
              currentPair={currentPair}
              vocab={model.vocab}
              embeddingDim={model.D}
              isBackwardMode={true}
            />
            <BackpropagationView
              forward={stepState.forward}
              backward={stepState.backward}
              currentPair={currentPair}
              vocab={model.vocab}
              embeddingDim={model.D}
              aggregation={model.config.aggregation}
            />
          </div>
        );
      case 13:
        return (
          <BackpropagationView
            forward={stepState.forward}
            backward={stepState.backward}
            currentPair={currentPair}
            vocab={model.vocab}
            embeddingDim={model.D}
            aggregation={model.config.aggregation}
          />
        );
      case 14:
        return (
          <WeightUpdateView
            stepState={stepState}
            currentPair={currentPair}
            vocab={model.vocab}
            learningRate={model.config.learningRate}
            embeddingDim={model.D}
          />
        );
      case 15:
        return (
          <div className="space-y-6">
            <TrainingDashboard
              model={model}
              pairs={pairs}
              onModelUpdated={onModelUpdated}
              speed={speed}
              onSpeedChange={onSpeedChange}
            />
            <EmbeddingPlot
              embeddingPoints={embeddingPoints}
              selectedWord={selectedWord}
              onSelectWord={onSelectWord}
              embeddingDim={model.D}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070b14] overflow-y-auto flex flex-col">
      {/* Top Presentation Bar */}
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Professor Presentation Mode
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                Slide {currentSlideIndex + 1} of {totalSlides}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-200">
              {currentSlide.title}
            </h2>
          </div>
        </div>

        {/* Slide Controls & Exit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => onSelectSlide(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button
              onClick={() => onSelectSlide(Math.min(totalSlides - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === totalSlides - 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Exit Professor Mode (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Presentation Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Slide Header Card with Formula & Dimensions */}
        <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60 inline-block mb-2">
                ACADEMIC MODULE {currentSlideIndex + 1}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                {currentSlide.title}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Formula & Dimensions Badges */}
            <div className="flex flex-col sm:items-end gap-2">
              <div className="px-4 py-2 rounded-xl bg-slate-900 border border-purple-800/40 text-purple-200 font-mono text-sm font-bold shadow-sm">
                {currentSlide.formula}
              </div>
              <span className="px-3 py-1 rounded-lg bg-slate-900/80 text-slate-400 text-xs font-mono border border-slate-800">
                {currentSlide.dimensionBadge}
              </span>
            </div>
          </div>

          {/* Academic "What is Happening?" & Lecture Notes Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-900/40 text-xs text-slate-300 space-y-1">
              <span className="text-cyan-400 font-bold uppercase tracking-wider block text-[10px]">
                Algorithm Mechanics: What is happening?
              </span>
              <p className="leading-relaxed text-slate-300">{currentSlide.whatHappening}</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-900/40 text-xs text-slate-300 space-y-1">
              <span className="text-purple-400 font-bold uppercase tracking-wider block text-[10px]">
                Professor Talking Points: How to present this
              </span>
              <p className="leading-relaxed text-purple-200/90 italic">{currentSlide.lectureNotes}</p>
            </div>
          </div>
        </div>

        {/* Embedded Live Visualization Component */}
        <div className="w-full">
          {renderSlideVisualization()}
        </div>

        {/* Bottom Slide Quick-Jump Track */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {PROFESSOR_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => onSelectSlide(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition ${
                  currentSlideIndex === idx
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
                title={slide.title}
              >
                {slide.id}
              </button>
            ))}
          </div>

          <div className="hidden sm:block font-mono text-[11px]">
            Use &larr; / &rarr; arrow keys to navigate slides &bull; Esc to exit
          </div>
        </div>
      </div>
    </div>
  );
};
