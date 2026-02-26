# AI Model Trajectory: What to Build For

*Exploration — January 2026*

## Context

Investigating predictable vs unpredictable aspects of LLM improvement to inform XDS design decisions. Goal: avoid building for current limitations that may disappear, while investing in solutions for fundamental limits that won't.

---

## What's Predictable About Model Improvement

### Scaling Laws Are Real (But Slowing)

Performance improves predictably with compute/data/parameters in proportion. However:
- **Data scarcity** is becoming the bottleneck — high-quality training data is running out
- **Capability density rising** — newer models achieve same performance with fewer parameters
- Focus shifting from scale to efficiency and architecture

Source: [LLM Scaling Laws Analysis 2026](https://research.aimultiple.com/llm-scaling-laws/)

### Emergent Abilities Appear Unpredictably

Certain capabilities "jump" suddenly at scale thresholds:
- Three-digit addition: 8% → 80% accuracy between 13B and 175B parameters
- Chain-of-thought reasoning emerges above certain model sizes
- **Cannot predict when abilities will emerge from smaller models**

Source: [Emergent Abilities in LLMs Survey](https://arxiv.org/html/2503.05788v1)

---

## Fundamental Limits (Won't Improve With Scale)

Research identifies **irreducible limits** that scaling cannot overcome:

| Limit | Why It's Fundamental |
|-------|---------------------|
| **Hallucination** | Mathematically proven — "no computable LLM can be universally correct over open-ended queries" |
| **Effective context** | 128K tokens nominal, but effective context is far shorter due to positional encoding decay |
| **Reasoning degradation** | Models optimize pattern completion, not logical inference |
| **Long-tail knowledge** | Sample complexity scales linearly with fact count — prohibitively expensive |
| **Creativity-factuality tradeoff** | Mechanisms enabling creativity necessarily increase hallucination |

### Key Findings

**Hallucination is mathematically inevitable:**
- Theorem proves any enumerable model class must fail on adversarially constructed inputs
- Undecidable problems force infinite failure sets
- "Hallucination is an intrinsic property of learning systems operating over unbounded, open-ended query spaces"

**Context window is deceptive:**
- Positional under-training: gradient flow to long-range positions is negligible
- Encoding attenuation: dot products vanish for large separations
- Result: effective context scales sub-linearly with nominal window size

**Data pathologies compound problems:**
- Web-scraped text contains 2-3% false claims learned indiscriminately
- 50%+ of time-dependent facts become stale within months
- Benchmark contamination creates "illusions of competence"

Source: [On the Fundamental Limits of LLMs at Scale](https://arxiv.org/html/2511.12869)

---

## Implications for XDS

### Always Build For (Fundamental Limits)

These won't improve, so invest heavily:

| Limit | XDS Design Response |
|-------|---------------------|
| Hallucination persists | Constraints beat suggestions — invalid output should be impossible |
| Effective context limited | Keep API surface small; don't rely on LLM reading extensive docs |
| Pattern completion, not reasoning | Make correct patterns obvious and consistent |
| Long-tail knowledge fails | Don't expect LLM to know XDS conventions — enforce via types |

### Build For Now, Accept May Become Unnecessary

Current weaknesses that may improve:

| Weakness | Likely to Improve? | XDS Response |
|----------|-------------------|--------------|
| First-try accuracy (46-65%) | **Yes** — emergent abilities | Design for iteration, don't assume stays bad |
| API misuse | **Yes** — tool use improving | Typed constraints help now, remain valuable later |
| Following docs/rules | **Uncertain** | Don't rely on it, but don't assume permanent |

### Don't Over-Optimize For (Likely to Improve)

Avoid investing heavily in workarounds for:
- Poor first-try accuracy (will likely improve)
- Inability to follow complex instructions (improving with reasoning models)
- Limited context understanding (architectural innovations ongoing)

---

## The Framework

```
┌─────────────────────────────────────────────────────┐
│  ALWAYS BUILD FOR (fundamental limits)             │
│  • Constraints over suggestions                    │
│  • Small API surface                               │
│  • Type enforcement                                │
│  • Clear error messages                            │
│  • Consistent patterns                             │
├─────────────────────────────────────────────────────┤
│  BUILD FOR NOW, MAY BECOME UNNECESSARY             │
│  • Iteration-friendly design                       │
│  • Explicit over implicit                          │
│  • Reduced prop optionality                        │
├─────────────────────────────────────────────────────┤
│  DON'T OVER-OPTIMIZE FOR (likely to improve)       │
│  • Workarounds for poor reasoning                  │
│  • Dumbing down API for current limitations        │
│  • Assuming models can't follow patterns           │
└─────────────────────────────────────────────────────┘
```

---

## On llms.txt

**Status**: Proposed standard, not implemented by any major AI system.

- John Mueller (Google): "no AI system currently uses llms.txt"
- Server logs show zero visits from AI bots
- Not a viable path for XDS component documentation

**What works instead at scale:**
- Types as documentation (context arrives on import)
- Consistent patterns (learn once, apply everywhere)
- Optional MCP server for on-demand component docs

---

## Open Questions

- How do we measure whether our API design is "AI-friendly"?
- Should we track LLM success rates against XDS components over time?
- At what point do we revisit assumptions as models improve?

---

## Sources

- [LLM Scaling Laws Analysis 2026](https://research.aimultiple.com/llm-scaling-laws/)
- [Emergent Abilities in LLMs Survey](https://arxiv.org/html/2503.05788v1)
- [On the Fundamental Limits of LLMs at Scale](https://arxiv.org/html/2511.12869)
- [Semrush: What Is LLMs.txt](https://www.semrush.com/blog/llms-txt/) — No AI systems currently use it
- [DigitalOcean: Copilot vs Cursor](https://www.digitalocean.com/resources/articles/github-copilot-vs-cursor) — Context handling comparison
