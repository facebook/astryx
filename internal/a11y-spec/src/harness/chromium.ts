// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chromium.ts
 * @input Uses a Playwright `Page` and a `Locator` for the subject, and the
 *   Chrome DevTools Protocol accessibility domain behind them
 * @output `createChromiumHarness` — a harness that observes the DOM,
 *   accessibility-tree, and real-browser layers of a page rendered by a real
 *   shipping engine — plus `holdMotionStill`, the page setup its specs share.
 * @position The high-fidelity lane. Imported only from the Playwright specs, so
 *   the jsdom lane never loads Playwright: this file is the package's separate
 *   `@astryxdesign/a11y-spec/chromium` entry point, never re-exported from
 *   ../index.ts.
 *
 * The accessibility tree here is the ENGINE's, read through
 * `Accessibility.getPartialAXTree`, not a DOM approximation. That is the whole
 * reason this harness exists: `docs/specs/AST-009/spec.md` bounds the DOM layer
 * to "author-supplied ARIA relationships" and reserves computed role, name,
 * description, and state for the accessibility-tree layer. Chromium is where
 * Astryx can actually observe them.
 *
 * What it still does NOT prove is what an assistive technology says. Speech,
 * braille, announcement timing, and virtual-cursor entry are the real-AT layer,
 * and no harness in this package reports them.
 *
 * SYNC: Keep the observed-layer list honest, and keep the method surface equal
 *   to ../harness/jsdom.ts — both implement Harness in ../harness.ts.
 */

import type {CDPSession, Locator, Page} from '@playwright/test';
import {
  type ComputedNode,
  type EvidenceLayer,
  type Harness,
  type Key,
  type Subject,
} from '../harness';

/** What this harness can observe. Exported so a suite need not restate it. */
export const CHROMIUM_OBSERVES: readonly EvidenceLayer[] = [
  'unit',
  'dom',
  'accessibility-tree',
  'real-browser',
];

const KEYS: Record<Key, string> = {
  Space: ' ',
  Tab: 'Tab',
};

interface AxValue {
  readonly value?: unknown;
}

interface AxProperty {
  readonly name: string;
  readonly value?: AxValue;
}

interface AxNode {
  readonly ignored?: boolean;
  readonly role?: AxValue;
  readonly name?: AxValue;
  readonly description?: AxValue;
  readonly backendDOMNodeId?: number;
  readonly properties?: readonly AxProperty[];
}

function text(value: AxValue | undefined): string {
  return typeof value?.value === 'string' ? value.value : '';
}

function property(node: AxNode, name: string): unknown {
  return node.properties?.find(candidate => candidate.name === name)?.value
    ?.value;
}

function flag(node: AxNode, name: string): boolean {
  const value = property(node, name);
  // The protocol is not consistent about booleans across property names, so
  // accept every spelling of true rather than silently reading a set flag as
  // unset.
  return value === true || value === 'true' || value === 1;
}

const AX_TARGET_ATTRIBUTE = 'data-a11y-spec-ax-target';

/**
 * The engine's own accessibility node for the subject.
 *
 * Playwright's `ariaSnapshot` renders role and name, but not the invalid state
 * a field contract needs, so this reads the protocol directly. The protocol addresses DOM nodes by id, and the page is on the far
 * side of the bridge, so the subject is marked with a data attribute for the
 * length of the query and unmarked afterwards. A data attribute takes no part
 * in accessibility computation, so marking it cannot change the answer.
 *
 * An element the engine leaves out of the tree comes back `ignored`, and is
 * reported as exposing nothing rather than as absent state.
 */
async function computedNode(
  cdp: CDPSession,
  locator: Locator,
): Promise<ComputedNode> {
  await locator.evaluate(
    (element, attribute) => element.setAttribute(attribute, ''),
    AX_TARGET_ATTRIBUTE,
  );
  try {
    const {root} = (await cdp.send('DOM.getDocument', {
      depth: 0,
    })) as unknown as {
      root: {nodeId: number};
    };
    const {nodeId} = (await cdp.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: `[${AX_TARGET_ATTRIBUTE}]`,
    })) as unknown as {nodeId: number};

    if (nodeId === 0) {
      throw new Error('the subject is not in the document');
    }

    const {nodes} = (await cdp.send('Accessibility.getPartialAXTree', {
      nodeId,
      fetchRelatives: false,
    })) as unknown as {nodes: readonly AxNode[]};

    const node = nodes[0];

    if (node == null || node.ignored === true) {
      return {
        role: null,
        name: '',
        description: '',
        checked: null,
        disabled: false,
        invalid: false,
      };
    }

    const checked = property(node, 'checked');
    const invalid = property(node, 'invalid');

    return {
      role: text(node.role) === '' ? null : text(node.role),
      name: text(node.name),
      description: text(node.description),
      checked:
        checked === 'true' || checked === true
          ? 'true'
          : checked === 'false' || checked === false
            ? 'false'
            : checked === 'mixed'
              ? 'mixed'
              : null,
      disabled: flag(node, 'disabled'),
      invalid: invalid != null && invalid !== 'false' && invalid !== false,
    };
  } finally {
    await locator.evaluate(
      (element, attribute) => element.removeAttribute(attribute),
      AX_TARGET_ATTRIBUTE,
    );
  }
}

/**
 * Stop transitions before an expectation reads state, so nothing measures a
 * frame the animation happens to be showing.
 *
 * This is a page call rather than configuration on purpose. Playwright's
 * `use: {reducedMotion: 'reduce'}` and Chromium's own
 * `--force-prefers-reduced-motion` flag both leave
 * `matchMedia('(prefers-reduced-motion: reduce)')` FALSE in this version —
 * measured, not assumed — so either one would read like a safeguard while doing
 * nothing. `emulateMedia` takes effect immediately and can be checked.
 */
export async function holdMotionStill(page: Page): Promise<void> {
  await page.emulateMedia({reducedMotion: 'reduce'});
}

export interface ChromiumHarnessOptions {
  readonly page: Page;
  /**
   * The element the binding designates as the pattern's control. The binding
   * resolves it — by role for a conforming component, or by a fixture-owned
   * hook for a deliberately violating fixture, so a mutation flips exactly the
   * expectation under test.
   */
  readonly subject: Locator;
  /** A CDP session on `page`, reused across expectations. */
  readonly cdp: CDPSession;
}

export function createChromiumHarness(
  options: ChromiumHarnessOptions,
): Harness {
  const {page, subject: locator, cdp} = options;

  const subject: Subject = {
    attribute: name => locator.getAttribute(name),
    idReferences: attribute =>
      // The same walk exists in the jsdom harness. It is not shared: Playwright
      // serializes this function into the page, so it cannot close over an
      // import from this package.
      locator.evaluate(
        (element, name) =>
          (element.getAttribute(name) ?? '')
            .split(/\s+/)
            .filter(Boolean)
            .map(id => {
              const target = element.ownerDocument.getElementById(id);
              return target == null ? null : (target.textContent ?? '').trim();
            }),
        attribute,
      ),
    computed: () => computedNode(cdp, locator),
    visibleLabelText: () =>
      locator.evaluate(element => {
        // Whether a person can actually read this text.
        //
        // Two questions, because no single API answers both.
        //
        // `checkVisibility` is the platform's own answer to "is this rendered
        // at all", and it walks ancestors — so a label inside a
        // `visibility: hidden`, `opacity: 0`, or `display: none` wrapper is
        // correctly invisible without this code reimplementing the cascade.
        //
        // What it cannot answer is whether anything of the element actually
        // lands on screen: every sr-only recipe stays "visible" to it. So the
        // element is sampled — if a point over it resolves to the element, to
        // something inside it, or to something COVERING it, the element paints
        // there. If every sample resolves to one of the element's own
        // ancestors, nothing of it paints: it is clipped away, whatever its box
        // says. If a sample resolves to nothing at all, that point is outside
        // the viewport.
        //
        // Occlusion is deliberately not hiding: a label under an overlay is
        // still a label a person can read when the overlay moves, and treating
        // it as hidden would silently switch off the criterion that reads it.
        const paints = (node: Element): boolean => {
          if (
            !node.checkVisibility({
              visibilityProperty: true,
              opacityProperty: true,
              contentVisibilityAuto: true,
            })
          ) {
            return false;
          }
          const box = node.getBoundingClientRect();
          const samples: ReadonlyArray<readonly [number, number]> = [
            [box.x + box.width / 2, box.y + box.height / 2],
            [box.x + 1, box.y + box.height / 2],
            [box.right - 1, box.y + box.height / 2],
          ];
          return samples.some(([x, y]) => {
            const at = node.ownerDocument.elementFromPoint(x, y);
            if (at == null) {
              // Outside the viewport, so nothing is there to read.
              return false;
            }
            return at === node || node.contains(at) || !at.contains(node);
          });
        };
        const textOf = (node: Element): string | null => {
          const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
          return text !== '' && paints(node) ? text : null;
        };

        // The platform's own labelling order, not any design system's.
        const labelledBy = element.getAttribute('aria-labelledby');
        if (labelledBy != null && labelledBy.trim() !== '') {
          const parts = labelledBy
            .split(/\s+/)
            .filter(Boolean)
            .map(id => element.ownerDocument.getElementById(id))
            .flatMap(target => (target == null ? [] : [textOf(target)]))
            .filter((text): text is string => text != null);
          return parts.length === 0 ? null : parts.join(' ');
        }
        const id = element.getAttribute('id');
        const associated =
          id == null || id === ''
            ? null
            : element.ownerDocument.querySelector(
                // An id is author-supplied and need not be a bare identifier.
                `label[for="${CSS.escape(id)}"]`,
              );
        const wrapping = element.closest('label');
        for (const label of [associated, wrapping]) {
          if (label != null) {
            const text = textOf(label);
            if (text != null) {
              return text;
            }
          }
        }
        // A control that labels itself, e.g. a div with role=switch.
        return textOf(element);
      }),
    isFocused: () =>
      locator.evaluate(
        element => element.ownerDocument.activeElement === element,
      ),
    focus: () => locator.focus(),
  };

  return {
    name: 'chromium',
    observes: CHROMIUM_OBSERVES,
    subject: async () => subject,
    click: async (_subject, options) => {
      // Without `force`, Playwright first satisfies itself that the control is
      // visible, stable, enabled, and actually receives pointer events — so an
      // ordinary click here also proves a pointer could reach the switch.
      // `ignoreAvailability` skips that judgement, which is the only way to ask
      // a control the browser calls unavailable what it does when clicked
      // anyway.
      await locator.click({force: options?.ignoreAvailability === true});
    },
    abortedPress: async () => {
      const box = await locator.boundingBox();
      if (box == null) {
        throw new Error('the subject has no box to press on');
      }
      const viewport = await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
      }));
      // Release clear of the control but still inside the viewport: a gesture
      // that ends out of bounds is not one the browser reports. Which way to
      // go is decided per axis by whichever side has more room, so a control
      // flush against an edge does not push the release back INSIDE its own box
      // — which would be a completed click, and would fail a switch that is
      // behaving correctly.
      const away = (start: number, end: number, limit: number): number => {
        const before = start;
        const after = limit - end;
        return before > after
          ? Math.max(1, start - 200)
          : Math.min(limit - 1, end + 200);
      };
      const releaseX = away(box.x, box.x + box.width, viewport.width);
      const releaseY = away(box.y, box.y + box.height, viewport.height);
      const insideTheControl =
        releaseX >= box.x &&
        releaseX <= box.x + box.width &&
        releaseY >= box.y &&
        releaseY <= box.y + box.height;
      if (insideTheControl) {
        throw new Error(
          'the viewport leaves nowhere to release a press outside this control, so an aborted press cannot be performed here',
        );
      }
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(releaseX, releaseY);
      await page.mouse.up();
    },
    press: async key => {
      await page.keyboard.press(KEYS[key]);
    },
    resetFocus: async () => {
      await page.evaluate(() => {
        const active = document.activeElement;
        if (active instanceof HTMLElement) {
          active.blur();
        }
      });
    },
  };
}
