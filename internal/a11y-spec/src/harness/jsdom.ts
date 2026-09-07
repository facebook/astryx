// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file jsdom.ts
 * @input Uses ../harness (the seam) and a DOM element the binding designates
 * @output `createJsdomHarness` — a harness that observes the unit and DOM
 *   layers, and honestly refuses everything above them.
 * @position Fast lane. Runs inside the existing Vitest `ui` project, so a DOM
 *   regression is caught on every pull request without a browser.
 *
 * What this harness will NOT do is the point of it. jsdom renders markup; it
 * does not compute an accessibility tree, it does not resolve a real focus
 * order, and it does not dispatch the activation a browser derives from a key.
 * Every one of those is a higher layer (`docs/specs/AST-009/spec.md`), so this
 * harness declares that it cannot see them and the runner reports `unrun`
 * instead of quietly answering from the markup.
 *
 * SYNC: Keep the observed-layer list honest. Adding a layer here is a claim
 *   that jsdom can actually observe it.
 */

import {
  UnobservableError,
  type Harness,
  type Subject,
  type EvidenceLayer,
} from '../harness';

const OBSERVES: readonly EvidenceLayer[] = ['unit', 'dom'];

/** What this harness can observe. Exported so a suite need not restate it. */
export const JSDOM_OBSERVES = OBSERVES;

const HARNESS = 'jsdom';

function unobservable(layer: EvidenceLayer, what: string): never {
  throw new UnobservableError(HARNESS, layer, what);
}

function createSubject(element: Element): Subject {
  return {
    attribute: async name => element.getAttribute(name),
    idReferences: async attribute => {
      // The same walk exists in the Chromium harness. It is not shared: that
      // copy is serialized into the page by Playwright, so it cannot close over
      // an import from this package.
      const value = element.getAttribute(attribute);
      if (value == null || value.trim() === '') {
        return [];
      }
      return value
        .split(/\s+/)
        .filter(Boolean)
        .map(id => {
          const target = element.ownerDocument.getElementById(id);
          return target == null ? null : (target.textContent ?? '').trim();
        });
    },
    computed: async () =>
      unobservable('accessibility-tree', 'a computed accessibility node'),
    isFocused: async () => unobservable('real-browser', 'real focus'),
    focus: async () => unobservable('real-browser', 'real focus'),
  };
}

export interface JsdomHarnessOptions {
  /**
   * The element the binding designates as the pattern's control. The binding
   * resolves it — by role for a conforming component, or by a fixture-owned
   * hook for a deliberately violating fixture, so that a mutation flips exactly
   * the expectation under test instead of making the subject unfindable.
   */
  readonly subject: Element;
}

export function createJsdomHarness(options: JsdomHarnessOptions): Harness {
  const subject = createSubject(options.subject);
  return {
    name: HARNESS,
    observes: OBSERVES,
    subject: async () => subject,
    click: async () =>
      unobservable('real-browser', 'a real pointer activation'),
    press: async () => unobservable('real-browser', 'a real key press'),
    resetFocus: async () => unobservable('real-browser', 'real focus'),
  };
}
