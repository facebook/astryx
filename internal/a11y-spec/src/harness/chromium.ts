// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chromium.ts
 * @input Uses a Playwright `Page`, the semantic subject `Locator`, optional
 *   binding-owned pointer-target and visible-label `Locator`s, and the Chrome
 *   DevTools Protocol accessibility domain behind them
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

import {errors as playwrightErrors} from '@playwright/test';
import type {CDPSession, Locator, Page} from '@playwright/test';
import {
  MissingHarnessRelation,
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

/**
 * How long a pointer gets to reach a control before the attempt is a failure.
 *
 * Generous for a control that is reachable at all — Playwright's actionability
 * check normally settles in single-digit milliseconds — and short enough that a
 * control a pointer can never reach reports why instead of hanging.
 */
const POINTER_REACH_BUDGET_MS = 2_000;

/**
 * Playwright's own timeout type, rather than a regex over the message: the
 * message is prose that can be reworded in any release, and matching it would
 * turn a wording change into a mystery failure.
 */
function isTimeout(error: unknown): boolean {
  return error instanceof playwrightErrors.TimeoutError;
}

async function canReceivePointer(locator: Locator): Promise<boolean> {
  try {
    await locator.click({trial: true, timeout: POINTER_REACH_BUDGET_MS});
    return true;
  } catch (error) {
    if (isTimeout(error)) {
      return false;
    }
    throw error;
  }
}

const KEYS: Record<Key, string> = {
  Space: ' ',
  Enter: 'Enter',
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
  readonly value?: AxValue;
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

function optionalFlag(node: AxNode, name: string): boolean | null {
  const value = property(node, name);
  if (value === true || value === 'true' || value === 1) {
    return true;
  }
  if (value === false || value === 'false' || value === 0) {
    return false;
  }
  return null;
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
        live: null,
        atomic: null,
        value: null,
        rangeValue: null,
        rangeMin: null,
        rangeMax: null,
        valueText: null,
        modal: null,
        multiline: null,
        readOnly: null,
        required: null,
        checked: null,
        disabled: false,
        invalid: false,
      };
    }

    const role = text(node.role);
    const live = property(node, 'live');
    const checked = property(node, 'checked');
    const invalid = property(node, 'invalid');
    const exposedValue = node.value?.value;

    return {
      role: role === '' ? null : role,
      name: text(node.name),
      description: text(node.description),
      live:
        live === 'off' || live === 'polite' || live === 'assertive'
          ? live
          : null,
      atomic: optionalFlag(node, 'atomic'),
      value:
        typeof exposedValue === 'string'
          ? exposedValue
          : role === 'textbox'
            ? ''
            : null,
      rangeValue: typeof exposedValue === 'number' ? exposedValue : null,
      rangeMin:
        typeof property(node, 'valuemin') === 'number'
          ? (property(node, 'valuemin') as number)
          : null,
      rangeMax:
        typeof property(node, 'valuemax') === 'number'
          ? (property(node, 'valuemax') as number)
          : null,
      valueText:
        typeof property(node, 'valuetext') === 'string'
          ? (property(node, 'valuetext') as string)
          : null,
      modal: optionalFlag(node, 'modal'),
      multiline: optionalFlag(node, 'multiline'),
      readOnly: optionalFlag(node, 'readonly'),
      required: optionalFlag(node, 'required'),
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

type ResolvedElementHandle = NonNullable<
  Awaited<ReturnType<Locator['elementHandle']>>
>;

async function observeTextChangesDuring(
  page: Page,
  element: ResolvedElementHandle,
  action: () => void | Promise<void>,
): Promise<readonly string[]> {
  await element.evaluate(node => {
    const target = node as Element & {
      __astryxA11ySpecTextObservation?: {
        changes: string[];
        observer: MutationObserver;
      };
    };
    const changes: string[] = [];
    const observer = new MutationObserver(() => {
      changes.push((node.textContent ?? '').replace(/\s+/g, ' ').trim());
    });
    observer.observe(node, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    target.__astryxA11ySpecTextObservation = {changes, observer};
  });

  const finish = () =>
    element.evaluate(node => {
      const target = node as Element & {
        __astryxA11ySpecTextObservation?: {
          changes: string[];
          observer: MutationObserver;
        };
      };
      const observation = target.__astryxA11ySpecTextObservation;
      if (observation == null) {
        throw new Error('the status text observation was lost');
      }
      if (observation.observer.takeRecords().length > 0) {
        observation.changes.push(
          (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
        );
      }
      observation.observer.disconnect();
      delete target.__astryxA11ySpecTextObservation;
      return observation.changes;
    });

  try {
    await action();
    await page.evaluate(
      async () =>
        new Promise<void>(resolve => requestAnimationFrame(() => resolve())),
    );
    return await finish();
  } catch (error) {
    await finish().catch(() => {});
    throw error;
  }
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
  /** The surface that receives pointer input when it differs from the semantic node. */
  readonly pointerTarget?: Locator;
  /** A binding-owned visible label when it is not the subject's DOM label. Null means this state deliberately has no visible label. */
  readonly visibleLabel?: Locator | null;
  /** A CDP session on `page`, reused across expectations. */
  readonly cdp: CDPSession;
  /** Public-semantic elements participating in relationship expectations. */
  readonly related?: Readonly<Record<string, Locator>>;
}

export function createChromiumHarness(
  options: ChromiumHarnessOptions,
): Harness {
  const {page, subject: locator, pointerTarget, cdp, visibleLabel} = options;
  const pointerLocator = pointerTarget ?? locator;
  let initialElement: ReturnType<Locator['elementHandle']> | undefined;
  const capturedElement = () => {
    initialElement ??= locator.elementHandle();
    return initialElement;
  };

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
    visibleIdReferences: attribute =>
      locator.evaluate((element, name) => {
        const isTransparentBox = (node: Element): boolean =>
          getComputedStyle(node).display === 'contents';
        const rendered = (node: Element): boolean => {
          if (isTransparentBox(node)) {
            return true;
          }
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
          return box.width > 1 && box.height > 1;
        };
        const textIsReadable = (node: Element): boolean =>
          !/^rgba\(.*,\s*0\)$/.test(getComputedStyle(node).color);
        const paints = (node: Element): boolean => {
          if (!rendered(node)) {
            return false;
          }
          if (isTransparentBox(node)) {
            return true;
          }
          const box = node.getBoundingClientRect();
          const inlineStyle = (node as HTMLElement).style;
          const pointerTransparent =
            getComputedStyle(node).pointerEvents === 'none';
          const originalPointerEvents =
            inlineStyle.getPropertyValue('pointer-events');
          const originalPriority =
            inlineStyle.getPropertyPriority('pointer-events');
          if (pointerTransparent) {
            inlineStyle.setProperty('pointer-events', 'auto', 'important');
          }
          try {
            const samples: ReadonlyArray<readonly [number, number]> = [
              [box.x + box.width / 2, box.y + box.height / 2],
              [box.x + 1, box.y + box.height / 2],
              [box.right - 1, box.y + box.height / 2],
            ];
            return samples.some(([x, y]) => {
              const at = node.ownerDocument.elementFromPoint(x, y);
              return at != null && (at === node || node.contains(at));
            });
          } finally {
            if (pointerTransparent) {
              if (originalPointerEvents === '') {
                inlineStyle.removeProperty('pointer-events');
              } else {
                inlineStyle.setProperty(
                  'pointer-events',
                  originalPointerEvents,
                  originalPriority,
                );
              }
            }
          }
        };
        const visibleTextOf = (node: Element): string => {
          if (!paints(node)) {
            return '';
          }
          let value = '';
          for (const child of node.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
              if (textIsReadable(node)) {
                value += child.nodeValue ?? '';
              }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              value += ` ${visibleTextOf(child as Element)} `;
            }
          }
          return value.replace(/\s+/g, ' ').trim();
        };

        return (element.getAttribute(name) ?? '')
          .split(/\s+/)
          .filter(Boolean)
          .map(id => {
            const target = element.ownerDocument.getElementById(id);
            if (target == null) {
              return null;
            }
            const text = visibleTextOf(target);
            return text === '' ? null : text;
          });
      }, attribute),
    labelText: () =>
      locator.evaluate(element => {
        const labelledBy = element.getAttribute('aria-labelledby');
        if (labelledBy != null && labelledBy.trim() !== '') {
          const text = labelledBy
            .split(/\s+/)
            .filter(Boolean)
            .map(
              id => element.ownerDocument.getElementById(id)?.textContent ?? '',
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
      }),
    textValue: () =>
      locator.evaluate(element => {
        if (
          element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement
        ) {
          return element.value;
        }
        return null;
      }),
    textContent: async () => {
      const element = await capturedElement();
      if (element == null) {
        throw new Error('the subject is not in the document');
      }
      return element.evaluate(node =>
        (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
      );
    },
    isConnected: async () => {
      const element = await capturedElement();
      return element != null && element.evaluate(node => node.isConnected);
    },
    textChangesDuring: async action => {
      const element = await capturedElement();
      if (element == null) {
        throw new Error('the subject is not in the document');
      }
      return observeTextChangesDuring(page, element, action);
    },
    computed: () => computedNode(cdp, locator),
    visibleLabelText: async () => {
      if (visibleLabel === null) {
        return null;
      }
      const explicitLabel =
        visibleLabel === undefined ? null : await visibleLabel.elementHandle();
      try {
        return await locator.evaluate((element, explicitLabel) => {
          // Whether a person can actually read this text. Two questions, because
          // no single API answers both.
          //
          // `checkVisibility` is the platform's own answer to "is this rendered
          // at all", and it walks ancestors — so a node inside a
          // `visibility: hidden`, `opacity: 0`, or `display: none` wrapper is
          // correctly invisible without this code reimplementing the cascade.
          // What it cannot answer is whether anything of the node LANDS on
          // screen: every sr-only recipe stays "visible" to it. Hence the box.
          /**
           * A wrapper that generates no box of its own and lets its children lay
           * out as if it were not there. Judging it by its own box would be
           * wrong twice over: it has none, and its children may be perfectly
           * readable. Astryx wraps button content in one, so this is not an edge
           * case — it is the common path.
           */
          const isTransparentBox = (node: Element): boolean =>
            getComputedStyle(node).display === 'contents';

          const rendered = (node: Element): boolean => {
            if (isTransparentBox(node)) {
              // Nothing to judge here; each child is judged on its own.
              return true;
            }
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
            // The sr-only recipe: clipped to a 1px box, still in the tree.
            return box.width > 1 && box.height > 1;
          };

          /**
           * Whether text sitting directly in this node can be read.
           *
           * Separate from `rendered` because `color` inherits but is overridable:
           * a transparent wrapper whose child re-colours its own text is showing
           * that child's words, and judging the wrapper would erase them. So this
           * asks only about the node the text is actually in.
           *
           * Astryx dims a button's label with `color: transparent` while it waits
           * on an action, so this is a real case, not a hypothetical one.
           */
          const textIsReadable = (node: Element): boolean =>
            !/^rgba\(.*,\s*0\)$/.test(getComputedStyle(node).color);

          /**
           * Whether the label element as a whole paints anywhere.
           *
           * Sampling catches the case the box cannot: a FULL-SIZE element clipped
           * away entirely (`clip-path: inset(100%)`), which keeps its box and
           * stays "visible" to the platform. If a point over it resolves to the
           * element, to something inside it, or to something covering it, it
           * paints there; if every sample resolves to one of its own ancestors,
           * nothing of it paints.
           *
           * Applied only to the element being measured, never to its descendants:
           * a span inside a button legitimately hit-tests to the button, and
           * treating that as hidden would erase every nested label.
           *
           * Occlusion is deliberately not hiding: a label under an overlay is
           * still a label a person can read when the overlay moves.
           */
          const paints = (node: Element): boolean => {
            if (!rendered(node)) {
              return false;
            }
            if (isTransparentBox(node)) {
              // No box to sample; whether anything shows is up to the children.
              return true;
            }
            const box = node.getBoundingClientRect();
            const inlineStyle = (node as HTMLElement).style;
            const pointerTransparent =
              getComputedStyle(node).pointerEvents === 'none';
            const originalPointerEvents =
              inlineStyle.getPropertyValue('pointer-events');
            const originalPriority =
              inlineStyle.getPropertyPriority('pointer-events');
            if (pointerTransparent) {
              // Hit testing normally skips pointer-transparent labels even though
              // they paint. Temporarily make only this node targetable so the
              // same paint sampling still distinguishes visible text from a
              // fully clipped box.
              inlineStyle.setProperty('pointer-events', 'auto', 'important');
            }
            try {
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
            } finally {
              if (pointerTransparent) {
                if (originalPointerEvents === '') {
                  inlineStyle.removeProperty('pointer-events');
                } else {
                  inlineStyle.setProperty(
                    'pointer-events',
                    originalPointerEvents,
                    originalPriority,
                  );
                }
              }
            }
          };

          // The text a person can actually READ inside this node.
          //
          // Not `textContent`: a control commonly carries a visually-hidden live
          // region or an sr-only span inside it, and counting that text would
          // report words nobody sees — which then reads as a label mismatch
          // against a name that (correctly) does not contain them. So the walk
          // descends and drops any subtree that is not rendered.
          const visibleTextOf = (node: Element): string => {
            let text = '';
            for (const child of node.childNodes) {
              if (child.nodeType === Node.TEXT_NODE) {
                if (textIsReadable(node)) {
                  text += child.nodeValue ?? '';
                }
              } else if (
                child.nodeType === Node.ELEMENT_NODE &&
                rendered(child as Element)
              ) {
                text += ` ${visibleTextOf(child as Element)} `;
              }
            }
            return text.replace(/\s+/g, ' ').trim();
          };
          const textOf = (node: Element): string | null => {
            if (!paints(node)) {
              return null;
            }
            const text = visibleTextOf(node);
            return text === '' ? null : text;
          };

          if (explicitLabel != null) {
            return textOf(explicitLabel);
          }

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
        }, explicitLabel);
      } finally {
        await explicitLabel?.dispose();
      }
    },
    isFocused: () =>
      locator.evaluate(
        element => element.ownerDocument.activeElement === element,
      ),
    containsFocus: () =>
      locator.evaluate(element => {
        const active = element.ownerDocument.activeElement;
        return (
          active != null && (active === element || element.contains(active))
        );
      }),
    isModal: () => locator.evaluate(element => element.matches(':modal')),
    canReceivePointer: () => canReceivePointer(locator),
    focus: () => locator.focus(),
  };

  const relatedSubject = (name: string): Subject => {
    const related = options.related?.[name];
    if (related == null) {
      throw new MissingHarnessRelation('chromium', name);
    }
    return {
      attribute: attribute => related.getAttribute(attribute),
      idReferences: attribute =>
        related.evaluate(
          (element, relation) =>
            (element.getAttribute(relation) ?? '')
              .split(/\s+/)
              .filter(Boolean)
              .map(id => {
                const target = element.ownerDocument.getElementById(id);
                return target == null
                  ? null
                  : (target.textContent ?? '').trim();
              }),
          attribute,
        ),
      visibleIdReferences: attribute =>
        related.evaluate(
          (element, relation) =>
            (element.getAttribute(relation) ?? '')
              .split(/\s+/)
              .filter(Boolean)
              .map(id => {
                const target = element.ownerDocument.getElementById(id);
                if (target == null || !target.checkVisibility()) {
                  return null;
                }
                const text = (target.textContent ?? '')
                  .replace(/\s+/g, ' ')
                  .trim();
                return text === '' ? null : text;
              }),
          attribute,
        ),
      labelText: () =>
        related.evaluate(element => {
          const labelledBy = element.getAttribute('aria-labelledby');
          if (labelledBy != null && labelledBy.trim() !== '') {
            const text = labelledBy
              .split(/\s+/)
              .filter(Boolean)
              .map(
                id =>
                  element.ownerDocument.getElementById(id)?.textContent ?? '',
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
        }),
      textValue: () =>
        related.evaluate(element => {
          if (
            element instanceof HTMLInputElement ||
            element instanceof HTMLTextAreaElement
          ) {
            return element.value;
          }
          return null;
        }),
      textContent: () =>
        related.evaluate(node =>
          (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
        ),
      isConnected: () => related.evaluate(node => node.isConnected),
      textChangesDuring: async action => {
        const element = await related.elementHandle();
        if (element == null) {
          throw new Error(
            `the related subject ${JSON.stringify(name)} is not in the document`,
          );
        }
        return observeTextChangesDuring(page, element, action);
      },
      computed: () => computedNode(cdp, related),
      visibleLabelText: async () => {
        const value = (await related.innerText()).trim();
        return value === '' ? null : value;
      },
      isFocused: () =>
        related.evaluate(
          element => element.ownerDocument.activeElement === element,
        ),
      containsFocus: () =>
        related.evaluate(element => {
          const active = element.ownerDocument.activeElement;
          return (
            active != null && (active === element || element.contains(active))
          );
        }),
      isModal: () => related.evaluate(element => element.matches(':modal')),
      canReceivePointer: () => canReceivePointer(related),
      focus: () => related.focus(),
    };
  };

  return {
    name: 'chromium',
    observes: CHROMIUM_OBSERVES,
    subject: async () => subject,
    related: async name => relatedSubject(name),
    click: async (_subject, options) => {
      // Without `force`, Playwright first satisfies itself that the control is
      // visible, stable, enabled, and actually receives pointer events — so an
      // ordinary click here also proves a pointer could reach the control.
      // `ignoreAvailability` skips that judgement, which is the only way to ask
      // a control the browser calls unavailable what it does when clicked
      // anyway.
      try {
        await pointerLocator.click({
          force: options?.ignoreAvailability === true,
          // Bounded, and short. A control a pointer cannot reach — one covered
          // by something else, or clipped to nothing — otherwise sits here
          // until the whole test times out, and a timeout says nothing about
          // WHY. This turns that into a legible failure the report can carry.
          timeout: POINTER_REACH_BUDGET_MS,
        });
      } catch (error) {
        if (isTimeout(error)) {
          throw new Error(
            `a pointer could not reach this control within ${POINTER_REACH_BUDGET_MS}ms: the browser never found it visible, stable, and able to receive a pointer event. Something is covering it, or it is clipped to nothing.`,
            {cause: error},
          );
        }
        throw error;
      }
    },
    abortedPress: async () => {
      const box = await pointerLocator.boundingBox();
      if (box == null) {
        throw new Error('the subject has no box to press on');
      }
      // A press that never lands on the control proves nothing about what
      // releasing it elsewhere does. Without this, a control a pointer cannot
      // reach reports a serene pass for pointer cancellation — the exact
      // vacuous green the evidence-layer rules exist to prevent.
      const reachable = await pointerLocator.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const at = element.ownerDocument.elementFromPoint(
          rect.x + rect.width / 2,
          rect.y + rect.height / 2,
        );
        return at != null && (at === element || element.contains(at));
      });
      if (!reachable) {
        throw new Error(
          'a pointer press cannot land on this control: something else is on top of it at its own centre, so there is no press here to abort',
        );
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
    typeText: async (_subject, text) => {
      await locator.focus();
      await page.keyboard.type(text);
    },
    clearText: async () => {
      await locator.focus();
      await page.keyboard.press('ControlOrMeta+A');
      await page.keyboard.press('Backspace');
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
