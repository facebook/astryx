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
  MissingHarnessRelation,
  UnobservableError,
  type Harness,
  type Subject,
  type EvidenceLayer,
} from '../harness';

/** What this harness can observe. Exported so a suite need not restate it. */
export const JSDOM_OBSERVES: readonly EvidenceLayer[] = ['unit', 'dom'];

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
    visibleIdReferences: async () =>
      unobservable(
        'real-browser',
        'whether referenced text is visibly rendered',
      ),
    labelText: async () => {
      const labelledBy = element.getAttribute('aria-labelledby');
      if (labelledBy != null && labelledBy.trim() !== '') {
        const text = (
          await Promise.all(
            labelledBy
              .split(/\s+/)
              .filter(Boolean)
              .map(
                async id =>
                  element.ownerDocument.getElementById(id)?.textContent ?? '',
              ),
          )
        )
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        return text === '' ? null : text;
      }
      const ariaLabel = element.getAttribute('aria-label')?.trim();
      if (ariaLabel != null && ariaLabel !== '') {
        return ariaLabel;
      }
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
      ) {
        const text = Array.from(element.labels ?? [])
          .map(label => label.textContent ?? '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        return text === '' ? null : text;
      }
      return null;
    },
    textValue: async () => {
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
      ) {
        return element.value;
      }
      return null;
    },
    textContent: async () =>
      (element.textContent ?? '').replace(/\s+/g, ' ').trim(),
    isConnected: async () => element.isConnected,
    textChangesDuring: async action => {
      const changes: string[] = [];
      const observer = new MutationObserver(() => {
        changes.push((element.textContent ?? '').replace(/\s+/g, ' ').trim());
      });
      observer.observe(element, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      try {
        await action();
        await Promise.resolve();
        return changes;
      } finally {
        observer.disconnect();
      }
    },
    computed: async () =>
      unobservable('accessibility-tree', 'a computed accessibility node'),
    visibleLabelText: async () =>
      unobservable('real-browser', 'what a label actually renders as'),
    isFocused: async () => unobservable('real-browser', 'real focus'),
    containsFocus: async () =>
      unobservable('real-browser', 'whether focus is inside a subject'),
    isModal: async () =>
      unobservable('real-browser', 'native modal top-layer state'),
    canReceivePointer: async () =>
      unobservable('real-browser', 'pointer reachability'),
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
  /** Public-semantic elements participating in a relationship expectation. */
  readonly related?: Readonly<Record<string, Element>>;
}

export function createJsdomHarness(options: JsdomHarnessOptions): Harness {
  const subject = createSubject(options.subject);
  return {
    name: HARNESS,
    observes: JSDOM_OBSERVES,
    subject: async () => subject,
    related: async name => {
      const element = options.related?.[name];
      if (element == null) {
        throw new MissingHarnessRelation(HARNESS, name);
      }
      return createSubject(element);
    },
    click: async () =>
      unobservable('real-browser', 'a real pointer activation'),
    abortedPress: async () =>
      unobservable('real-browser', 'a real pointer press'),
    typeText: async () =>
      unobservable('real-browser', 'real keyboard text entry'),
    clearText: async () =>
      unobservable('real-browser', 'real keyboard text deletion'),
    press: async () => unobservable('real-browser', 'a real key press'),
    resetFocus: async () => unobservable('real-browser', 'real focus'),
  };
}
