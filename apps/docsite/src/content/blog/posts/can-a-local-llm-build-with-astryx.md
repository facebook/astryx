---
title: 'Can a local LLM build with Astryx?'
description: 'We gave four models running on a laptop the same page to build with Astryx. All four shipped it on the first try — but one had to wait for its runtime to catch up.'
date: '2026-08-11'
type: 'engineering'
authors:
  - 'humbertovirtudes'
tags:
  - 'AI'
  - 'CLI'
  - 'Local models'
relatedDocs:
  - title: 'The Astryx CLI'
    href: '/blog/the-astryx-cli'
  - title: 'Vibe Test'
    href: '/blog/vibe-tests'
---

Most of the AI writing about Astryx assumes a frontier model behind an API. But a lot of people now run models directly on their own machines through [LM Studio](https://lmstudio.ai/) or [Ollama](https://ollama.com/) — no API key, no data leaving the laptop, no per-token bill. So I wanted a concrete answer to a concrete question: can a model running entirely on a MacBook build a real page with Astryx, using the same CLI a person would?

I picked one task and gave it to four local models unchanged. The task was a flower shop landing page — "Petal & Stem" — with a header and cart counter, a hero, a responsive grid of six bouquet cards with badges and prices, an about section, a visit-us card, and a footer. Nothing exotic; exactly the kind of page someone reaches for a design system to build.

You can see what each model produced, live:

- [Nemotron 3 Nano Omni (30B MoE)](https://humbertovirtudes.github.io/astryx-model-bench/nemotron-3-nano-omni/)
- [Qwen 3.6 (27B)](https://humbertovirtudes.github.io/astryx-model-bench/qwen3.6-27b/)
- [Muse Glimmer (28B)](https://humbertovirtudes.github.io/astryx-model-bench/muse-glimmer/)
- [Gemma 4 e4b (7.5B)](https://humbertovirtudes.github.io/astryx-model-bench/gemma-4-e4b/)

Every page above is the model's own output, unedited, built with `@astryxdesign/core@0.3.0` and deployed as a static bundle. The [full benchmark — prompts, per-model metrics, and generated code — is on GitHub](https://github.com/humbertovirtudes/astryx-model-bench).

## The setup

The models never saw hand-written API notes. The prompt was built the way an agent is supposed to discover Astryx: through the CLI. Before writing the task prompt I ran

```bash
npx @astryxdesign/cli build "flower shop landing page with featured bouquet cards"
npx @astryxdesign/cli component Card
npx @astryxdesign/cli component Grid
# ...and so on for Button, Badge, Text, Heading, Link, Divider, Layout
```

and folded that output — real component names, real props, the spacing scale, the "no raw `<div>`, no inline styles" rules — into a single system prompt. That is the whole point of the CLI: the same reference feeds a person and a model.

Each model then ran through a small loop: generate an `App.tsx`, run `vite build`, and if the build failed, hand the error back and let it try again, up to five times. The build is an honest gate — it catches a syntax slip, a bad import, or a component that does not exist, which are exactly the mistakes a model tends to make. I tracked whether the model reached a green build, how many rounds it took, generation speed, and — separately from the build — how well it followed Astryx conventions (any raw `<div>`, inline `style`, or `className` in the output).

## The results

Every model that could load built the page on the **first** attempt. No fix-up rounds needed.

| Model                | Params               | Green build | Speed      | Astryx conventions |
| -------------------- | -------------------- | ----------- | ---------- | ------------------ |
| Nemotron 3 Nano Omni | 30B (3B active, MoE) | 1st try     | 69.4 tok/s | clean              |
| Gemma 4 e4b          | 7.5B                 | 1st try     | 65.8 tok/s | 3 slips            |
| Muse Glimmer         | 28B (reasoning)      | 1st try     | 16.6 tok/s | clean              |
| Qwen 3.6             | 27B                  | 1st try     | 11.3 tok/s | clean              |

The headline is that a 7.5B model small enough to run on a laptop with room to spare got a working Astryx page on the first try — and so did the other three. The CLI-derived prompt did its job: none of them hallucinated a component or invented a prop badly enough to break the build.

Speed and quality did not move together. Nemotron is a mixture-of-experts model — 30B of weights but only about 3B active per token — so it ran fastest at 69.4 tokens/second while producing the most output (7,691 tokens; it reasons out loud before writing code). Qwen, a dense 27B, was slowest at 11.3 tokens/second — roughly six times slower for a similar-length page. If you are choosing a local model for this kind of work, an MoE model is worth a look: you get the judgment of a large model closer to the speed of a small one.

## Clean build, not-quite-clean code

A green build is a low bar on purpose — it proves the code runs, not that it is idiomatic. The convention check is where the models separated.

Three of the four produced clean Astryx: layout through `VStack`, `HStack`, and `Grid`; spacing through the numeric scale; color through `Card` variants. No raw HTML layout, no inline styles.

Gemma built a working page but reached for a raw `<div>` with an inline `style` to center the page column, instead of trusting the layout components to do it:

```tsx
// what Gemma wrote
<div style={{ maxWidth: 1100, width: '100%' }}>

// what the prompt asked for
<VStack maxWidth={1100} width="100%">
```

Three convention slips, all the same instinct: when a small model is unsure a component can do something, it falls back to hand-written CSS. It is the exact "wrapper div" escape hatch our [vibe tests](/blog/vibe-tests) are built to catch — and a reminder that "it builds" and "it uses the system well" are two different measurements.

## Two things that bit me

**Context length is a silent failure.** On my first run Gemma failed all five rounds with a syntax error that made no sense — until I noticed it was loaded with a 4,096-token context window. The system prompt plus the growing repair conversation overran that window, and the model's output was being truncated mid-file. Reloaded at 16,384 tokens, it passed on the first try. If a local model is producing code that cuts off partway, check the context length before you blame the model.

**A model can be too new to run — until the runtime catches up.** The fourth model, Muse Glimmer, would not load at all on my first pass. LM Studio's llama.cpp runtime (2.13.0 at the time) did not recognize its architecture:

```
error loading model architecture: unknown model architecture: 'muse-glimmer'
```

Nothing to do with Astryx, and nothing I could work around from my side — the model's format was simply ahead of the runtime that has to read it. Ollama's own llama.cpp build refused it for the same reason. Then, partway through this write-up, LM Studio updated its runtime to 2.28.2 — which added support for the architecture — and the model loaded and built the page on the first try. So the "blocked" result was real, but temporary: the bottleneck was the runtime, and it caught up.

Muse Glimmer is also a **reasoning model**, which is its own gotcha. It emits its chain of thought in a separate `reasoning_content` channel and puts the actual answer in `content`. My very first ping came back empty because I had capped it at 16 tokens — it spent all of them thinking and never reached the answer. Give reasoning models generous token headroom, and read the right field.

## What this means

If you run models locally, Astryx is usable today — and not only with a big model. The thing that made it work was not model size; it was giving the model the CLI's output as its reference. A 7.5B model with the real component API in front of it built a working page on the first try. A larger model wrote cleaner code. An MoE model did both fast. A reasoning model got there too, once its runtime existed.

The honest caveats hold: a clean build is not clean code, small models still reach for wrapper divs when unsure, and your local runtime can quietly cap your context or refuse a model until it ships support. But the core answer is yes — the same CLI that helps a frontier agent build with Astryx helps the model on your laptop do it too.

Try it yourself: `npx @astryxdesign/cli init` in a project, point your local model at it, and see what it builds.
