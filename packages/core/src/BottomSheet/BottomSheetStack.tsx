// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetStack.tsx
 * @input Uses React, react-dom flushSync, StyleX, theme tokens, core hooks (useFocusTrap, useScrollLock, useMergedRefs, useDevWarning), shared layer dismissal and depth, the shared focus-return helper, BottomSheetEdgeTint, BottomSheetStackContext
 * @output Exports BottomSheetStack and BottomSheetStackProps
 * @position Core host that stacks BottomSheet and BottomSheetSwitcher levels in one shared native dialog
 *
 * Every BottomSheet (`isOpen` / `onOpenChange`) and BottomSheetSwitcher
 * (`activeSheet` / `onActiveSheetChange`) rendered anywhere under the stack
 * is one level: through wrappers, DOM elements, Suspense, Activity, context
 * providers, portals, and mapped lists alike. The stack never reads its
 * children. Each level registers itself in a layout effect, with a hidden
 * in-place anchor and the id of the level whose content it is rendered in,
 * and reports whether it is open and presented, its purpose, label,
 * final-focus target, and a way to close it through its own callback.
 *
 * Order is tree order, derived from the DOM: sibling levels by their
 * anchors' document position, a level rendered inside another level's content
 * right above that level. The open set, top, bottom, every level's depth and
 * `inert` all follow from the registrations. Each level owns the box its
 * panel portals into; the stack places the boxes in a slot inside its dialog
 * in stack order on every commit, and a reorder that re-renders nothing is
 * caught by a MutationObserver and applied before the next paint.
 *
 * The stack owns one dialog, one scrim, one modal boundary, one scroll lock,
 * and one dismissal owner. Escape, a scrim tap, and a swipe close only the top
 * level, through that level's own controlled callback. There is no close-all
 * prop: callers close every level themselves, and a one-update close animates
 * every level out together. A stack rendered inside another stack merges into
 * the outer one with a development warning.
 *
 * Levels learn about the stack through BottomSheetStackContext, and join only
 * at the stack's layer depth: a Dialog, AlertDialog, or popover layer opened
 * inside a level pushes its content one layer deeper, so a sheet (or stack)
 * inside it is standalone above that layer. Without a stack the context is
 * null and every sheet behaves exactly as it does standalone.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.tsx
 * - /packages/core/src/BottomSheet/BottomSheetStackContext.ts
 * - /packages/core/src/BottomSheet/BottomSheetEdgeTint.tsx
 * - /packages/core/src/BottomSheet/BottomSheetStack.doc.mjs
 * - /packages/core/src/BottomSheet/BottomSheetStack.test.tsx
 * - /packages/core/src/BottomSheet/index.ts
 * - /apps/storybook/stories/BottomSheetStack.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/BottomSheet/BottomSheetStackShowcase.tsx
 */

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import {flushSync} from 'react-dom';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {useDevWarning, useScrollLock} from '../hooks';
import {useFocusTrap} from '../hooks/useFocusTrap';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {LayerDepthProvider} from '../Layer/LayerDepthContext';
import {useLayerDismissal} from '../Layer/useLayerDismissal';
import {composeEventHandlers, mergeProps} from '../utils';
import {focusForLastInput} from '../utils/focusReturn';
import {BottomSheetEdgeTint} from './BottomSheetEdgeTint';
import {
  BottomSheetStackHostContext,
  BottomSheetStackParentLevelContext,
  useBottomSheetStackContentDepth,
  useBottomSheetStackHost,
  type BottomSheetStackHostContextValue,
  type BottomSheetStackLevelRegistration,
  type BottomSheetStackLevelState,
  type BottomSheetStackLevelView,
} from './BottomSheetStackContext';

const styles = stylex.create({
  // The host shell matches a standalone sheet's dialog: a full-viewport,
  // transparent native dialog whose ::backdrop is the one scrim for every
  // level.
  dialog: {
    position: 'fixed',
    inset: 0,
    width: '100dvw',
    height: '100dvh',
    maxWidth: 'none',
    maxHeight: 'none',
    margin: 0,
    padding: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    overflow: 'visible',
    display: 'none',
    outline: 'none',
  },
  dialogOpen: {
    display: 'block',
  },
  dialogNonModal: {
    pointerEvents: 'none',
    zIndex: 1000,
    width: '100%',
    height: '100%',
  },
  scrim: {
    '::backdrop': {
      backgroundColor: colorVars['--color-overlay'],
      opacity: {
        default: 'var(--_sheet-scrim-opacity, 1)',
        '@starting-style': 0,
      },
      transitionProperty: 'opacity, display',
      transitionDuration: durationVars['--duration-medium'],
      transitionTimingFunction: easeVars['--ease-standard'],
      transitionBehavior: 'allow-discrete',
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0.01s',
      },
    },
  },
  // The dim leaves with the last level on a linear curve, as in Core.
  scrimClosing: {
    '::backdrop': {
      transitionTimingFunction: 'linear',
    },
  },
  // The slot holds one box per level, in stack order. The host never renders
  // React children into it: the boxes are level-owned nodes placed here
  // imperatively, so React and the host never fight over its children.
  slot: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  // One box per level: full size, pointer-transparent, its own stacking
  // context so a switcher level's internal panel order stays internal. Slot
  // order is paint order, so a closing level slides out above the levels it
  // covered.
  level: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    isolation: 'isolate',
  },
});

const levelClassName = stylex.props(styles.level).className ?? '';

interface LevelEntry extends BottomSheetStackLevelRegistration {
  state: BottomSheetStackLevelState | null;
}

type LevelStatus = 'top' | 'covered' | 'exiting' | 'closed';

function compareAnchors(a: Element, b: Element): number {
  if (a === b) {
    return 0;
  }
  if (!a.isConnected || !b.isConnected) {
    return a.isConnected ? -1 : b.isConnected ? 1 : 0;
  }
  const position = a.compareDocumentPosition(b);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return -1;
  }
  if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return 1;
  }
  return 0;
}

/**
 * Tree order as a pre-order walk: levels at the host's root sorted by their
 * anchors' document position, each followed by the levels rendered in its
 * content, sorted the same way. A level whose parent is not registered is
 * treated as a root level.
 */
function orderLevels(entries: ReadonlyMap<string, LevelEntry>): string[] {
  const byParent = new Map<string | null, LevelEntry[]>();
  for (const entry of entries.values()) {
    const parent =
      entry.parentId != null && entries.has(entry.parentId)
        ? entry.parentId
        : null;
    const siblings = byParent.get(parent) ?? [];
    siblings.push(entry);
    byParent.set(parent, siblings);
  }
  const out: string[] = [];
  const visit = (parent: string | null) => {
    const siblings = byParent.get(parent) ?? [];
    siblings.sort((a, b) => compareAnchors(a.anchor, b.anchor));
    for (const entry of siblings) {
      out.push(entry.id);
      visit(entry.id);
    }
  };
  visit(null);
  return out;
}

function isSameOrder(
  a: ReadonlyArray<string>,
  b: ReadonlyArray<string>,
): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

function isSameLevelState(
  a: BottomSheetStackLevelState | null,
  b: BottomSheetStackLevelState,
): boolean {
  return (
    a != null &&
    a.isOpen === b.isOpen &&
    a.isPresented === b.isPresented &&
    a.purpose === b.purpose &&
    a.label === b.label &&
    a.finalFocusRef === b.finalFocusRef &&
    a.dismiss === b.dismiss
  );
}

export interface BottomSheetStackProps extends BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the shared native dialog. */
  ref?: React.Ref<HTMLDialogElement>;

  /** Called when the shared native dialog receives a cancel event. */
  onCancel?: (event: SyntheticEvent<HTMLDialogElement>) => void;

  /**
   * Whether the stack opens its one shared dialog modally with a scrim.
   * Levels never set `hasScrim` themselves; one set on a level is ignored.
   * @default true
   */
  hasScrim?: boolean;

  /**
   * The subtree whose BottomSheets (`isOpen` / `onOpenChange`) and
   * BottomSheetSwitchers (`activeSheet` / `onActiveSheetChange`) are the
   * levels, wherever they are rendered in it. Levels stack in tree order.
   */
  children: ReactNode;
}

/**
 * Stacks bottom sheets. Every BottomSheet and BottomSheetSwitcher
 * rendered under the stack is one level, in tree order; the last open level
 * is the top and the only interactive one. Covered levels stay mounted,
 * inert, and receded. Escape, scrim tap, and swipe close the top level
 * through its own callback.
 *
 * @example
 * ```
 * <BottomSheetStack>
 *   <BottomSheet isOpen={isListOpen} onOpenChange={setListOpen} label="Orders">
 *     …
 *   </BottomSheet>
 *   <BottomSheet isOpen={isDetailOpen} onOpenChange={setDetailOpen} label="Order">
 *     …
 *   </BottomSheet>
 * </BottomSheetStack>
 * ```
 */
export function BottomSheetStack(props: BottomSheetStackProps) {
  // A stack at an outer stack's own layer depth merges into it. One inside a
  // Core layer opened from a level (a Dialog, say) is above that stack and
  // becomes a host of its own.
  const outerHost = useBottomSheetStackHost();
  if (outerHost != null) {
    return <NestedBottomSheetStack>{props.children}</NestedBottomSheetStack>;
  }
  return <BottomSheetStackHost {...props} />;
}

BottomSheetStack.displayName = 'BottomSheetStack';

/**
 * A stack inside another stack is a pass-through boundary: its sheets keep
 * registering with the outer host, at this stack's place in the tree, so one
 * dialog and one scrim stay in charge and nothing disappears. Its own props
 * have no effect.
 */
function NestedBottomSheetStack({children}: {children: ReactNode}) {
  useDevWarning(
    'BottomSheetStack',
    'is rendered inside another BottomSheetStack. Its sheets join the outer ' +
      'stack as levels, and its own `hasScrim`, `ref`, and `onCancel` are ' +
      'ignored; the outer stack owns the one dialog and scrim.',
  );
  return <>{children}</>;
}

function BottomSheetStackHost({
  hasScrim = true,
  children,
  ref,
  xstyle,
  className,
  style,
  onCancel,
  onClick,
  ...props
}: BottomSheetStackProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const childrenRegionRef = useRef<HTMLDivElement | null>(null);
  const dialogModeRef = useRef<'modal' | 'non-modal' | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  // The depth the children render at: one deeper than the host, which is
  // what the LayerDepthProvider below gives them. Levels compare it with
  // their own depth to decide whether they are this host's.
  const layerDepth = useBottomSheetStackContentDepth();
  // The shell stays displayed through its own close(): the native close runs
  // in a layout effect of the commit that ends presentation, and this latch
  // keeps `display: block` until that effect has run, so the backdrop's exit
  // transition starts from a displayed element rather than from `none`.
  const [isShellOpen, setIsShellOpen] = useState(false);

  // The registry is mutated only in layout effects (commit phase), so a
  // concurrent render never observes a half-applied change; `entries` and
  // `order` are its snapshots for render. Order is state of its own because
  // it depends on the DOM, not only on the registrations.
  const registryRef = useRef(new Map<string, LevelEntry>());
  const [entries, setEntries] = useState<ReadonlyMap<string, LevelEntry>>(
    () => new Map(),
  );
  const [order, setOrder] = useState<ReadonlyArray<string>>([]);
  const committedOrderRef = useRef(order);

  const attachBox = useCallback((box: HTMLElement) => {
    const slot = slotRef.current;
    if (slot != null && box.parentNode !== slot) {
      slot.appendChild(box);
    }
  }, []);

  const recompute = useCallback(() => {
    const next = orderLevels(registryRef.current);
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- order is derived from the committed DOM (anchor positions), so it can only be read in layout effects; the updater bails out when unchanged
    setOrder(current => (isSameOrder(current, next) ? current : next));
  }, []);

  const register = useCallback(
    (registration: BottomSheetStackLevelRegistration) => {
      const {id, box} = registration;
      const existing = registryRef.current.get(id);
      registryRef.current.set(id, {
        ...registration,
        state: existing?.state ?? null,
      });
      box.className = levelClassName;
      // The box joins the slot now (in registration order; this commit's
      // placement re-sorts it), so the level has a connected portal target
      // from its first placed render on.
      attachBox(box);
      setEntries(new Map(registryRef.current));
      recompute();
      return () => {
        if (registryRef.current.get(id)?.box === box) {
          registryRef.current.delete(id);
          box.remove();
          setEntries(new Map(registryRef.current));
          recompute();
        }
      };
    },
    [attachBox, recompute],
  );

  const report = useCallback(
    (id: string, state: BottomSheetStackLevelState) => {
      const entry = registryRef.current.get(id);
      if (entry == null || isSameLevelState(entry.state, state)) {
        return;
      }
      registryRef.current.set(id, {...entry, state});
      setEntries(new Map(registryRef.current));
    },
    [],
  );

  // Derived from the snapshots: the open set in stack order, the top, the
  // bottom of the open set, and presentation.
  const openIds = order.filter(id => entries.get(id)?.state?.isOpen === true);
  const topId = openIds.length === 0 ? null : openIds[openIds.length - 1];
  const bottomOpenId = openIds.length === 0 ? null : openIds[0];
  const presentedIds = order.filter(
    id => entries.get(id)?.state?.isPresented === true,
  );
  const isStackVisible = topId != null || presentedIds.length > 0;
  const isModal = hasScrim && isStackVisible;
  const topState = topId == null ? null : (entries.get(topId)?.state ?? null);
  const topPurpose = topState?.purpose ?? 'info';
  const allowsEscapeDismiss = topState != null && topPurpose !== 'required';
  const allowsLightDismiss = topState != null && topPurpose === 'info';

  const views = useMemo(() => {
    const map = new Map<string, BottomSheetStackLevelView>();
    order.forEach((id, index) => {
      if (!entries.has(id)) {
        return;
      }
      let depth = 0;
      for (let above = index + 1; above < order.length; above += 1) {
        if (entries.get(order[above])?.state?.isOpen === true) {
          depth += 1;
        }
      }
      map.set(id, {depth, isTop: id === topId});
    });
    return map;
  }, [entries, order, topId]);

  const setScrimOpacity = useCallback((opacity: number) => {
    dialogRef.current?.style.setProperty(
      '--_sheet-scrim-opacity',
      String(opacity),
    );
  }, []);
  // Only the committed top level drives the shared backdrop; a pointer still
  // captured by a level that just closed must not.
  const committedTopIdRef = useRef(topId);
  useLayoutEffect(() => {
    committedTopIdRef.current = topId;
    setScrimOpacity(topId == null ? 0 : 1);
  }, [setScrimOpacity, topId]);
  const forwardScrimOpacity = useCallback(
    (id: string, opacity: number) => {
      if (id === committedTopIdRef.current) {
        setScrimOpacity(opacity);
      }
    },
    [setScrimOpacity],
  );

  // Place the boxes in the slot in stack order and mark them. Imperative on
  // purpose: the boxes are level-owned nodes, and a level needs its box
  // placed and marked in the same synchronous pass that registered it, so
  // the first painted frame has the right order, depth, and inertness.
  const placeBoxes = useCallback(
    (
      placedOrder: ReadonlyArray<string>,
      placedEntries: ReadonlyMap<string, LevelEntry>,
      placedTopId: string | null,
      placedViews: ReadonlyMap<string, BottomSheetStackLevelView>,
    ) => {
      const slot = slotRef.current;
      if (slot == null) {
        return;
      }
      placedOrder.forEach((id, index) => {
        const entry = placedEntries.get(id);
        if (entry == null) {
          return;
        }
        const {box, kind} = entry;
        const isTop = id === placedTopId;
        const status: LevelStatus = isTop
          ? 'top'
          : entry.state?.isOpen === true
            ? 'covered'
            : entry.state?.isPresented === true
              ? 'exiting'
              : 'closed';
        box.setAttribute('data-bottom-sheet-stack-level', String(index));
        box.setAttribute('data-bottom-sheet-stack-level-kind', kind);
        box.setAttribute('data-bottom-sheet-stack-level-state', status);
        box.setAttribute(
          'data-bottom-sheet-stack-level-depth',
          String(placedViews.get(id)?.depth ?? 0),
        );
        box.style.zIndex = String(index + 1);
        if (isTop) {
          box.removeAttribute('inert');
          box.removeAttribute('aria-hidden');
        } else {
          box.setAttribute('inert', '');
          box.setAttribute('aria-hidden', 'true');
        }
        if (slot.children[index] !== box) {
          slot.insertBefore(box, slot.children[index] ?? null);
        }
      });
      // A box that is no longer registered leaves; one registered in this
      // commit but not yet in the placed order stays where registration
      // appended it until the synchronous follow-up places it.
      const registered = new Set<Element>();
      for (const entry of registryRef.current.values()) {
        registered.add(entry.box);
      }
      for (const child of Array.from(slot.children)) {
        if (!registered.has(child)) {
          child.remove();
        }
      }
    },
    [],
  );

  useLayoutEffect(() => {
    committedOrderRef.current = order;
    placeBoxes(order, entries, topId, views);
  });

  // Order follows the DOM, so every host commit re-derives it, and every
  // level touches the host on its own commits. A reorder of memoised
  // subtrees that re-renders neither runs no React code at all; the observer
  // catches that one and applies the new order before the next paint.
  useLayoutEffect(() => {
    recompute();
  });
  useLayoutEffect(() => {
    const region = childrenRegionRef.current;
    if (region == null || typeof MutationObserver === 'undefined') {
      return;
    }
    const observer = new MutationObserver(() => {
      const next = orderLevels(registryRef.current);
      if (isSameOrder(committedOrderRef.current, next)) {
        return;
      }
      // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- a memoised reorder runs no React code; the observer fires before paint and the new order must be committed before it
      flushSync(() => {
        setOrder(next);
      });
    });
    observer.observe(region, {childList: true, subtree: true});
    return () => observer.disconnect();
  }, []);

  const dismissOnEscape = useCallback(() => {
    if (allowsEscapeDismiss) {
      topState?.dismiss();
    }
  }, [allowsEscapeDismiss, topState]);
  const dismissOnLightInteraction = useCallback(() => {
    if (allowsLightDismiss) {
      topState?.dismiss();
    }
  }, [allowsLightDismiss, topState]);

  const {containerRef} = useFocusTrap<HTMLDialogElement>({
    isActive: isModal,
  });
  const {shouldDismissOnCloseRequest} = useLayerDismissal({
    isActive: isStackVisible,
    escapeBehavior: allowsEscapeDismiss ? 'close' : 'block',
    onDismiss: dismissOnEscape,
    getContainer: () => dialogRef.current,
    isPresent: () => dialogRef.current?.open ?? false,
  });
  useScrollLock(isModal);

  // Focus return when the whole stack closes: the bottom level of the last
  // open set decides (its `finalFocusRef` when it has one), else the element
  // that opened the first level.
  const closeFocusBottomIdRef = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (bottomOpenId != null) {
      closeFocusBottomIdRef.current = bottomOpenId;
    }
  }, [bottomOpenId]);

  // One shared shell for every level. A modal stack enters the native top
  // layer once; pushes and pops only change levels inside it. The last
  // presented level owns the exit timing, so isStackVisible drops only when
  // the dialog can close and focus can return. Focus returns here, in the
  // same synchronous pass as the close; the focus trap's own cleanup runs
  // afterwards and finds focus already placed, so it leaves it alone.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) {
      return;
    }

    if (isStackVisible) {
      const nextMode = hasScrim ? 'modal' : 'non-modal';
      if (dialog.open && dialogModeRef.current !== nextMode) {
        dialog.close();
      }
      if (!dialog.open) {
        if (hasScrim && triggerRef.current == null) {
          triggerRef.current = document.activeElement as HTMLElement | null;
        }
        if (hasScrim) {
          dialog.showModal();
        } else {
          dialog.show();
        }
      }
      dialogModeRef.current = nextMode;
      // Latches the shell's display until its own close() has run.
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- latches the native dialog's display state from the same layout effect that calls showModal()
      setIsShellOpen(true);
      return;
    }

    if (dialog.open) {
      dialog.close();
    }
    // Releases the display latch after close(), in the same synchronous pass.
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- releases the display latch from the same layout effect that calls close()
    setIsShellOpen(false);
    if (dialogModeRef.current === 'modal') {
      const bottomId = closeFocusBottomIdRef.current;
      const bottomFinalFocus =
        bottomId == null
          ? null
          : (registryRef.current.get(bottomId)?.state?.finalFocusRef?.current ??
            null);
      // Returned focus rings only after keyboard input, as a standalone
      // sheet's return does; a pointer close leaves no ring.
      const returnTarget = bottomFinalFocus ?? triggerRef.current;
      if (returnTarget != null) {
        focusForLastInput(returnTarget);
      }
    }
    closeFocusBottomIdRef.current = null;
    triggerRef.current = null;
    dialogModeRef.current = null;
  }, [hasScrim, isStackVisible]);

  const handleCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      // Always keep the controlled dialog open; answer the platform's close
      // request with the shared stack's topmost rule.
      event.preventDefault();
      if (shouldDismissOnCloseRequest()) {
        dismissOnEscape();
      }
    },
    [dismissOnEscape, shouldDismissOnCloseRequest],
  );
  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLDialogElement>) => {
      if (hasScrim && event.target === event.currentTarget) {
        dismissOnLightInteraction();
      }
    },
    [dismissOnLightInteraction, hasScrim],
  );

  const hostValue = useMemo<BottomSheetStackHostContextValue>(
    () => ({
      hasScrim,
      layerDepth,
      register,
      report,
      touch: recompute,
      onScrimOpacity: forwardScrimOpacity,
      views,
    }),
    [
      forwardScrimOpacity,
      hasScrim,
      layerDepth,
      recompute,
      register,
      report,
      views,
    ],
  );

  const activeLabel =
    topState?.label ??
    entries.get(presentedIds[presentedIds.length - 1] ?? '')?.state?.label;
  const ariaLabel =
    props['aria-label'] ??
    (props['aria-labelledby'] == null ? activeLabel : undefined);

  const mergedDialogRef = useMergedRefs(ref, dialogRef, containerRef);
  const dialogPresentationProps = mergeProps(
    stylex.props(
      styles.dialog,
      (isStackVisible || isShellOpen) && styles.dialogOpen,
      hasScrim && styles.scrim,
      hasScrim && isStackVisible && topId == null && styles.scrimClosing,
      !hasScrim && styles.dialogNonModal,
      xstyle,
    ),
    className,
    style,
  );

  // The slot is a leaf the host never renders React children into. The
  // children region holds the levels' anchors and whatever wrapper DOM the
  // subtree renders; it is hidden so a wrapper's own output (a Suspense
  // fallback, a padded div) never shows on the scrim. Portals and contexts
  // are unaffected by the hidden ancestor.
  return (
    <dialog
      {...props}
      {...dialogPresentationProps}
      ref={mergedDialogRef}
      aria-label={ariaLabel}
      aria-modal={isModal ? 'true' : undefined}
      data-bottom-sheet-stack=""
      onCancel={composeEventHandlers(onCancel, handleCancel)}
      onClick={composeEventHandlers(onClick, handleClick)}
      {...(topPurpose === 'required' && topState != null
        ? {role: 'alertdialog'}
        : undefined)}>
      <div
        {...stylex.props(styles.slot)}
        ref={slotRef}
        data-bottom-sheet-stack-levels=""
      />
      <div hidden ref={childrenRegionRef} data-bottom-sheet-stack-children="">
        <LayerDepthProvider>
          <BottomSheetStackHostContext value={hostValue}>
            <BottomSheetStackParentLevelContext value={null}>
              {children}
            </BottomSheetStackParentLevelContext>
          </BottomSheetStackHostContext>
        </LayerDepthProvider>
      </div>
      <BottomSheetEdgeTint />
    </dialog>
  );
}
