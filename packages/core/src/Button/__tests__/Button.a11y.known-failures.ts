// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Button.a11y.known-failures.ts
 * @input Uses KnownFailure from @astryxdesign/a11y-spec
 * @output BUTTON_KNOWN_FAILURES — the exact outcomes a component that adopts the
 *   button pattern does not deliver yet, each scoped to one expectation, one
 *   binding, one state, and one public issue.
 * @position Recorded debt, not permission. `docs/specs/AST-020/spec.md` FR12: a
 *   known failure runs, still fails, and stays exactly as narrow as it is. When
 *   the component is fixed the record stops matching and the run reports
 *   `unexpected-pass`, which gates — so a fix cannot land while leaving a stale
 *   record behind.
 *
 * A record is never a way to make a run green. It is a way to say, in public and
 * in one place, precisely what is broken and where the fix is being tracked.
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

const BUSY_FOCUS_ISSUE = 'https://github.com/facebook/astryx/issues/4871';
const CARD_POINTER_ISSUE = 'https://github.com/facebook/astryx/issues/6132';

export const BUTTON_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  // ---- Button and IconButton go natively disabled while busy --------------
  // One defect, four records: two components × the two outcomes it breaks.
  // They are written out rather than generated, because a record has to name
  // exactly one thing that is broken — a loop would make it easy to widen this
  // later without anyone noticing.
  {
    expectation: 'button.busy.keeps-focus',
    binding: 'Button',
    state: 'button-loading',
    evidenceLayer: 'real-browser',
    failureIncludes: 'cannot hold focus',
    userImpact:
      'A keyboard user who activates Save and waits is dropped to the top of the document the moment the action starts, with nothing to return them. The next Tab restarts from the beginning of the page.',
    issue: BUSY_FOCUS_ISSUE,
    reason:
      'Button sets the native disabled attribute while a clickAction is pending, and a natively disabled element cannot hold focus. Two fixes are already open against the issue; this contract records the outcome, and whichever one lands will turn these records into unexpected passes.',
  },
  {
    expectation: 'button.focus.reachable-and-escapable',
    binding: 'Button',
    state: 'button-loading',
    evidenceLayer: 'real-browser',
    failureIncludes: 'never reached the button',
    userImpact:
      'While the action is pending the button leaves the tab sequence entirely, so a keyboard user cannot get back to it — not to see that it is busy, and not to interrupt it.',
    issue: BUSY_FOCUS_ISSUE,
    reason:
      'The same native disabled attribute: a disabled element is not a tab stop.',
  },
  {
    expectation: 'button.busy.keeps-focus',
    binding: 'IconButton',
    state: 'icon-button-loading',
    evidenceLayer: 'real-browser',
    failureIncludes: 'cannot hold focus',
    userImpact:
      'The same drop, from an icon button — where it is worse, because an icon button is usually one of several in a row and the user loses their place among them.',
    issue: BUSY_FOCUS_ISSUE,
    reason:
      'IconButton is a thin wrapper over Button and inherits the behaviour exactly.',
  },
  {
    expectation: 'button.focus.reachable-and-escapable',
    binding: 'IconButton',
    state: 'icon-button-loading',
    evidenceLayer: 'real-browser',
    failureIncludes: 'never reached the button',
    userImpact:
      'The busy icon button leaves the tab sequence, so a keyboard user cannot return to it.',
    issue: BUSY_FOCUS_ISSUE,
    reason: 'Inherited from Button, as above.',
  },

  // ---- ClickableCard's role-bearing element cannot be clicked -------------
  {
    expectation: 'button.action.runs-on-pointer',
    binding: 'ClickableCard',
    state: 'clickable-card',
    evidenceLayer: 'real-browser',
    failureIncludes: 'a pointer could not reach this control',
    userImpact:
      "Anyone whose tooling acts on the accessible object rather than on pixels — a speech-input user saying the card's name, or assistive technology dispatching a click at the element it is told is the button — aims at a 1×1 control the card's own content paints over. A sighted mouse user is unaffected: they click the card surface, which handles it.",
    issue: CARD_POINTER_ISSUE,
    reason:
      'ClickableCard deliberately splits the surface that takes the click from the hidden button that carries the role and name. Reconciling the two is a design-system decision, not a change this contract should make.',
  },
];
