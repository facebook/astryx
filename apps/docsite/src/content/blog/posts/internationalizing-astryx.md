---
title: 'Translating a component library, safely'
description: "How internationalization and RTL came to Astryx: surveying the modern i18n landscape, why we didn't just adopt a framework, and using automation to catch RTL bugs a linter can't see."
date: '2026-08-06'
type: 'engineering'
draft: false
authors:
  - 'nynexman4464'
tags:
  - 'i18n'
  - 'AI'
  - 'Design systems'
relatedDocs:
  - title: 'Internationalization'
    href: '/docs/internationalization'
  - title: 'How Astryx works'
    href: '/blog/how-astryx-works'
---

Astryx grew out of the internal design system Meta used for eight years, and that heritage shows up in unexpected places. One of them is internationalization. Most internal tools shipped in English to an English-speaking workforce, so translation and right-to-left support were never pressing, and the original library gave them very little thought. Components carried hardcoded English strings and left-to-right layout assumptions because, internally, nobody was asking for anything else.

Open-sourcing changes the audience, and the expectations. The nudge that actually started this came from the community, early after release: a developer shipping an Arabic and Kurdish app – right-to-left – filed a proposal pointing out that a handful of components hardcoded user-facing and assistive strings in English with no way to override them. Table sort labels, pagination controls, Calendar month names. Their app was blocked, and their only workaround was to fork the components to change a few words. They even offered to write the fix.

That report framed the whole effort, because it named both halves of the problem at once. It wasn't just "translate these strings" – it was someone building in a language that also reads the other direction. Localization and layout direction are different problems, but that first report made clear we'd need both to actually unblock anyone.

I had a lot of prior work experience with localization, so I knew the terrain. Right-to-left was by far the trickiest part, but it was hardly the only one: strings that are much shorter or longer in one language than another and wreck a layout, plural rules that differ by language, gender agreement, strings constructed by concatenation that fall apart once word order changes. One technique I found genuinely valuable back then was pseudo-translation – running the UI through a fake "translation" that multiplies string length (and swaps in accented characters) so you can see, before a single real translation exists, which layouts break when the text gets long. Some of these concerns are less acute in a component library, where the strings tend to be short, but none of them disappear – they still need consideration.

It had been a few years since I'd worked on this, though, and the landscape moves. Before designing anything, I spent time with AI assistants mapping the modern state of i18n: what the standards look like now, what the popular React libraries do, where the sharp edges are. That research shaped nearly every decision below, starting with the biggest one.

## Why we didn't just adopt an i18n framework

The obvious move for a library that needs translation is to reach for an established i18n runtime – react-intl, Lingui, i18next – and wire it in. We deliberately didn't, and the reason is specific to being a *component library* rather than an app.

Astryx is a component library, not an i18n framework, and we want its dependencies to stay low and light. A hard dependency on a runtime like react-intl would push a heavy library into everyone's bundle – and, worse, collide with the many teams who already run their own i18n stack, forcing them to either run two runtimes side by side or abandon the one they'd standardized on. A component library doesn't own the app it lives in, so it shouldn't dictate the app's i18n choices.

So we split the decision in two. We adopted **ICU MessageFormat as the string _format_** – the lingua franca every mainstream i18n runtime already speaks – and `intl-messageformat` (the parser that powers react-intl) as our _default_ runtime. But the runtime sits behind a deliberately tiny adapter, so a consumer who already runs react-intl can hand us their formatter and pay zero net dependency cost.

A few other paths we mapped and rejected while surveying the landscape:

- **Rolling our own string runtime.** We didn't need to. Modern browsers do the heavy lifting now – `Intl.PluralRules`, `Intl.NumberFormat`, and friends handle the genuinely hard parts (per-locale CLDR plural rules, locale-aware number and date formatting) natively, and ICU MessageFormat is a well-supported standard on top of them. Hand-rolling a formatter would have meant re-implementing all of that; there was no reason to, when a small, standard parser sits on primitives the platform already ships.
- **Per-locale packages** (`@astryx/i18n-fr`, `@astryx/i18n-es`, …). Our first sketch, rejected mostly for complexity: a matrix of published packages to version, coordinate, and keep in lockstep with core, for translations that are only a couple of kilobytes each. Contribution friction was part of it too – publishing an npm package is a manual, team-blessed step, and putting that on every translation is backwards. Translations now live inside core and arrive as ordinary PRs.
- **Flat JSON with mustache placeholders** (the shape Excalidraw ships). Fine for a standalone app; wrong for us. We need real plurals and number formatting, which means ICU, and we want translator context to live in version control, not only inside a translation tool.

That last point turned out to matter more than expected. The format we chose, React Intl JSON, carries a `description` alongside every string – a note for whoever translates it, which flows through to Crowdin so a translator sees it right next to the string. It earns its keep on anything ambiguous out of context. Our Dialog close button ships the note *"Close = shut/dismiss the dialog, not nearby (English homograph)"* – exactly the kind of thing a translator, or a machine, would otherwise get wrong. (We leaned on those descriptions ourselves later; more below.)

What we landed on is small: one provider that carries a _locale name_, not a bag of strings; one hook to read them; and English defaults baked in so a component works with no provider at all – it just renders English. Nothing breaks by being un-translated, which makes adoption incremental rather than all-or-nothing.

To make sure the "format, not framework" bet actually held, we tested it in a small demo app – a toy todo/pricing app that runs Astryx alongside react-intl. Astryx's own components localize through `InternationalizationProvider`, while the app's own prose and prices localize through react-intl, both driven by a single locale picker that hot-swaps between English, French, Arabic, and the pseudo-locale live, with no reload. Switching to Arabic flips the whole layout right-to-left off the same picker. It confirmed the thing we most wanted to be true: a team can run their existing i18n stack and Astryx's shipped strings in the same tree without the two fighting.

## A string is more than its words

A recurring theme in the research – and in my earlier experience – is that a user-facing string often isn't just text. Plurals in particular are deceptively hard. A real Astryx string looks like this:

```
Go back {step, number} {step, plural, one {page} other {pages}}
```

There's structure in there that has to survive translation: a numeric argument, and a plural selector with branches the runtime picks between based on `step`. Getting that structure right for the target language is where i18n stops being about vocabulary. English has two plural forms; Arabic has six; Russian and Polish have four; Japanese has one. A translation that keeps only the two English branches is grammatically broken across most of the world. Placeholders have to be preserved exactly, too – the `{step, number}` isn't decorative; if it's dropped or renamed, the string won't render.

The upside of strings having this much structure is that the structure can be _checked_ mechanically – you don't have to eyeball whether a placeholder survived or a plural has the right branches. Hold onto that; it comes back when we get to translating in bulk.

## Right-to-left, and the bugs that hide from your linter

Translating every string into Arabic still leaves a broken UI, because direction is about how the layout flows, not the words. Most of it is mechanical: use CSS logical properties (`margin-inline-start` instead of `margin-left`) and the browser mirrors your layout for free from a single `dir` attribute. A lint rule can enforce that, and ours does.

The bugs that actually reach users are the ones where every individual property is _valid_ and the composition is wrong. The example that convinced us to build tooling:

```
insetInlineStart: 0;          /* logical – flips correctly under RTL */
transform: translateX(-50%);  /* physical – does NOT flip */
```

Both lines are fine alone. A linter checking for physical properties sees `insetInlineStart` and approves. But together they describe an element anchored to the logical start edge and then nudged by a _physical_ offset that doesn't flip – so under RTL it lands on the wrong side by its own width. There's no bad token to grep for. The bug lives only in the interaction of two correct-looking lines.

Icons have the same shape. A chevron can be mirrored by swapping the glyph name in JS (`chevronLeft` becomes `chevronRight`) or by flipping it in CSS (`scaleX(-1)` under `[dir="rtl"]`). Do one and it's correct. Do both – a name-swap on an element a stylesheet is already flipping – and they cancel, so the arrow points the wrong way. Two individually-correct mechanisms composing into a bug.

You can't lint your way out of this, and you can't reliably eyeball it either, because it only appears when the component is rendered under `dir="rtl"` – and nobody on the team reviews in Arabic by default. So we built an [RTL audit that renders every component story in both directions and compares geometry](https://github.com/facebook/astryx/pull/4517). For each absolutely-positioned element it measures the center-X relative to its parent in LTR, renders again in RTL, and asserts the element mirrored to the opposite side within a few pixels. An element that _should_ have flipped but didn't shows up as a large delta; a double-flipped icon shows up as one that stayed put when it should have moved.

The measurement was the easy part. Getting to zero false positives across ~1,300 positioned elements was not. A full-width strip has no left or right side, so its center sits at the parent origin in both directions and the naive check misfires. An element that's already centered mirrors to itself. Each false positive we hit on a full-library run taught us a guard – skip degenerate parents, skip full-span elements, skip already-centered ones – until the audit was quiet except for genuine bugs. It runs in CI on every PR now and catches directional regressions that would otherwise ship in silence.

That's the part we'd point other design systems at: **the RTL bugs that survive to production are compositional – individually-valid properties that break in combination – and finding them wants rendered-geometry automation, not static analysis.**

## Seeding 29 languages, as a correctness problem

With the seam built and the layout mirroring correctly, we had a catalog of 250 strings and a [Crowdin](https://crowdin.com/project/astryx) project with 29 languages enabled – all empty. Community translation is the long-term source of truth, but it takes time, and until strings exist every locale just renders English. Using an LLM to generate a first pass is an obvious move, and not a particularly novel one. What made it work was refusing to treat it as a language task first.

Because so much of a string is structure, the failure we cared about most wasn't awkward phrasing – it was a dropped placeholder that makes a component throw at runtime. So the first thing we built wasn't a translation, it was a validator. It runs every candidate string through Astryx's own ICU parser (the exact one the components use) plus a CLDR plural table: it parses the string (parse error is a fail), compares every placeholder against the source (added, dropped, renamed, or retyped is a fail), and checks that plurals cover the categories the target language actually requires (a missing one is a warning). Fails are things that crash, and a machine catches them with certainty. Warnings are things that read poorly, which a machine can't judge. Gate hard on the first; route the second to review.

We also fed the models the same `description` field we'd written for human translators – that Dialog "not nearby" note and its ~250 siblings went into every prompt as context. The same investment paid off twice: once for the community, once for the machine.

Generation itself was almost boring next to the validator: parallel translation agents grouped by language family, each given the exact plural categories for its languages, each self-validating until zero fails. We piloted the two hardest cases first – Arabic (six plural forms, and RTL) and Russian (four, Cyrillic) – then fanned out the rest and re-ran the validator across all 29 independently. Result: 7,250 entries, zero ICU failures.

The step that earned its place was the review. We ran the finished set past a _second, different_ model, pointed adversarially at the thing the validator can't see – accuracy, register, idiom. It surfaced a systematic error no rule would have caught: the translations kept rendering button labels as **nouns where the language needs an imperative verb**. "Close" became "closing," "Send" became "sending." Invisible to a placeholder checker, obvious to a fluent speaker, and worst in Hebrew, where fixing it turned up dozens more of the same. Two automated layers catching completely different classes of error – neither sufficient alone.

We uploaded all 29 as approved translations, so they render today, while leaving the community free to suggest better wording over any machine seed. Every language landed at 95–99% translated; the remainder per language is strings like `{name}, {status}`, pure placeholder compositions with nothing to translate.

## What's still open

We're not claiming Astryx is fully internationalized – a few things are honestly still in front of us.

**Constructed strings.** This is the oldest rule in the i18n book: don't assemble a sentence from separately-translated fragments, because word order, pluralization, and grammatical agreement all shift between languages and a translator can't rearrange pieces they receive one at a time. It's why Meta built [FBT](https://github.com/facebook/fbt) the way it did – the whole point is to make the _sentence_, not the fragment, the unit of translation. Astryx mostly follows this: nearly every string is a single message with placeholders.

PowerSearch is where we don't. A faceted-search chip is assembled from a field, an operator, and a value (`status is open`), and that's genuinely hard to avoid in a component library, because the pieces aren't ours to translate: the field names and values come from the consumer's data model, and only the small operator set is something we own. We can – and should – make the frame a single ICU message with placeholders so it's at least reorderable per language. But full grammaticality, where an arbitrary user-supplied field noun inflects correctly for case and gender in every language, isn't achievable at the library layer, because we can't inflect words we've never seen. Realistically the honest target is a translatable, reorderable template rather than a fluent sentence – and getting even that far is work we haven't finished.

**Layout under long strings.** Some translations are much longer than their English source – Greek and Turkish run 30–40% longer on average, and short labels can triple: PowerSearch's `is` operator becomes Turkish `eşittir` or Serbian `једнако је`. We spot-checked the worst offenders by rendering them in a real app, and the components held up better than expected – dropdowns and selectors auto-widen to fit, so nothing clipped or overlapped at normal widths. The only breakage we found was a genuinely narrow one: below ~400px, the longest operator labels can run past the edge of a faceted-search popover. Our pseudo-locale catches untranslated strings and narrow-column issues today, but it doesn't yet _inflate length_ – the classic trick of multiplying string length to surface these bugs before a long-language translation ever lands. Adding that, and a responsive check on the narrow-popover case, is the layout work still on the list.

**Server-side rendering.** The `useTranslator` hook is client-side today. For fully server-rendered pages there's design work ([#4030](https://github.com/facebook/astryx/issues/4030)) on a server-side path that would let more components stay server components and trim the client bundle.

**Reusing an existing runtime.** We ship `intl-messageformat` as the default formatter, but the adapter seam is meant to let a consumer plug in the i18n runtime they already run. Finishing and documenting that adapter ([#4029](https://github.com/facebook/astryx/issues/4029)) is the other open design thread.

## What we learned

- A component library should depend on a _format_, not a _framework_. Adopting ICU while keeping the runtime injectable means we never force a second i18n stack on a consumer who already has one.
- A user-facing string is often more than its words. The failures that matter are structural – placeholders and plural categories – and structural failures can be checked deterministically instead of proofread.
- Context written once pays off twice. The per-string descriptions we added for human translators turned out to be exactly what the machine translation needed to disambiguate.
- The RTL bugs that reach production are compositional: valid properties that break in combination. Static analysis can't see them; rendered-geometry automation can, and it belongs in CI.
- LLMs are a fine way to seed translations, but the leverage is in bracketing them – a deterministic validator underneath for correctness, and a second model on top for the fluency a validator can't judge.

Astryx now speaks 29 languages and reads in both directions, with nothing forked to get there. Set your locale, set your `dir`, and it works. And if you speak one of those languages and see a translation that could be better, [the Crowdin project](https://crowdin.com/project/astryx) is open – which was the whole point.
