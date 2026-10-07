'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CBOWConfig, StepCalculationState, TrainingPair } from '../lib/cbow/types';
import { tokenizeCorpus } from '../lib/cbow/tokenizer';
import { Vocabulary } from '../lib/cbow/vocabulary';
import { generateTrainingPairs } from '../lib/cbow/dataset';
import { CBOWModel } from '../lib/cbow/model';
import { CORPUS_PRESETS } from '../lib/cbow/demo-corpora';

// Components
import { Header } from '../components/Header';
import { StudioCommandBar } from '../components/StudioCommandBar';
import { CorpusModal } from '../components/CorpusModal';
import { ConceptOverview } from '../components/ConceptOverview';
import { PIPELINE_STEPS } from '../components/PipelineStepper';
import { TokenizationView } from '../components/TokenizationView';
import { VocabularyTable } from '../components/VocabularyTable';
import { ContextWindowView } from '../components/ContextWindowView';
import { OneHotView } from '../components/OneHotView';
import { EmbeddingLayerView } from '../components/EmbeddingLayerView';
import { ContextAggregationView } from '../components/ContextAggregationView';
import { NeuralNetworkGraph } from '../components/NeuralNetworkGraph';
import { OutputSoftmaxView } from '../components/OutputSoftmaxView';
import { LossView } from '../components/LossView';
import { BackpropagationView } from '../components/BackpropagationView';
import { WeightUpdateView } from '../components/WeightUpdateView';
import { TrainingDashboard } from '../components/TrainingDashboard';
import { EmbeddingPlot } from '../components/EmbeddingPlot';
import { CosineSimilarityExplorer } from '../components/CosineSimilarityExplorer';
import { ProfessorMode } from '../components/ProfessorMode';
import { MathPanel } from '../components/MathPanel';
import { ModelInspector } from '../components/ModelInspector';

import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  BookOpen,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function CBOWVisualizerPage() {
  // 1. Corpus & Hyperparameters State
  const [corpusText, setCorpusText] = useState<string>(CORPUS_PRESETS[0].text);
  const [config, setConfig] = useState<CBOWConfig>({
    windowSize: 2,
    embeddingDim: 5,
    learningRate: 0.05,
    epochs: 50,
    aggregation: 'average',
    seed: 42,
  });

  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  // 2. Navigation & Presentation State
  const [activeTab, setActiveTab] = useState<'pipeline' | 'training' | 'embeddings' | 'similarity'>('pipeline');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentPairIndex, setCurrentPairIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isProfessorMode, setIsProfessorMode] = useState<boolean>(false);
  const [professorSlideIndex, setProfessorSlideIndex] = useState<number>(0);

  // 3. Modals & Highlight State
  const [isCorpusModalOpen, setIsCorpusModalOpen] = useState<boolean>(false);
  const [showTheoryGuide, setShowTheoryGuide] = useState<boolean>(false);
  const [isMathOpen, setIsMathOpen] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // Model Revision counter to trigger re-renders on weight updates
  const [modelRevision, setModelRevision] = useState<number>(0);

  // 4. Tokenization & Vocabulary
  const { sentences, allTokens } = useMemo(() => {
    return tokenizeCorpus(corpusText);
  }, [corpusText]);

  const vocab = useMemo(() => {
    return new Vocabulary(allTokens);
  }, [allTokens]);

  // Active corpus preset name
  const currentPresetName = useMemo(() => {
    return CORPUS_PRESETS.find((p) => p.text === corpusText)?.name || 'Custom Corpus';
  }, [corpusText]);

  // 5. Training Pairs
  const pairs = useMemo(() => {
    return generateTrainingPairs(sentences, vocab, config.windowSize);
  }, [sentences, vocab, config.windowSize]);

  // Clamp current pair index
  useEffect(() => {
    if (currentPairIndex >= pairs.length && pairs.length > 0) {
      setCurrentPairIndex(0);
    }
  }, [pairs.length, currentPairIndex]);

  // 6. Initialize / Maintain CBOW Model
  const model = useMemo(() => {
    return new CBOWModel(vocab, config);
  }, [vocab, config]);

  // Current active pair
  const currentPair: TrainingPair | undefined = pairs[currentPairIndex] || pairs[0];

  // 7. Calculate Step State
  const stepState: StepCalculationState = useMemo(() => {
    if (!currentPair) {
      const emptyForward = {
        contextIds: [],
        targetId: 0,
        contextEmbeddings: [],
        hiddenVector: new Array(config.embeddingDim).fill(0),
        logits: new Array(vocab.size).fill(0),
        probabilities: new Array(vocab.size).fill(0),
        predictedId: 0,
        predictedWord: '',
        loss: 0,
      };
      const emptyBackward = {
        errorVector: new Array(vocab.size).fill(0),
        gradW: Array.from({ length: config.embeddingDim }, () => new Array(vocab.size).fill(0)),
        gradB: new Array(vocab.size).fill(0),
        gradH: new Array(config.embeddingDim).fill(0),
        gradContextEmbeddings: [],
      };
      return {
        currentPairIndex: 0,
        forward: emptyForward,
        backward: emptyBackward,
        weightsBefore: model.cloneWeights(),
        weightsAfter: model.cloneWeights(),
      };
    }

    const weightsBefore = model.cloneWeights();
    const forward = model.forward(currentPair.contextIds, currentPair.targetId);
    const backward = model.backward(forward, currentPair.targetId);

    return {
      currentPairIndex,
      forward,
      backward,
      weightsBefore,
      weightsAfter: weightsBefore,
    };
  }, [model, currentPair, currentPairIndex, config.embeddingDim, vocab.size, modelRevision]);

  // 8. 2D PCA Embeddings
  const embeddingPoints = useMemo(() => {
    return model.getEmbeddingPlotData();
  }, [model, modelRevision]);

  // Handler for model update callback
  const handleModelUpdated = useCallback(() => {
    setModelRevision((rev) => rev + 1);
  }, []);

  // Handler to advance single step
  const handleStepForward = useCallback(() => {
    if (currentStep < PIPELINE_STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Loop to next pair and reset to forward steps
      setCurrentPairIndex((prev) => (prev + 1) % Math.max(1, pairs.length));
      setCurrentStep(6);
    }
  }, [currentStep, pairs.length]);

  const handleStepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  // Reset Model & Training
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(1);
    setCurrentPairIndex(0);
    model.initWeights();
    handleModelUpdated();
  }, [model, handleModelUpdated]);

  const handleResetSeed = useCallback(() => {
    model.initWeights();
    handleModelUpdated();
  }, [model, handleModelUpdated]);

  // Automated Step Player
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPlaying) {
      const delay = speed === 'slow' ? 1800 : speed === 'normal' ? 900 : 400;
      intervalId = setInterval(() => {
        handleStepForward();
      }, delay);
    }

    return () => clearInterval(intervalId);
  }, [isPlaying, speed, handleStepForward]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStepBackward();
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key.toLowerCase() === 'r') {
        handleReset();
      } else if (e.key.toLowerCase() === 'p') {
        setIsProfessorMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStepForward, handleStepBackward, handleReset]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased lab-grid">
      {/* Executive Studio Header */}
      <Header
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onReset={handleReset}
        isProfessorMode={isProfessorMode}
        onToggleProfessorMode={() => setIsProfessorMode(!isProfessorMode)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMath={() => setIsMathOpen(true)}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenCorpusSettings={() => setIsCorpusModalOpen(true)}
        stepNumber={currentStep}
        totalSteps={PIPELINE_STEPS.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-5">
        {/* Error Guard for Corpus with Too Few Words */}
        {vocab.size < 3 ? (
          <div className="lab-card rounded-2xl p-8 text-center my-8 border border-rose-900/60 bg-rose-950/20">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-rose-300">Corpus Contains Too Few Unique Words</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Please enter at least 3 distinct vocabulary words with multiple sentences to construct context windows and calculate CBOW gradients.
            </p>
          </div>
        ) : (
          <>
            {/* VIEW 1: Step-by-Step Pipeline Visualizer */}
            {activeTab === 'pipeline' && (
              <div className="space-y-4">
                {/* Unified Studio Command Rail */}
                <StudioCommandBar
                  currentStep={currentStep}
                  onSelectStep={(stepId) => setCurrentStep(stepId)}
                  currentPairIndex={currentPairIndex}
                  onSelectPairIndex={(idx) => setCurrentPairIndex(idx)}
                  pairs={pairs}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  onStepForward={handleStepForward}
                  onStepBackward={handleStepBackward}
                  onReset={handleReset}
                  onOpenSettings={() => setIsCorpusModalOpen(true)}
                  corpusName={currentPresetName}
                  vocabSize={vocab.size}
                  embeddingDim={config.embeddingDim}
                  windowSize={config.windowSize}
                  showTheoryGuide={showTheoryGuide}
                  onToggleTheoryGuide={() => setShowTheoryGuide(!showTheoryGuide)}
                />

                {/* Collapsible Architecture Primer */}
                {showTheoryGuide && <ConceptOverview />}

                {/* Stage Component */}
                <div className="transition-all duration-300">
                  {currentStep === 1 && (
                    <TokenizationView
                      sentences={sentences}
                      vocab={vocab}
                      onWordClick={(w) => setSelectedWord(w)}
                    />
                  )}

                  {currentStep === 2 && (
                    <VocabularyTable
                      vocab={vocab}
                      selectedWord={selectedWord}
                      onSelectWord={(w) => setSelectedWord(w)}
                    />
                  )}

                  {(currentStep === 3 || currentStep === 4) && (
                    <ContextWindowView
                      pairs={pairs}
                      currentPairIndex={currentPairIndex}
                      onSelectPairIndex={(idx) => setCurrentPairIndex(idx)}
                      windowSize={config.windowSize}
                    />
                  )}

                  {currentStep === 5 && currentPair && (
                    <OneHotView currentPair={currentPair} vocab={vocab} />
                  )}

                  {currentStep === 6 && currentPair && (
                    <EmbeddingLayerView
                      E={model.E}
                      currentPair={currentPair}
                      vocab={vocab}
                      embeddingDim={config.embeddingDim}
                    />
                  )}

                  {currentStep === 7 && currentPair && (
                    <ContextAggregationView
                      contextEmbeddings={stepState.forward.contextEmbeddings}
                      hiddenVector={stepState.forward.hiddenVector}
                      currentPair={currentPair}
                      aggregation={config.aggregation}
                      onToggleAggregation={(m) => {
                        setConfig((prev) => ({ ...prev, aggregation: m }));
                        handleModelUpdated();
                      }}
                      embeddingDim={config.embeddingDim}
                    />
                  )}

                  {currentStep === 8 && currentPair && (
                    <NeuralNetworkGraph
                      forward={stepState.forward}
                      backward={stepState.backward}
                      currentPair={currentPair}
                      vocab={vocab}
                      embeddingDim={config.embeddingDim}
                      isBackwardMode={false}
                    />
                  )}

                  {(currentStep === 9 || currentStep === 10) && currentPair && (
                    <OutputSoftmaxView
                      forward={stepState.forward}
                      currentPair={currentPair}
                      vocab={vocab}
                    />
                  )}

                  {currentStep === 11 && currentPair && (
                    <LossView
                      forward={stepState.forward}
                      currentPair={currentPair}
                    />
                  )}

                  {currentStep === 12 && currentPair && (
                    <div className="space-y-6">
                      <NeuralNetworkGraph
                        forward={stepState.forward}
                        backward={stepState.backward}
                        currentPair={currentPair}
                        vocab={vocab}
                        embeddingDim={config.embeddingDim}
                        isBackwardMode={true}
                      />
                      <BackpropagationView
                        forward={stepState.forward}
                        backward={stepState.backward}
                        currentPair={currentPair}
                        vocab={vocab}
                        embeddingDim={config.embeddingDim}
                        aggregation={config.aggregation}
                      />
                    </div>
                  )}

                  {currentStep === 13 && currentPair && (
                    <BackpropagationView
                      forward={stepState.forward}
                      backward={stepState.backward}
                      currentPair={currentPair}
                      vocab={vocab}
                      embeddingDim={config.embeddingDim}
                      aggregation={config.aggregation}
                    />
                  )}

                  {currentStep === 14 && currentPair && (
                    <WeightUpdateView
                      stepState={stepState}
                      currentPair={currentPair}
                      vocab={vocab}
                      learningRate={config.learningRate}
                      embeddingDim={config.embeddingDim}
                    />
                  )}

                  {currentStep === 15 && (
                    <TrainingDashboard
                      model={model}
                      pairs={pairs}
                      onModelUpdated={handleModelUpdated}
                      speed={speed}
                      onSpeedChange={setSpeed}
                    />
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: Real-time Training Lab */}
            {activeTab === 'training' && (
              <TrainingDashboard
                model={model}
                pairs={pairs}
                onModelUpdated={handleModelUpdated}
                speed={speed}
                onSpeedChange={setSpeed}
              />
            )}

            {/* VIEW 3: 2D Projected Embeddings */}
            {activeTab === 'embeddings' && (
              <EmbeddingPlot
                embeddingPoints={embeddingPoints}
                selectedWord={selectedWord}
                onSelectWord={(w) => setSelectedWord(w)}
                embeddingDim={config.embeddingDim}
              />
            )}

            {/* VIEW 4: Cosine Similarity Explorer */}
            {activeTab === 'similarity' && (
              <CosineSimilarityExplorer
                E={model.E}
                vocab={vocab}
                embeddingDim={config.embeddingDim}
              />
            )}
          </>
        )}
      </main>

      {/* Slide-Over Corpus & Hyperparameters Modal */}
      <CorpusModal
        isOpen={isCorpusModalOpen}
        onClose={() => setIsCorpusModalOpen(false)}
        corpusText={corpusText}
        onCorpusChange={setCorpusText}
        config={config}
        onConfigChange={(newCfg) => {
          setConfig(newCfg);
          handleModelUpdated();
        }}
        tokenCount={allTokens.length}
        vocabSize={vocab.size}
        pairCount={pairs.length}
        onResetSeed={handleResetSeed}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      {/* Professor Fullscreen Presentation Mode */}
      {isProfessorMode && (
        <ProfessorMode
          currentSlideIndex={professorSlideIndex}
          onSelectSlide={setProfessorSlideIndex}
          onClose={() => setIsProfessorMode(false)}
          model={model}
          sentences={sentences}
          pairs={pairs}
          currentPairIndex={currentPairIndex}
          onSelectPairIndex={setCurrentPairIndex}
          stepState={stepState}
          embeddingPoints={embeddingPoints}
          selectedWord={selectedWord}
          onSelectWord={setSelectedWord}
          onModelUpdated={handleModelUpdated}
          speed={speed}
          onSpeedChange={setSpeed}
        />
      )}

      {/* Mathematical Reference Modal */}
      <MathPanel
        isOpen={isMathOpen}
        onClose={() => setIsMathOpen(false)}
        vocabSize={vocab.size}
        embeddingDim={config.embeddingDim}
        windowSize={config.windowSize}
      />

      {/* Model Diagnostic Tensor Inspector */}
      <ModelInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        model={model}
        stepState={stepState}
        currentPair={currentPair || pairs[0]}
      />
    </div>
  );
}
