// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Button.a11y.known-failures.ts
 * @input Uses KnownFailure from @astryxdesign/a11y-spec
 * @output BUTTON_KNOWN_FAILURES — the exact outcomes a component that adopts the
 *   button pattern does not deliver yet, each scoped to one expectation, one
 *   binding, one state, and one exact public-safe failure record.
 * @position Recorded debt, not permission. `docs/specs/AST-021/spec.md` FR8–FR10
 *   govern this: FR8 requires every record to name the expectation, binding,
 *   state, user impact, standards reference, evidence layer, exact failure, and
 *   reason;
 *   FR9 is the exact gate — the expectation still RUNS and reports
 *   `known-failure`, never `pass`, and "a different error, another state, a new
 *   expectation, or a wider failure MUST fail". When the component is fixed the
 *   record stops matching and the run reports `unexpected-pass`, which gates, so
 *   a fix cannot land while leaving a stale record behind.
 *
 * A record is never a way to make a run green. It says, in public and in one
 * place, precisely what is broken; operational ownership stays outside source.
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

export const BUTTON_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  // ---- ClickableCard's role-bearing element cannot be clicked -------------
  {
    expectation: 'button.action.survives-an-aborted-press',
    binding: 'ClickableCard',
    state: 'clickable-card',
    evidenceLayer: 'real-browser',
    failureEquals:
      'a pointer press cannot land on this control: something else is on top of it at its own centre, so there is no press here to abort',
    standardsReference: 'WCAG 2.2 2.5.2 Pointer Cancellation (Level A)',
    userImpact:
      'The same defect seen from the other side: pointer cancellation cannot be demonstrated on a control no pointer press can land on. Recorded rather than reported green — a serene pass here would claim an outcome nobody observed.',
    reason:
      'Same cause as the record above. It is a second record rather than a wider one because a known failure names exactly one outcome, and these two would be fixed and verified separately.',
  },
  {
    expectation: 'button.action.runs-on-pointer',
    binding: 'ClickableCard',
    state: 'clickable-card',
    evidenceLayer: 'real-browser',
    failureEquals:
      'a pointer could not reach this control within 2000ms: the browser never found it visible, stable, and able to receive a pointer event. Something is covering it, or it is clipped to nothing.',
    standardsReference:
      'Current Astryx buttons family FR2 and WAI-ARIA APG Button operability requirement; supports WCAG 2.2 4.1.2 Name, Role, Value (Level A)',
    userImpact:
      "Anyone whose tooling acts on the accessible object rather than on pixels — a speech-input user saying the card's name, or assistive technology dispatching a click at the element it is told is the button — aims at a 1×1 control the card's own content paints over. A sighted mouse user is unaffected: they click the card surface, which handles it.",
    reason:
      'ClickableCard deliberately splits the surface that takes the click from the hidden button that carries the role and name. Reconciling the two is a design-system decision, not a change this contract should make.',
  },
];
