---
title: 'Vibe Test'
description: 'How we make decisions in Astryx'
date: '2026-07-27'
type: 'engineering'
authors:
  - 'ernest'
  - 'cixzhang'
tags:
  - 'AI'
  - 'Testing'
  - 'Design systems'
coverImage: '/blog/vibe-tests/cover.png'
coverAlt: 'Astracat, the Astryx mascot, dressed as a scientist in a lab coat and round glasses, sipping a flask of blue liquid, with the words vibe and test on either side'
relatedDocs:
  - title: 'How Astryx works'
    href: '/blog/how-astryx-works'
  - title: 'Vibe Tests wiki'
    href: 'https://github.com/facebook/astryx/wiki/Vibe-Tests'
---

When the user of a design system shifts from humans to agents, we have to rethink how we approach designing the system. Luckily, when our users are agents, we can now do "user" studies at scale and at any frequency.

But simply asking the agent for its preference doesn't work. It results in biased responses based on context and memory. Vibe tests are our way to standardize testing procedures to be as objective as possible. This method was used extensively to inform Astryx's decisions, from API arbitration to system architecture choices. It's also the most convincing form you can present to sway Astryx on future decisions. If you want to run a vibe test, point your agent at this [Vibe Tests wiki page](https://github.com/facebook/astryx/wiki/Vibe-Tests).

This is where we are with our current methodology.

## Simulating naive environments

User prompts should not contain leading language, and testing agents should not inherit any SOUL.md, MEMORY.md, or any prior context.

When we generate a spectrum of prompts that a naive user might ask, it is critical that the prompts simulate users with no prior knowledge of Astryx. Prompts should describe the user experience rather than specific components. For example, "Build an FAQ page where the user opens each question" instead of "Create an accordion using collapsible lists."

Prompts should also represent reasonable coverage of categories to prevent oversampling of one specific area. Enumerating common use cases and edge cases prevents only testing the happy path and declaring success.

Because sub-agents typically carry main-agent context, [specific instructions](https://github.com/facebook/astryx/wiki/Vibe-Evaluation#sub-agent-isolation) are followed to ensure sub-agent isolation and prevent context from leaking in ways that would skew results.

## Test conditions

Narrow down to 3 to 5 candidates for each test. These could be small design details like component abstraction level, API naming, or configuration shapes. Or they could be framework-level decisions, like testing Astryx with StyleX against Tailwind, Shadcn, or raw HTML. Here are some real examples of things we tested and how they influenced Astryx's design:

- [Token naming structure](https://github.com/facebook/astryx/issues/864)
- [Selector API](https://github.com/facebook/astryx/issues/477)
- [CLI vs MCP](https://github.com/facebook/astryx/issues/2306)

## Agent as judge

After sub-agents run through all the prompt batteries, a judge agent is spawned to look and compare across all the outcomes. It is important for sub-agents not to self-judge; we found that self-judging minimizes the ability to spot differences across outcomes.

The judges are guided by a set of rubrics we document in the Astryx wiki. Each rubric bakes in aspects that are important to Astryx. For example:

- The [Astryx system test](https://github.com/facebook/astryx/wiki/Vibe-Evaluation#what-gets-measured) judges on correctness, accessibility, code quality, efficiency, maintainability, and design.
- The [Astryx API test](https://github.com/facebook/astryx/wiki/API-Arbitration#what-to-look-for) judges on discoverability, hallucinations, added divs, verbose code, and unused features.

## Reporting and self-healing

We run vibe tests nightly using a [nightly cron job](https://github.com/facebook/astryx/wiki/Night-Watch-Vibe-Test-Runner) that activates an AI orchestrator. We call these [night watches](https://github.com/facebook/astryx/wiki/Night-Watch-Overview), and they help automate management of various parts of our system. We'll talk more about this in a future blog post.

Vibe tests for Astryx are typically reported under our GitHub issues and [wikis](https://github.com/facebook/astryx/wiki/Vibe-Test-Scores) that can be referenced in PRs and other places. These results pipe to another [night watch](https://github.com/facebook/astryx/wiki/Night-Watch-Vibe-Test-Debugger) that analyzes the results and sends PRs ([like this one](https://github.com/facebook/astryx/pull/3907)) to improve our documentation or APIs when it detects recurring issues. We found that AI producing solutions to vibe-test issues naively will often oversample for the specific issue it encountered in a single vibe test, so the night watch is instructed to look for recurring patterns and to demonstrate evidence by reproducing the vibe-test issue.

## Design your own

Our main challenge when we set out to improve our system for AI was that the whole space was so nascent. Every week a new feature or solution would pop up from the community, and LLMs were poor judges of what actually works. So vibe tests became our compass for quickly evaluating new ideas and narrowing down where to invest our efforts. You can design any kind of vibe test for new situations. For example, when the [impeccable front-end skills](https://impeccable.style/) were released, we [explored vibe testing them with Astryx components](https://github.com/facebook/astryx/issues/1000).

You can design your own vibe tests by providing a few key ingredients to an AI agent. [Have your agent follow the instructions here.](https://github.com/facebook/astryx/wiki/Designing-Vibe-Tests) We hope this methodology helps people navigate the crazy world of AI.
