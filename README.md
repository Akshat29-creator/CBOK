# CBOK — Continuous Bag of Words (Word2Vec) Interactive Studio

An interactive, educational web application and mathematical simulator for the **Continuous Bag of Words (CBOW) Word2Vec algorithm**.

Designed for college-level Machine Learning and Natural Language Processing demonstrations, this tool visualizes the complete step-by-step tensor pipeline of CBOW from raw text to learned embeddings.

---

## 🌟 Key Features

### 1. 15-Stage Pipeline Studio
Walk through every stage of CBOW with genuine, real-time mathematical calculations:
- **Phase 1: Dataset & Encoding**
  - **Stage 1**: Tokenization & Lexical Segmentation
  - **Stage 2**: Vocabulary Construction & Frequency Counting
  - **Stage 3**: Sliding Context Window Formulation
  - **Stage 4**: Supervised Training Pairs Generation
  - **Stage 5**: Sparse One-Hot Vector Encoding ($\mathbf{x}_c \in \{0, 1\}^{|V|}$)
- **Phase 2: Forward Inference**
  - **Stage 6**: Embedding Matrix Row Lookup ($\mathbf{v}_c = \mathbf{E}^\top \mathbf{x}_c$)
  - **Stage 7**: Context Vector Aggregation ($\mathbf{h} = \frac{1}{C} \sum \mathbf{v}_c$)
  - **Stage 8**: Neural Signal Flow & Computational Graph Architecture
  - **Stage 9**: Output Projection Logits ($\mathbf{u} = \mathbf{W}^\top \mathbf{h} + \mathbf{b}$)
  - **Stage 10**: Softmax Normalization ($\hat{\mathbf{y}} = \text{softmax}(\mathbf{u})$)
- **Phase 3: Backpropagation & Optimization**
  - **Stage 11**: Categorical Cross-Entropy Loss ($L = -\ln P(y \mid \text{context})$) with interactive penalty curve
  - **Stage 12**: Output Error Flow ($\mathbf{e} = \hat{\mathbf{y}} - \mathbf{y}$)
  - **Stage 13**: Parameter Gradients ($\nabla_{\mathbf{W}} L = \mathbf{h} \mathbf{e}^\top$, $\nabla_{\mathbf{v}_c} L = \frac{1}{C} \mathbf{W} \mathbf{e}$)
  - **Stage 14**: Stochastic Gradient Descent Weight Updates
  - **Stage 15**: Live Epoch Trainer with Real-Time Loss Curves

### 2. Real-Time 2D Vector Space (PCA Projector)
- Interactive 2D projection of learned high-dimensional embeddings using Principal Component Analysis (PCA).
- Non-colliding dynamic label leaders with cosine neighbor rays.
- Real-time vector component inspector and nearest context neighbor queries.

### 3. Live SGD Trainer
- In-browser gradient descent training loop with customizable learning rates ($\eta$), epochs, and context window radiuses.
- Live animated convergence loss curve.

### 4. Interactive Cosine Similarity Matrix
- Full pairwise heatmap explorer: $\cos(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}$.

### 5. Professor Presentation Keynote Mode
- Fullscreen classroom slide deck with embedded live interactive diagrams and mathematical proofs.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Akshat29-creator/CBOK.git

# Navigate into project directory
cd CBOK

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Vanilla CSS Design Tokens
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Viz**: Recharts & Custom Interactive SVG Computations

---

## 📜 Mathematical Foundations

CBOW learns dense vector representations by optimizing the conditional log likelihood:

$$\max \sum_{t} \log P(w_t \mid w_{t-c}, \dots, w_{t+c})$$

Where:
- $\mathbf{h} = \frac{1}{2c} \sum_{-c \le j \le c, j \ne 0} \mathbf{v}_{w_{t+j}}$
- $P(w_i \mid \text{Context}) = \frac{\exp(\mathbf{w}_i^\top \mathbf{h})}{\sum_{j=1}^{|V|} \exp(\mathbf{w}_j^\top \mathbf{h})}$

---

## 📄 License
MIT License.
