# MemoryLab — Interactive Recurrent Memory Explorer

MemoryLab is a small, deterministic browser-based educational artifact for the **DataForge 2026 / Pathway Track**. It teaches one falsifiable claim through a live toy system rather than a static explanation.

## Core claim

> A fixed-size recurrent state can process a sequence of unbounded duration without allocating a new memory slot for every token, but it can still forget through interference.

## What is actually running?

The browser runs an independent fixed-size **associative recurrent memory**. Each memory write:

1. applies configurable state decay;
2. hashes a concept into a deterministic key vector;
3. hashes its answer into a deterministic value vector;
4. performs a rank-1 update `M ← (1-d)M + α k vᵀ`;
5. keeps `M` at a fixed `D × D` size regardless of the number of facts.

A recall computes `kᵀM` and compares the resulting state against known value vectors using cosine similarity. A conflicting write intentionally creates interference. Prediction and ground truth are displayed side by side.

**This is a teaching simulator, not an official BDH implementation.**

## Run locally

Requires Python 3.9+ (no external packages).

```bash
python server.py
```

Open `http://127.0.0.1:8000`.

Alternatively, because the artifact is static, open `web/index.html` directly in a browser.

## Guided demo

1. Click **Run guided preset**.
2. The matrix changes after every fact.
3. Query `Germany` and observe prediction vs ground truth.
4. Click **Inject conflict**.
5. Query the first concept again and observe possible interference.
6. Move **Memory update strength** and **State decay** and repeat.
7. Increase **State dimension**. The memory footprint changes from `D²`, while the number of processed facts is independent of the state size.

## Research connection

The competition brief asks for a substantive BDH/BDH-CQ module, primary sourcing, an interactive element, visible state, truth beside estimate, and explicit evidence boundaries. MemoryLab uses the toy simulator for the live lesson and separately explains how the idea connects to published BDH and BDH-CQ work.

### Primary sources

1. Kosowski, Uznański, Chorowski, Stamirowska, Bartoszkiewicz. **The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain.** https://arxiv.org/abs/2509.26507
2. Engdahl et al. **BDH-CQ: In-Context Learning with Recurrent Latent Reasoning.** https://arxiv.org/abs/2608.09888
3. Pathway. **The Equations of Reasoning.** https://pathway.com/research/the-equations-of-reasoning
4. Pathway. **Reasoning at a Fraction of the Compute / Introducing BDH-CQ.** https://pathway.com/research/introducing-bdh-cq
5. Pathway. **BDH architecture explainer.** https://pathway.com/research/bdh-explainer/brain-inspired-ai-architecture

## Evidence boundary

- **LIVE:** the MemoryLab simulator, its state matrix, controls, predictions and toy experiments.
- **PUBLISHED:** BDH and BDH-CQ mechanisms described in the cited papers.
- **NOT CLAIMED:** that MemoryLab reproduces BDH/BDH-CQ architecture or benchmark performance.
- **NOT USED:** invented benchmark numbers or an unavailable private checkpoint.

## File structure

```text
MemoryLab_Hackathon/
├── web/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── tests/
│   └── smoke_test.py
├── docs/
│   ├── SOURCES.md
│   └── AI_DISCLOSURE.md
├── server.py
├── README.md
├── LICENSE
├── run.bat
└── run.sh
```

## Deployment

The `web/` directory is a static site. It can be deployed to GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any static host. The Python server is only for local demonstration.

## Reproducibility

The vector generator is deterministic for a given concept/value and dimension. No external API, model download, database, or secret key is required.

## Accessibility / robustness

The app uses semantic headings, labels, keyboard-friendly controls, responsive CSS, and a no-dependency fallback. The core experiment runs fully client-side so network latency does not affect interaction.

## License

MIT — see `LICENSE`.

## AI assistance disclosure

AI assistance was used during development for code drafting, documentation structure and wording. The project team remains responsible for reviewing, testing, understanding and defending the implementation. See `docs/AI_DISCLOSURE.md`.
