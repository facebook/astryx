---
schema_version: 3
template_version: 5
kind: component
id: component:ChatDictationButton
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility, theming, testing]
verified_by:
  [
    packages/core/src/Chat/ChatDictationButton.test.tsx,
    apps/storybook/stories/ChatDictation.stories.tsx,
    apps/storybook/rtl-audit/verified-not-applicable.json,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-style-authoring,
    architecture:theme-tokens,
    architecture:component-test-sufficiency,
    architecture:knowledge-contracts,
  ]
contributing: []
system_specs: [spec:AST-029]
---

# ChatDictationButton component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | `dictation` supplies support, listening, volume, bands, and toggle state; `size`, `label`, root span props, styles, and ref remain additive inputs.                                                                |
| Behavior                | The idle button shows the microphone action. Listening replaces the icon with five volume-reactive bars. Unsupported dictation is hidden by default or disabled when explicitly retained.                          |
| End-user impact         | Voice input remains operable and labelled; unsupported browsers do not expose an action that cannot run.                                                                                                           |
| Builder impact          | Builders can place the control in ChatComposer send actions and safely customize its root layout without owning speech state.                                                                                      |
| Compatibility/readiness | Patch-compatible repair: existing supported behavior is unchanged; the opt-in unsupported-visible state becomes accurately disabled.                                                                               |
| Review checks           | Reject an enabled unsupported action, a missing listening label, raw theme-inaccessible clipping color, or lost root passthrough.                                                                                  |
| Governing rules         | `architecture:component-style-authoring/INV1–INV3`; `architecture:theme-tokens/INV3`; `architecture:public-component-api/INV1, INV5–INV6, INV8`; `architecture:component-test-sufficiency/INV1–INV8, INV10–INV11`. |

This table is a review projection; the body below is authoritative.

## Intent

ChatDictationButton renders the visible control for an existing speech-recognition
state owner. It translates that owner's support and listening states into one
icon-only Button and a direction-neutral equalizer visualization.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: behavioral bug fix for the explicit unsupported-visible state
- Supported idle and listening states: unchanged
- Migration decision: none

## Ownership boundary

**Owns**

- The start/stop accessible label and optional caller label override.
- Hidden-versus-disabled presentation when speech recognition is unsupported.
- The five-bar visual projection of supplied band and volume values.
- Theme-aware accent-to-error clipping feedback.
- Root span ref and accepted neutral span props.

**Does not own / non-goals**

- Speech recognition support detection, lifecycle, transcripts, or errors.
- Microphone permission UX or audio capture.
- ChatComposer placement beyond documented composition guidance.
- A public color, threshold, or equalizer-shape axis.

## Public concepts

| Concept      | Closed values or states                            | Meaning                                                       | Default                     | Owner                                    | Stability |
| ------------ | -------------------------------------------------- | ------------------------------------------------------------- | --------------------------- | ---------------------------------------- | --------- |
| support      | supported; unsupported-hidden; unsupported-visible | Determines whether the control can render and operate.        | unsupported-hidden          | speech owner projected by this component | stable    |
| listening    | idle; listening                                    | Selects the start/stop label and microphone/equalizer visual. | idle                        | `dictation`                              | stable    |
| size         | `sm`; `md`                                         | Sizes the Button and equalizer geometry together.             | `md`                        | component                                | stable    |
| label        | translated default; caller override                | Names the action for assistive technology.                    | state-dependent translation | component/caller                         | stable    |
| root surface | ref; DOM/data/ARIA props; className/style/xstyle   | Extends the positioning wrapper.                              | omitted                     | public component API                     | stable    |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                      | Basis                                                 | Draft review state |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ------------------ |
| FR1 | Supported idle state MUST expose an enabled Button named by the start label and invoke `dictation.toggle` on activation. | shipped API and Button contract                       | verify             |
| FR2 | Supported listening state MUST expose the stop label and five aria-hidden visualizer bars derived from `bands`.          | shipped implementation and docs                       | verify             |
| FR3 | Unsupported state MUST render nothing by default. If explicitly retained, its Button MUST be disabled.                   | public option plus operability/accessibility repair   | settled            |
| FR4 | Clipping feedback MUST derive from portable semantic color tokens so a consumer theme can retint both endpoints.         | `architecture:theme-tokens/INV3` and lint enforcement | settled            |
| FR5 | Accepted ref, DOM/data/ARIA, className, style, and xstyle inputs MUST reach and compose on the root span.                | `architecture:public-component-api`                   | settled            |

### Allowed variation

- Callers may replace the translated start/stop label with `label`.
- Band amplitudes and clipping strength vary with the supplied dictation owner.
- Consumer themes may change the accent and error colors used by the bars.

## Accessibility contract

- The nested Button owns keyboard and pointer activation, focus, and disabled semantics.
- The equalizer is decorative and MUST remain hidden from the accessibility tree.
- The visible control MUST have a state-appropriate accessible label.
- An unsupported visible control MUST communicate disabled state and MUST NOT activate.
- Reduced-motion preference removes the equalizer's transition duration.

## Design relationships

- Idle uses the shared microphone Icon through Button.
- Listening bars begin at `--color-accent` and blend toward `--color-error` as clipping increases.
- The component adds no portable token or public theme target.
- Equalizer dimensions remain private component geometry.

## Responsive and bidirectional behavior

The control has fixed `sm` and `md` sizes and no viewport-owned behavior. Its
microphone glyph, centered bars, and block-axis scale are direction-neutral; the
verified-N/A ledger records this with source evidence.

## Family and system relationships

- ChatComposer owns placement through its `sendActions` slot.
- Button owns activation, focus, disabled semantics, hit target, and icon-only presentation.
- Icon owns the microphone glyph.
- `useChatDictation` and `useSpeechRecognition` own speech lifecycle and state.
- Theme token architecture owns the accent and error semantic roles.

## Verification map

| Contract                | Evidence                                                              |
| ----------------------- | --------------------------------------------------------------------- |
| FR1, labels, activation | `ChatDictationButton.test.tsx` idle activation and custom-label cases |
| FR2                     | listening structure test and Listening/Speaking stories               |
| FR3                     | unsupported hidden and visible-disabled tests/stories                 |
| FR4                     | clipping semantic-color test, lint, and Clipping story                |
| FR5                     | typed ref and root-passthrough test                                   |
| rendered states         | exact-head Storybook, a11y, and visual CI                             |
| RTL N/A                 | `apps/storybook/rtl-audit/verified-not-applicable.json`               |

## Decision log

| Decision                                                                           | Reason                                                                                    | Authority                                  |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| Keep unsupported dictation hidden by default and disabled when explicitly visible. | An unavailable action must not present as operable.                                       | objective accessibility/operability repair |
| Blend portable accent and error tokens for clipping.                               | Preserves the existing progressive clipping cue while keeping both endpoints theme-owned. | `architecture:theme-tokens/INV3`           |

## Open questions

None for this repair.

## Content boundary

Labels may be translated defaults or caller overrides. The component does not own transcript text, permission errors, microphone instructions, or product-specific voice-input guidance.
