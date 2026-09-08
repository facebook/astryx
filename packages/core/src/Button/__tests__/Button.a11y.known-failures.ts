// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Button.a11y.known-failures.ts
 * @input Uses KnownFailure from @astryxdesign/a11y-spec
 * @output BUTTON_KNOWN_FAILURES — the exact outcomes a component that adopts the
 *   button pattern does not deliver yet, each scoped to one expectation, one
 *   binding, one state, and one public issue.
 * @position Recorded debt, not permission. `docs/specs/AST-021/spec.md` FR8–FR10
 *   govern this: FR8 requires every record to name the expectation, binding,
 *   state, user impact, evidence layer, issue, and reason; FR9 is the exact
 *   gate — the expectation still RUNS and reports `known-failure`, never
 *   `pass`, and "a different error, another state, a new expectation, or a
 *   wider failure MUST fail". When the component is fixed the record stops
 *   matching and the run reports `unexpected-pass`, which gates, so a fix
 *   cannot land while leaving a stale record behind.
 *
 * A record is never a way to make a run green. It is a way to say, in public and
 * in one place, precisely what is broken and where the fix is being tracked.
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

const BUSY_FOCUS_ISSUE = 'https://github.com/facebook/astryx/issues/4871';
const CARD_POINTER_ISSUE = 'https://github.com/facebook/astryx/issues/6132';

export const BUTTON_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  // ---- Button and IconButton go natively disabled while busy --------------
  // One defect, one record per component.
  // They are written out rather than generated, because a record has to name
  // exactly one thing that is broken — a loop would make it easy to widen this
  // later without anyone noticing.
  {
    expectation: 'button.focus.reachable-and-escapable',
    binding: 'Button',
    state: 'button-loading',
    evidenceLayer: 'real-browser',
    failureEquals:
      '10 presses of Tab from the start of the document never reached the button, so a keyboard user cannot get to this action',
    userImpact:
      'A keyboard user who activates Save and waits is dropped to the top of the document the moment the action starts, and the button leaves the tab sequence entirely — so they cannot get back to it, to see that it is busy or to interrupt it. The next Tab restarts from the beginning of the page.',
    issue: BUSY_FOCUS_ISSUE,
    reason:
      'Button sets the native disabled attribute while a clickAction is pending. A natively disabled element is neither focusable nor a tab stop. Two fixes are already open against the issue; whichever lands turns this record into an unexpected pass.',
  },
  {
    expectation: 'button.focus.reachable-and-escapable',
    binding: 'IconButton',
    state: 'icon-button-loading',
    evidenceLayer: 'real-browser',
    failureEquals:
      '10 presses of Tab from the start of the document never reached the button, so a keyboard user cannot get to this action',
    userImpact:
      'The same drop from an icon button, where it is worse: an icon button is usually one of several in a row, so the user loses their place among them.',
    issue: BUSY_FOCUS_ISSUE,
    reason:
      'IconButton is a thin wrapper over Button and inherits the behaviour exactly.',
  },

  {
    expectation: 'button.unavailable.inert',
    binding: 'Button',
    state: 'button-loading',
    evidenceLayer: 'real-browser',
    failureEquals:
      'this state is declared focusable so its reason stays reachable, but it cannot take focus — so a keyboard user can neither read why it is unavailable nor reach it to confirm it refuses to act',
    userImpact:
      'The third face of the same defect: because the busy button cannot take focus, there is no way to confirm from the keyboard that it declines a second press — the user can neither reach it nor see why it is unavailable.',
    issue: BUSY_FOCUS_ISSUE,
    reason:
      'Same native disabled attribute. Recorded separately because a record names exactly one outcome, and a fix that restored focus without keeping the button inert would satisfy one of these and not the other.',
  },
  {
    expectation: 'button.unavailable.inert',
    binding: 'IconButton',
    state: 'icon-button-loading',
    evidenceLayer: 'real-browser',
    failureEquals:
      'this state is declared focusable so its reason stays reachable, but it cannot take focus — so a keyboard user can neither read why it is unavailable nor reach it to confirm it refuses to act',
    userImpact: 'The same, from an icon button.',
    issue: BUSY_FOCUS_ISSUE,
    reason: 'Inherited from Button, as above.',
  },

  // ---- ClickableCard's role-bearing element cannot be clicked -------------
  {
    expectation: 'button.action.survives-an-aborted-press',
    binding: 'ClickableCard',
    state: 'clickable-card',
    evidenceLayer: 'real-browser',
    failureEquals:
      'a pointer press cannot land on this control: something else is on top of it at its own centre, so there is no press here to abort',
    userImpact:
      'The same defect seen from the other side: pointer cancellation cannot be demonstrated on a control no pointer press can land on. Recorded rather than reported green — a serene pass here would claim an outcome nobody observed.',
    issue: CARD_POINTER_ISSUE,
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
    userImpact:
      "Anyone whose tooling acts on the accessible object rather than on pixels — a speech-input user saying the card's name, or assistive technology dispatching a click at the element it is told is the button — aims at a 1×1 control the card's own content paints over. A sighted mouse user is unaffected: they click the card surface, which handles it.",
    issue: CARD_POINTER_ISSUE,
    reason:
      'ClickableCard deliberately splits the surface that takes the click from the hidden button that carries the role and name. Reconciling the two is a design-system decision, not a change this contract should make.',
  },
];
