---
title: 'How Astryx works'
description: "A look under the hood of Astryx: the problem it was built to solve, the systems it's made of, and the principles behind how we build it."
date: '2026-06-29'
type: 'engineering'
authors:
  - 'cvkxx'
  - 'cixzhang'
tags:
  - 'Architecture'
  - 'AI'
  - 'Design systems'
coverImage: '/blog/how-astryx-works/cover.png'
coverAlt: 'Astracat, the Astryx mascot, in an astronaut helmet with an Astryx-branded jetpack, against a gradient backdrop of asterisk shapes'
relatedDocs:
  - title: 'Getting started'
    href: '/docs/getting-started'
  - title: 'Theming'
    href: '/docs/theme'
  - title: 'CLI'
    href: '/docs/cli'
  - title: 'Components'
    href: '/components'
---

We [introduced Astryx](/blog/introducing-astryx) as an open-source design system that's AI-fluent and fully customizable without dependencies. This post is the technical story behind it – what Astryx actually is, the problem at Meta that produced it, the systems it's built from, and how we make and evaluate changes. We'll go deep on each system in posts of their own.

## What is Astryx?

Astryx is a component library that ships pre-compiled CSS and typed React components – 150+ accessible components, brand-level theming, dark mode, templates, and a CLI as one cohesive system, built on React and StyleX, currently in beta.

```css
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-neutral/theme.css'; /* Pick a theme */
```

```tsx
import {Button} from '@astryxdesign/core/Button';
import {Stack} from '@astryxdesign/core/Stack';
import {Card} from '@astryxdesign/core/Card';

<Stack gap="md">
  <Card>
    <Button variant="primary">Save</Button>
  </Card>
</Stack>;
```

**A few things set it apart:**

- **Open internals.** Components are built to be composed at any level, not locked behind a closed top-level API. The building blocks you'd reach for are exported directly, and when you need to go deeper than that, swizzle ejects a component's full source – internal modules and all – into your project to own.
- **Customize without wrapping.** A theme is a set of CSS custom property overrides and component style overrides generated from a config to be compatible with the system. A designer can own it; a developer never forks or wraps component source to change how things look.
- **Ships ready-to-use or built from source.** Drop in the pre-built stylesheet and you're done, or build from the TypeScript + StyleX source so your bundler keeps only the components you actually use – a first-class path for the leanest possible output.
- **Built for AI assistants too.** The API and docs are shaped by measuring how LLMs actually use the library, and the same reference an engineer reads is available to an AI assistant through the CLI.

## The problem at Meta

Meta runs on thousands of internal tools, spread across different orgs and built by the teams that need them; the company's culture actively encourages building your own tool when one doesn't exist. But the investment in any single tool is fragmented across orgs, so builders kept rebuilding the same components – the date picker, the table, the form – in tool after tool. Everyone paid for it: end users carried the cognitive load of every product working a little differently, builders lost time reinventing wheels, and the company maintained the same component over and over.

We built the original system as a common UI framework teams could build from instead of starting over. The idea was simple – solve shared problems once, so builders could spend their time on what was actually unique to their product. It gave the company a shared UI language for internal tools, made collaboration and sharing across tools possible, and – because of the sheer range of problems internal tools have to solve – accumulated a large breadth of complex, battle-tested components across various use cases. Over eight years it became the most-used and largest design system at Meta, powering 13,000+ products, with roughly half of all updates contributed by the builder community itself. That breadth and real-world usage are the foundation Astryx is built on.

AI changed the economics of building UIs. Assistants became dramatically more effective when working with in-distribution, open-source standards like TypeScript, popular OSS libraries, and modern browser primitives, and the internal system was none of those. At the same time, we wanted to modernize on the latest browser technology, open up far more customization, and make the system AI-fluent by design rather than retrofitting it. AI also changed what was possible for us: the same leverage that made building easier put a full rebuild, and open-sourcing it, within reach for a team our size.

Astryx is that internal system rebuilt on the open-source stack – modern browser features, the ability to customize without wrapping, and a built-in documentation system that powers both human and AI interaction with the library. It keeps the breadth, conventions and institutional knowledge that eight years of scale produced, and sheds the constraints that were holding it back.

## The systems

Astryx is a handful of systems that compose.

**Distribution.** Astryx ships two ways. The simple path is a single pre-built stylesheet – import it and use components, no build setup at all. The advanced path builds from the TypeScript + StyleX source, so your bundler includes styles only for the components you import (roughly a third of the full stylesheet in our reference app) and gets precise control over how Astryx's styles layer against your own.

**Theming system.** Theming is where a designer makes Astryx their own. A theme is a declarative config – colors, typography, motion, spacing, per-component tweaks – and changing a value updates every component at once. Beyond adjusting CSS variables, Astryx themes are able to customize components, component parts directly and introduce custom variants. Light and dark are handled together, themes can be switched live or compiled to a static file for production, and 7 ready-made themes ship today.

**A graduated customization path.** Control escalates one well-defined step at a time: use a component as-is → adjust theme tokens → apply your own styles via class names → reach in with your own CSS → or eject the source entirely and own it. Each step trades more control for more responsibility.

**A CLI companion.** The CLI is the operational interface – browsing docs, scaffolding, building themes, and running automated upgrades when something changes. It's also a more reliable way for AI assistants to learn the library than long docs or web search, so an assistant builds with the exact API a person does. We keep the human and AI experience of the system in sync. Documentation, examples, and templates you see in this docsite are available to AI via the CLI.

**Vibe tests.** A built-in evaluation harness that measures how well people and AI can actually build with Astryx. It's how we catch when a change makes the system harder to use, and how we settle design debates with evidence instead of opinion.

## Principles

A few principles hold the whole system together. They're the promises Astryx makes to the people building on it.

**Guidance over enforcement.** Components give you capability rather than guardrails that fight you. Design opinions live in docs and examples, so if you pass a value, the component renders it. The system steers; it doesn't police.

**Strong, documented conventions.** Every component follows the same naming, prop, and composition rules, and every one is thoroughly documented. Once you've learned a few, the rest feel familiar, and both people and AI can predict how an unfamiliar component will behave.

**One system for humans and AI.** The API, conventions, docs, and CLI are designed together so a person and an AI assistant build the same way, working from the same reference. We found the two reinforce each other: every change that made Astryx easier for AI made it easier for people too.

**Earned by measurement.** We test conventions rather than assert them. We put competing approaches in front of both people and AI, measure what actually works, and let the data settle the debate – then hold the result loosely and revisit it when a new situation proves it wrong.

We build and maintain Astryx with AI and with Astryx itself. Repo stewardship, documentation audits, and vibe test runs are all AI-assisted, and our own tools run on the components we ship. Any code to core including AI-assisted code is human-reviewed by our team.

## The name

Astryx, pronounced asterisks, draws on _ad astra per aspera_ – "through hardship to the stars." The "X" is a nod to the origin: xDesign, the team where these ideas began. And an asterisk is the little symbol that stands in for everything – the footnote that turns out to matter, the placeholder that holds a system together.

We chose a name that carried the soul of why this effort started in the first place. We didn't want to fixate on what it does today but rather, what it could become in this ever-so, increasingly fast-paced and changing technological world.

## Open source

Astryx is open source under the MIT license, currently in beta.

```bash
npm install @astryxdesign/core @astryxdesign/theme-neutral
npm install -D @astryxdesign/cli
```

Astryx exists because of a community of builders inside Meta who contributed fixes, flagged edge cases, and shaped the system over eight years – much of what it knows, it learned from them. Now it's open to a wider community. We built it loosely, openly, and with a lot of care, and we intend to keep building it the same way. Welcome to Astryx.
