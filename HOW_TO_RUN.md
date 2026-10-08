# 🚀 How to Run This Project (Quick Guide)

A short, simple guide to get the **CBOW Word2Vec Studio** running on any machine in under 2 minutes.

---

## 📋 1. Prerequisites

Make sure you have **Node.js** installed on your computer:
- **Node.js version:** `18.0.0` or higher (recommended: Node.js 20 LTS or newer)
- Check if it's installed by running in your terminal:
  ```bash
  node -v
  npm -v
  ```
  *(If you don't have it, download and install it from [nodejs.org](https://nodejs.org/))*

---

## ⚡ 2. Quick Setup & Run (3 Steps)

### Step 1: Open Terminal in Project Folder
Open your terminal (PowerShell, Command Prompt, or Bash) and navigate to the project root:
```bash
cd CBOK
```

### Step 2: Install Dependencies
Run the install command once to download packages:
```bash
npm install
```

### Step 3: Start the Development Server
Launch the app locally:
```bash
npm run dev
```

---

## 🌐 3. Open in Browser

Once the terminal says `Ready in ...`, open your browser and go to:

👉 **[http://localhost:3000](http://localhost:3000)**

*(If port 3000 is occupied, Next.js will automatically use port 3001: `http://localhost:3001`)*

---

## 🧭 4. Quick Tour of What to Explore

Once the app opens, click through the tabs in the top navigation bar:

1. **Pipeline Studio (Default):**
   - Step through the **15 stages** of CBOW from raw text tokenization to forward pass, loss computation, and backpropagation.
   - Click **Run** to animate the steps automatically, or use **`<` / `>`** to step manually.
   - Switch between **Phase 1 (Dataset)**, **Phase 2 (Forward)**, and **Phase 3 (Backprop)** in the top ribbon.
   - In **Stage 8 (Neural Architecture)**, click **"Switch to Backpropagation"** to watch reverse gradient wave animations!

2. **Live Trainer:**
   - Click **"Start Training"** or **"Epoch +1"** to watch the neural network learn in real-time.
   - See the cross-entropy loss curve drop smoothly across 100 epochs.

3. **2D Vector Space:**
   - An interactive 2D PCA projector showing word embeddings clustering semantically.
   - Click any word node to inspect its learned coordinates and nearest context neighbors.

4. **Cosine Similarity:**
   - Interactive matrix showing pairwise similarity angles and dot products between words.

5. **Professor Mode (Keynote):**
   - Click the purple **"Professor Mode"** button in the header for a fullscreen presentation slide deck with live interactive visualizers.

6. **Params (Custom Corpus):**
   - Click **"Params"** in the top header to change the training text, context window ($\pm 1, \pm 2, \pm 3$), embedding dimensions ($D=2, 3, 5, 8$), or learning rate.

---

## ⌨️ Useful Keyboard Shortcuts

- **`Spacebar`**: Run / Pause the pipeline animation
- **`Right Arrow`**: Next stage / slide
- **`Left Arrow`**: Previous stage / slide
- **`R`**: Reset model weights & stage
- **`P`**: Toggle Professor Mode

---

## 🔧 Troubleshooting

- **Port already in use?**
  Run on a different port:
  ```bash
  npm run dev -- -p 3005
  ```
- **Need a fresh install?**
  Delete `node_modules` and re-run:
  ```bash
  npm install
  npm run dev
  ```

---
*Created for college-level Machine Learning & NLP demonstrations.*
