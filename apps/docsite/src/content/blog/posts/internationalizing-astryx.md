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

Astryx grew out of Meta's internal design system, and that heritage shows up in internationalization. Most internal tools shipped in English to an English-speaking workforce, so translation and right-to-left support were never priorities. Components carried hardcoded English strings and left-to-right assumptions because, internally, nobody was asking for anything else.

Open-sourcing changed the audience. The trigger came from the community after release: a developer shipping an Arabic and Kurdish app filed a proposal pointing out that several components hardcoded user-facing and assistive strings in English with no way to override them. Table sort labels, pagination controls, Calendar month names. Their app was blocked, and the workaround was to fork the components to change a few words. They offered to write the fix.

That report framed the real scope. It was not just "translate these strings" – it was someone building in a language that also reads the other direction. Localization and layout direction are different problems, but if we wanted to unblock that use case, we needed both.

I'd spent a good chunk of my career on localization before this, so when the work came up I volunteered to take it on. The rough edges were familiar to me: strings whose length swings wildly between languages and break layouts, plural rules that differ from one language to the next, and phrases assembled from fragments that stop making sense once word order shifts. The hard part, then as now, was RTL. It had been a few years since I'd done this in anger, though, so I leaned on AI assistants to resurvey the modern i18n landscape – what the standards look like now, what the popular React libraries settled on – before committing to a design.

## Why we didn't just adopt an i18n framework

The obvious move was to wire in an established runtime such as `react-intl`, Lingui, or i18next. We deliberately did not, for a reason specific to being a component library rather than an app.

Astryx should not force an application's i18n choices. A hard dependency on one runtime would add bundle weight and collide with teams that already standardized on something else, leaving them to run two systems side by side or replace their own. A library does not own the app it lives in, so it should not dictate the app's translation stack.

So we separated format from framework. We adopted ICU MessageFormat as the string format because every serious i18n runtime already speaks it, and we used `intl-messageformat` as the default formatter behind a small adapter. If a consumer already runs `react-intl` or another compatible stack, they can hand Astryx their formatter instead.

That decision also let us keep the API small: one provider carrying a locale, one hook to read translations, and English defaults baked in so components still render without any setup. Adoption stays incremental.

## A string is more than its words

One thing this work reinforces is that a user-facing string is often structured data, not just prose. A real Astryx message looks like this:

```text
Go back {step, number} {step, plural, one {page} other {pages}}
```

The words matter, but so do the placeholders and plural branches. Those are what make the string render correctly in each locale. English has two plural forms; Arabic has six; Russian and Polish have four; Japanese has one. If translation drops a placeholder or preserves only the English plural logic, the result is not just awkward – it can be wrong or fail at runtime. That is why we treated translation as a correctness problem as much as a language problem.

## Right-to-left, and the bugs that hide from your linter

Translating everything into Arabic still leaves a broken UI if the layout stays left-to-right. Most RTL support is mechanical: use CSS logical properties such as `margin-inline-start` instead of `margin-left`, set `dir="rtl"`, and let the browser mirror the layout. A lint rule can enforce that, and ours does.

The bugs that actually escape are compositional. The example that pushed us to build dedicated tooling was this:

```css
inset-inline-start: 0;
transform: translateX(-50%);
```

Each line is valid on its own. A linter sees a logical inset and approves. But together they anchor an element to the logical start edge and then shift it with a physical transform that does not flip in RTL. Under `dir="rtl"`, the element lands on the wrong side by its own width. There is no bad token to grep for. The bug lives in the interaction.

Icons fail the same way. You can mirror a chevron by swapping the glyph in JS or by flipping it in CSS. Either approach is fine. Do both on the same element and they cancel, so the arrow points the wrong way. Again, both decisions look reasonable in isolation.

Static analysis is weak against this class of problem because every property can be individually correct. So we built an [RTL audit that renders every component story in both directions and compares geometry](https://github.com/facebook/astryx/pull/4517). For each absolutely positioned element it measures center-X relative to the parent in LTR, renders again in RTL, and checks that the element mirrored to the opposite side within tolerance. Elements that should have flipped but did not show up immediately. So did double-flipped icons that stayed put when they should have moved.

The hard part was reducing false positives across roughly 1,300 positioned elements. Full-width strips have no meaningful left or right side. Elements that are already centered mirror to themselves. A naive geometry check flags both as failures. We iterated on those cases, adding guards for degenerate parents, full-span elements, and already-centered children until the audit was quiet except for real regressions. It now runs in CI and catches directional bugs that a linter cannot see.

That is the lesson worth keeping: the RTL bugs that reach production are rarely a stray `left` – they are valid pieces that break in combination, so the reliable check is rendered geometry, not static rules.

## Seeding 29 languages, as a correctness problem

Once the seam existed and RTL behavior was under control, we had about 250 strings and a [Crowdin](https://crowdin.com/project/astryx) project with 29 empty languages. Community translation is the long-term source of truth, but until strings exist every locale just renders English. Using an LLM to seed the first pass was straightforward. The important part was putting a validator in front of it.

Because the strings carry structure, the first failure mode to guard against was not awkward wording. It was dropped placeholders, renamed arguments, parse errors, and plural categories missing for the target language. So we built a validator that runs every candidate string through the same ICU parser Astryx uses at runtime, compares placeholders against the source, and checks plural coverage against CLDR rules. Parse failures and placeholder mismatches are hard failures. Missing plural categories are warnings. That let us gate on what a machine can judge with certainty.

We also passed the per-string `description` field into prompts. Those notes existed for human translators, but they helped the model just as much. The Dialog close button, for example, carries a note clarifying that "Close" means dismiss the dialog, not nearby. Context written once paid off twice.

The actual fan-out was less interesting than the checks around it. We piloted the hardest cases first, then seeded the rest, and re-ran validation over all 29 languages. The result was 7,250 entries with zero ICU failures.

The nominally "done" output still needed review, because the validator only covers structure. So we ran a second, different model over the finished set with the opposite job: ignore syntax, look for meaning, register, and idiom. It caught a systematic error the validator never could. Several button labels had been translated as nouns where the language needed an imperative verb – effectively "closing" instead of "close," "sending" instead of "send." Hebrew surfaced the pattern most clearly, and once we fixed it we found more cases of the same. That second pass earned its place by catching the class of errors rules cannot see.

We uploaded all 29 as approved translations so the library renders today, while leaving room for the community to improve wording over time.

## What's still open

Astryx is not "finished" with i18n. A few problems are still real. PowerSearch still assembles some phrases from consumer-supplied pieces, which limits how grammatical those phrases can be in every language. Our pseudo-locale does not yet inflate string length aggressively enough to flush out all narrow-layout failures. And on the platform side, server-rendered translation and the adapter for reusing a consumer's existing runtime are both still active design work. Those are tractable problems, but they are still problems.

Astryx now speaks 29 languages and reads in both directions, with nothing forked to get there. Set your locale, set your `dir`, and it works. If you speak one of those languages and see a translation that could be better, [the Crowdin project](https://crowdin.com/project/astryx) is open.
