// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file harness.ts
 * @input None (pure declarations)
 * @output The evidence-layer vocabulary and the Harness/Subject seam every
 *   expectation is written against.
 * @position The runtime seam of @astryxdesign/a11y-spec. One contract, many
 *   harnesses: a harness declares which evidence layers it can observe, and the
 *   runner refuses to run an expectation the harness cannot see.
 *
 * The layers and their boundaries are the ones in the accepted records:
 * `docs/specs/AST-020/spec.md` FR6 lists them; `docs/specs/AST-009/spec.md`
 * bounds what each one proves. The rule that makes them worth having is that a
 * lower layer may not claim a result only a higher layer observes — so jsdom
 * never reports a computed accessible name, and no automated layer ever reports
 * what a screen reader says.
 *
 * SYNC: A new harness implements this file and updates
 * - /internal/a11y-spec/README.md
 */

export const EVIDENCE_LAYERS = [
  'unit',
  'dom',
  'accessibility-tree',
  'axe',
  'real-browser',
  'visual',
  'lint',
  'manual',
  'real-at',
] as const;

export type EvidenceLayer = (typeof EVIDENCE_LAYERS)[number];

/**
 * What the browser computes for a node. Only an engine can answer this.
 *
 * Requiredness is deliberately absent: Chromium's protocol does not emit a
 * `required` property for a checkbox, so putting one here would be a field this
 * package could only ever fill with a guess. The switch contract reads that
 * declaration at the DOM layer instead.
 */
export interface ComputedNode {
  /** Computed role, e.g. `switch`. */
  readonly role: string | null;
  /** Computed accessible name. */
  readonly name: string;
  /** Computed accessible description. */
  readonly description: string;
  /** Computed checked state, or null when the node exposes none. */
  readonly checked: 'true' | 'false' | 'mixed' | null;
  readonly disabled: boolean;
  readonly invalid: boolean;
}

/** The element a binding designates as the pattern's control. */
export interface Subject {
  /** DOM layer: an attribute exactly as authored. */
  attribute(name: string): Promise<string | null>;
  /**
   * DOM layer: resolve an id-list attribute (`aria-describedby`,
   * `aria-labelledby`) to the text of each referenced element. A `null` entry
   * is an id that resolves to nothing — a description the user never gets.
   */
  idReferences(attribute: string): Promise<readonly (string | null)[]>;
  /** Accessibility-tree layer: what the engine computes for this node. */
  computed(): Promise<ComputedNode>;
  /** Real-browser layer: whether this node currently holds focus. */
  isFocused(): Promise<boolean>;
  /** Real-browser layer: move focus here the way a user's Tab would leave it. */
  focus(): Promise<void>;
}

/** A key an expectation can send. Spelled by intent, not by engine syntax. */
export type Key = 'Space' | 'Tab';

/**
 * A mounted binding, observed at whatever layers this runtime can honestly see.
 */
export interface Harness {
  /** Short runtime name, e.g. `jsdom` or `chromium`. Appears in every report row. */
  readonly name: string;
  /** The layers this harness can observe. Anything else is reported `unrun`. */
  readonly observes: readonly EvidenceLayer[];
  /** The element the binding designates as the pattern's control. */
  subject(): Promise<Subject>;
  /**
   * Real-browser layer: click the subject the way a pointer user would,
   * including the browser's own judgement that the control is there to be
   * clicked. `ignoreAvailability` drops that judgement, and exists for the one
   * case that needs it: proving a control the browser considers unavailable
   * still does not change when someone clicks it anyway.
   */
  click(
    subject: Subject,
    options?: {ignoreAvailability?: boolean},
  ): Promise<void>;
  /** Real-browser layer: send a key to whatever currently holds focus. */
  press(key: Key): Promise<void>;
  /** Real-browser layer: park focus at the document body, before the content. */
  resetFocus(): Promise<void>;
}

/**
 * Thrown when something asks a harness for an observation it cannot make. The
 * runner prevents this by checking `observes` first; the guard exists so a
 * harness can never quietly answer with a substitute from a lower layer.
 */
export class UnobservableError extends Error {
  constructor(harness: string, layer: EvidenceLayer, what: string) {
    super(
      `The ${harness} harness cannot observe the ${layer} layer, so it cannot report ${what}.`,
    );
    this.name = 'UnobservableError';
  }
}
