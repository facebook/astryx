---
title: 'Can a local model build with Astryx?'
description: 'An experiment: we asked several models running entirely on a laptop to build real pages with Astryx, using only the CLI. Less about the models than about what Astryx does to make itself easy to build with.'
date: '2026-08-13'
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

> A companion writeup, with the live pages and the full setup, is on my personal blog: [What it takes to build with Astryx, seen through local models](https://humbertovirtudes.github.io/#/blog/local-llm-astryx-benchmark).

Most AI writing about Astryx assumes a frontier model behind an API. But a lot of people now run models directly on their own machines through [LM Studio](https://lmstudio.ai/) or [Ollama](https://ollama.com/): no API key, no data leaving the laptop, no per-token bill. So this is an experiment with a narrow question at its center: not "which model is best," but what a model actually has to do to build with Astryx, and what the design system does to make each of those steps easy.

The task was a flower shop, "Petal & Stem," built as a single `src/App.tsx`. We ran it at three levels: a simple landing page, a production marketing site with a light/dark theme and real imagery, and a round where the model iterates on its own work from a screenshot. Every page is unedited model output, built with `@astryxdesign/core` and gated by a real `vite` build.

![A complete flower shop landing page built with Astryx: a header with a cart, a hero, and a responsive grid of bouquet cards with badges and prices.](/blog/can-a-local-llm-build-with-astryx/build-simple.png)

The interesting result is not a scoreboard. It is that building with Astryx decomposes into a handful of concrete operations, and the system has a specific strength that carries each one. Here is what those operations are and where the design system does the work.

## Discovering the API

The first thing anyone does with Astryx, model or human, is find out what components exist and what props they take. Nothing was hand-fed here. The reference came straight from the CLI:

```bash
npx @astryxdesign/cli build "flower shop landing page with featured bouquet cards"
npx @astryxdesign/cli component Card
npx @astryxdesign/cli component Grid
```

That output carries the real component names, the real props, the spacing scale, and the styling rules, and it folds into a single system prompt. The strength Astryx brings here is that the CLI is the shared reference: the same command that helps a person orient a model. In the experiment, every model that could load found the right components this way and produced a page that built on the first attempt. An API that a model can navigate from the CLI alone is one a person can navigate without leaving the terminal.

## Staying inside the system

Astryx is opinionated on purpose. Layout goes through `VStack`, `HStack`, and `Grid`. Spacing comes from a numeric scale. Color comes from component variants and tokens. `className` and Tailwind are supported for the cases components do not cover; the one real anti-pattern is an inline `style` on a raw element instead of reaching for a component or a token.

The strength here is that the `vite` build is an honest gate. A missing import, a bad prop, or a component that does not exist becomes a hard error rather than something that ships silently. That gate is what lets an unattended model self-correct: it gets a real signal, not a guess. Where a model reached past the components for hand-written CSS, the difference between "it builds" and "it uses the system well" showed up clearly, and it was always a property of the model's choice, never of Astryx being unclear.

## Composing a layout that is responsive by default

A production page has to survive a phone. In Astryx that is a single design decision, not a media-query exercise. A grid written as `columns={{minWidth: 300}}` reflows on its own: the browser fits as many 300px tracks as there is room for, so the same code is multi-column on a desktop and a single column on a narrow screen.

![A full production marketing site built with Astryx: app shell with theme toggle and cart, hero, trust strip, a grid of bouquet cards with prices and badges, occasions, how-it-works steps, testimonials, and a newsletter band.](/blog/can-a-local-llm-build-with-astryx/build-production-desktop.png)

This is the strength that shows up most: correct is responsive by default. A model that simply used the reflowing primitive got a mobile-ready layout for free, and one that wrapped the app in `<Theme>` and used tokens got a working light and dark mode without hand-managing a palette. The system paves the correct path so thoroughly that following it is easier than not.

## Iterating from what renders

Modern local models can see. So the last operation was a loop: build the page, screenshot it at desktop and mobile, hand both images back, and ask the model to critique and revise its own `App.tsx`. This only works if a correct fix is a small, local edit, and Astryx keeps it that way. Improving a cramped mobile row means swapping a fixed column count for the reflowing one, not rewriting the section. Shown its own screenshot, a model could make exactly that change because the system made the fix small.

## Composing a page too big to write at once

A full production layout is many sections, and some models could not emit all of it in one coherent pass. The technique that solved this is one a careful person uses too: build the page section by section. A fixed shell owns the imports, the state, and the top-level layout, and each section is generated and build-checked on its own before it is composed back in.

![The same production flower shop, built section by section and reassembled: hero, bouquet grid, occasions, testimonials, and footer, all intact and responsive.](/blog/can-a-local-llm-build-with-astryx/build-decomposed-desktop.png)

The strength Astryx brings here is composability. Because its components compose cleanly, a section that validates in isolation still works once assembled. A page that was hard to hold as one 500-line file was easy to hold as ten small pieces, and the reassembly just worked. Decomposition is not a workaround; it is how the composable design of the system is meant to be driven.

## What this says about Astryx

The thing that made all of this work was not any one model. It was that Astryx is discoverable from the CLI, enforceable at build time, responsive and themeable by default, and composable enough to build in pieces. Give a model the CLI's output as its reference, let the build hold the line, prefer the reflowing and token-driven primitives, and decompose anything large, and a page that renders comes out the other side.

The honest edges hold: a clean build is not clean code, and it is not even a guarantee the page renders, since a runtime error can slip past a compiler. But the core answer is yes. The same CLI and the same primitives that help a frontier agent build with Astryx help the model on your laptop do it too.

Try it: `npx @astryxdesign/cli init` in a project, point your local model at the CLI's output, and see what it builds.
