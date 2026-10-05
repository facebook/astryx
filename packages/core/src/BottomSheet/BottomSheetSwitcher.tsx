// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetSwitcher.tsx
 * @input Uses React context, StyleX, theme tokens, shared layer dismissal, focus/scroll-lock hooks, BottomSheetSwitcherContext
 * @output Exports BottomSheetSwitcher and BottomSheetSwitcherProps
 * @position Core controller for mutually exclusive and stacked BottomSheet flows
 *
 * The switcher turns declaratively nested BottomSheets into one controlled
 * flow. The canonical value is `activeSheets`, an ordered bottom-to-top path
 * of sheet ids: `[]` is closed, one id is the released single-sheet flow, and
 * a longer path presents a drill-in stack where only the last id is
 * interactive while covered sheets stay mounted, inert, and receded. The
 * released singular `activeSheet` remains supported as a length ≤ 1
 * projection of the same list. Single-level replacement keeps the released
 * handoff: the new sheet enters above the previous sheet, a taller previous
 * sheet aligns down to a shorter entering sheet, and it fades only after both
 * motions complete. Ids that are empty, repeated, unregistered, or ambiguous
 * cut presentation to the longest valid prefix and warn in development.
 *
 * All child sheets render as panels inside one switcher-owned `<dialog>`. A
 * scrim flow calls showModal() once and keeps that native top-layer dialog open
 * across every handoff. A no-scrim flow calls show() on the same non-modal shell.
 * This keeps one modal boundary and one native ::backdrop without a portal.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/BottomSheetEdgeTint.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcherContext.ts
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.doc.mjs
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.spec.md
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.test.tsx
 * - /packages/core/src/BottomSheet/index.ts
 * - /apps/storybook/stories/BottomSheetSwitcher.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/BottomSheet/BottomSheetSwitcherShowcase.tsx
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import type {DialogPurpose} from '../Dialog';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {useDevWarning, useScrollLock} from '../hooks';
import {
  useFocusTrap,
  useFocusTrapEscapeCompatibilitySignal,
} from '../hooks/useFocusTrap';
import {LayerDepthProvider} from '../Layer/LayerDepthContext';
import {dispatchLayerEscapeKeyDown} from '../Layer/layerStack';
import {useLayerDismissal} from '../Layer/useLayerDismissal';
import {composeEventHandlers, mergeProps} from '../utils';
import {devWarn} from '../utils/devWarning';
import {BottomSheetEdgeTint} from './BottomSheetEdgeTint';
import {
  BottomSheetSwitcherContext,
  type BottomSheetSwitcherContextValue,
  type BottomSheetSwitcherPhase,
  type BottomSheetSwitcherTransitionEvent,
} from './BottomSheetSwitcherContext';

import {useMergedRefs} from '../hooks/useMergedRefs';
const styles = stylex.create({
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
  // show() leaves a no-scrim flow in the normal rendering tree. The shell must
  // pass pointer input through to the live page; each sheet panel opts back in.
  // width/height 100% avoids overflowing a transformed containing block, but
  // consumers of this non-modal mode must still avoid clipping ancestors.
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
  // The flow's dim leaves with its last panel. Same rule, same reasoning, as
  // a standalone sheet's -- see `scrimClosing` in BottomSheet.tsx. A handoff
  // between two sheets is not a close, and keeps the entrance curve.
  scrimClosing: {
    '::backdrop': {
      transitionTimingFunction: 'linear',
    },
  },
});

type RetainedSheetPhase = 'covered' | 'aligning' | 'fading' | 'exiting';

interface SheetTransitionState {
  enteringSheet: string | null;
  retainedSheet: string | null;
  retainedPhase: RetainedSheetPhase | null;
  alignmentOffset: number;
  isAlignmentComplete: boolean;
}

const IDLE_TRANSITION: SheetTransitionState = {
  enteringSheet: null,
  retainedSheet: null,
  retainedPhase: null,
  alignmentOffset: 0,
  isAlignmentComplete: false,
};

const ALIGNMENT_THRESHOLD_PX = 1;

const EMPTY_SHEET_PATH: ReadonlyArray<string> = [];

type SwitcherDismissReason = 'escape' | 'scrim' | 'swipe';

function sheetPathsEqual(
  first: ReadonlyArray<string>,
  second: ReadonlyArray<string>,
): boolean {
  return (
    first.length === second.length &&
    first.every((sheetId, index) => sheetId === second[index])
  );
}

function isPathPrefix(
  prefix: ReadonlyArray<string>,
  path: ReadonlyArray<string>,
): boolean {
  return prefix.every((sheetId, index) => sheetId === path[index]);
}

/**
 * Chooses the animated treatment for a presented-path change. Only the
 * single-suffix edits promise motion: a push enters above the newly covered
 * level, a pop exits the former top, a close from any depth exits the last
 * visible panel, and a single-level replacement keeps the released handoff.
 * Every other edit (multi-pop, branch replacement, reorder, deep link)
 * converges to the requested path without bespoke choreography.
 */
function transitionForSheetPathChange(
  previousSheets: ReadonlyArray<string>,
  nextSheets: ReadonlyArray<string>,
): SheetTransitionState {
  const previousTop = previousSheets[previousSheets.length - 1] ?? null;
  const nextTop = nextSheets[nextSheets.length - 1] ?? null;
  if (previousTop == null || previousTop === nextTop) {
    return IDLE_TRANSITION;
  }
  if (nextTop == null) {
    return {
      enteringSheet: null,
      retainedSheet: previousTop,
      retainedPhase: 'exiting',
      alignmentOffset: 0,
      isAlignmentComplete: false,
    };
  }
  if (
    nextSheets.length === previousSheets.length + 1 &&
    isPathPrefix(previousSheets, nextSheets)
  ) {
    // Push: the previous top stays in the path as a covered level, so no
    // retained transition state is needed for it.
    return {
      enteringSheet: nextTop,
      retainedSheet: null,
      retainedPhase: null,
      alignmentOffset: 0,
      isAlignmentComplete: false,
    };
  }
  if (
    previousSheets.length === nextSheets.length + 1 &&
    isPathPrefix(nextSheets, previousSheets)
  ) {
    // Pop: only the former top exits; the revealed level returns beneath it.
    return {
      enteringSheet: null,
      retainedSheet: previousTop,
      retainedPhase: 'exiting',
      alignmentOffset: 0,
      isAlignmentComplete: false,
    };
  }
  if (previousSheets.length === 1 && nextSheets.length === 1) {
    // Released single-level handoff choreography.
    return {
      enteringSheet: nextTop,
      retainedSheet: previousTop,
      retainedPhase: 'covered',
      alignmentOffset: 0,
      isAlignmentComplete: false,
    };
  }
  return IDLE_TRANSITION;
}

type SheetPathInvalidReason =
  'empty-id' | 'repeated-id' | 'unknown-id' | 'duplicate-registration';

interface SheetPathValidation {
  presentedSheets: ReadonlyArray<string>;
  invalidIndex: number;
  invalidReason: SheetPathInvalidReason | null;
}

/**
 * Cuts the requested path to the longest leading prefix whose ids are
 * non-empty, unique within the value, and resolve to exactly one mounted
 * participating sheet. Presentation stops before the first invalid id; the
 * controlled value itself is never rewritten.
 */
function validateSheetPath(
  requestedSheets: ReadonlyArray<string>,
  registrationCounts: ReadonlyMap<string, number>,
): SheetPathValidation {
  const seenSheetIds = new Set<string>();
  for (let index = 0; index < requestedSheets.length; index++) {
    const sheetId = requestedSheets[index] ?? '';
    let reason: SheetPathInvalidReason | null = null;
    if (sheetId.length === 0) {
      reason = 'empty-id';
    } else if (seenSheetIds.has(sheetId)) {
      reason = 'repeated-id';
    } else {
      const registrations = registrationCounts.get(sheetId) ?? 0;
      if (registrations === 0) {
        reason = 'unknown-id';
      } else if (registrations > 1) {
        reason = 'duplicate-registration';
      }
    }
    if (reason != null) {
      return {
        presentedSheets: requestedSheets.slice(0, index),
        invalidIndex: index,
        invalidReason: reason,
      };
    }
    seenSheetIds.add(sheetId);
  }
  return {
    presentedSheets: requestedSheets,
    invalidIndex: -1,
    invalidReason: null,
  };
}

const INVALID_PATH_MESSAGES: Record<SheetPathInvalidReason, string> = {
  'empty-id': 'is an empty id',
  'repeated-id': 'repeats an id used earlier in the path',
  'unknown-id': 'does not match a mounted BottomSheet sheetId',
  'duplicate-registration': 'matches more than one mounted BottomSheet',
};

function alignmentOffsetForElements(
  enteringElement: HTMLElement | undefined,
  retainedElement: HTMLElement | undefined,
): number {
  if (enteringElement == null || retainedElement == null) {
    return 0;
  }
  const enteringPositioner = enteringElement.parentElement;
  const enteringTop =
    enteringPositioner?.getBoundingClientRect().top ??
    enteringElement.getBoundingClientRect().top;
  return Math.max(0, enteringTop - retainedElement.getBoundingClientRect().top);
}

export interface BottomSheetSwitcherProps extends BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the shared native dialog. */
  ref?: React.Ref<HTMLDialogElement>;

  /** Called when the shared native dialog receives a cancel event. */
  onCancel?: (event: SyntheticEvent<HTMLDialogElement>) => void;

  /**
   * Ordered bottom-to-top path of open BottomSheet ids — the canonical
   * controlled value. `[]` closes the flow, one id presents a single sheet,
   * appending one id pushes a drill-in sheet above the current one, removing
   * the final id reveals the previous sheet, and replacing a suffix changes
   * branch. Only the last id is interactive; covered ids stay mounted, inert,
   * and visually receded. Ids must be non-empty, unique, and match mounted
   * BottomSheet `sheetId` values; presentation stops before the first invalid
   * id. Supply together with `onActiveSheetsChange` instead of the singular
   * `activeSheet` form.
   */
  activeSheets?: ReadonlyArray<string>;

  /**
   * Called with the next path when the top sheet requests an implicit
   * dismissal — Escape or platform close, modal-scrim activation, or a
   * completed swipe, as permitted by the top sheet's `purpose`. One dismissal
   * removes one visible level: `nextIds` is the presented path without its
   * final id, and `details` carries the initiating channel and the dismissed
   * sheet id. Close-all remains an explicit caller update to `[]`.
   */
  onActiveSheetsChange?: (
    nextIds: ReadonlyArray<string>,
    details: {
      reason: 'escape' | 'scrim' | 'swipe';
      dismissedSheetId: string;
    },
  ) => void;

  /**
   * ID of the interactive BottomSheet, or null when the flow should close.
   * The released singular form, equivalent to `activeSheets` of length ≤ 1
   * (`null` ⇔ `[]`). Prefer `activeSheets` for new flows; supplying both
   * forms warns in development and the list form wins.
   */
  activeSheet?: string | null;

  /**
   * Called with `null` when the active sheet requests dismissal — the
   * singular counterpart of `onActiveSheetsChange`, receiving
   * `nextIds.at(-1) ?? null` and no details.
   */
  onActiveSheetChange?: (sheetId: string | null) => void;

  /**
   * Whether to open the shared dialog modally with its native ::backdrop.
   * Disable for a viewport-anchored, non-modal flow over an interactive page.
   * @default true
   */
  hasScrim?: boolean;

  /**
   * Preferred focus destination after the path reaches `[]` and exit
   * completes. Use when routing may replace the element that opened the
   * flow. An absent or disconnected target falls back to the opener captured
   * when a modal flow opened; a non-modal close never steals focus that has
   * already moved outside the flow.
   */
  finalFocusRef?: React.RefObject<HTMLElement | null>;

  /** BottomSheets identified by unique `sheetId` values. */
  children: ReactNode;
}

/**
 * Coordinates a set of BottomSheets inside one shared native dialog. The
 * controlled `activeSheets` path opens, stacks, and closes sheets: only the
 * last id is interactive, covered sheets stay mounted and inert with a
 * receded treatment, and implicit dismissal pops one visible level. The
 * released singular `activeSheet` form remains a length ≤ 1 projection with
 * the shipped single-sheet behavior, including the enter-above handoff.
 *
 * @example
 * ```
 * const [activeSheets, setActiveSheets] = useState([]);
 *
 * <BottomSheetSwitcher
 *   activeSheets={activeSheets}
 *   onActiveSheetsChange={setActiveSheets}>
 *   <BottomSheet sheetId="issues" label="Issues">
 *     <Button
 *       label="Open issue"
 *       onClick={() => setActiveSheets(['issues', 'issue-details'])}
 *     />
 *   </BottomSheet>
 *   <BottomSheet sheetId="issue-details" label="Issue details">
 *     <Button
 *       label="Back"
 *       onClick={() => setActiveSheets(current => current.slice(0, -1))}
 *     />
 *   </BottomSheet>
 * </BottomSheetSwitcher>
 * ```
 */
export function BottomSheetSwitcher({
  activeSheets,
  onActiveSheetsChange,
  activeSheet,
  onActiveSheetChange,
  hasScrim = true,
  finalFocusRef,
  children,
  ref,
  xstyle,
  className,
  style,
  onCancel,
  onClick,
  onKeyDown,
  ...props
}: BottomSheetSwitcherProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const dialogModeRef = useRef<'modal' | 'non-modal' | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const sheetElementsRef = useRef(new Map<string, HTMLElement>());
  // Synchronous mirror of the registration state, so effects that run in the
  // same commit as a registration read the settled record.
  const sheetRegistrationCountsRef = useRef(new Map<string, number>());
  const [sheetLabels, setSheetLabels] = useState<ReadonlyMap<string, string>>(
    () => new Map(),
  );
  const [sheetPurposes, setSheetPurposes] = useState<
    ReadonlyMap<string, DialogPurpose>
  >(() => new Map());
  const [sheetRegistrationCounts, setSheetRegistrationCounts] = useState<
    ReadonlyMap<string, number>
  >(() => new Map());
  const [unmountedSheetIds, setUnmountedSheetIds] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const [transition, setTransition] =
    useState<SheetTransitionState>(IDLE_TRANSITION);

  const usesListForm =
    activeSheets !== undefined || onActiveSheetsChange !== undefined;

  useDevWarning(
    'BottomSheetSwitcher',
    'received both the list form (`activeSheets`/`onActiveSheetsChange`) ' +
      'and the singular form (`activeSheet`/`onActiveSheetChange`). Supply ' +
      'exactly one controlled pair; the list form wins.',
    usesListForm &&
      (activeSheet !== undefined || onActiveSheetChange !== undefined),
  );

  // The canonical internal value is the list. The released singular form is
  // its length ≤ 1 projection: null ⇔ [] and 'id' ⇔ ['id'].
  const requestedSheets = useMemo<ReadonlyArray<string>>(() => {
    if (activeSheets != null) {
      return activeSheets;
    }
    if (usesListForm || activeSheet == null) {
      return EMPTY_SHEET_PATH;
    }
    return [activeSheet];
  }, [activeSheet, activeSheets, usesListForm]);

  const {presentedSheets, invalidIndex, invalidReason} = useMemo(
    () => validateSheetPath(requestedSheets, sheetRegistrationCounts),
    [requestedSheets, sheetRegistrationCounts],
  );
  const topSheet = presentedSheets[presentedSheets.length - 1] ?? null;

  // One development warning per distinct invalid condition until it clears
  // or changes; the controlled value is never rewritten and no change
  // callback fires for normalization. The warning re-validates against the
  // synchronous registration record so a child that registers in the same
  // commit as the path update never reads as an invalid id.
  const invalidWarningKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const liveValidation = validateSheetPath(
      requestedSheets,
      sheetRegistrationCountsRef.current,
    );
    if (liveValidation.invalidReason == null) {
      invalidWarningKeyRef.current = null;
      return;
    }
    const invalidSheetId = requestedSheets[liveValidation.invalidIndex] ?? '';
    const warningKey =
      `${liveValidation.invalidIndex}:${liveValidation.invalidReason}:` +
      invalidSheetId;
    if (invalidWarningKeyRef.current === warningKey) {
      return;
    }
    invalidWarningKeyRef.current = warningKey;
    devWarn(
      'BottomSheetSwitcher',
      `activeSheets[${liveValidation.invalidIndex}] ` +
        `(${JSON.stringify(invalidSheetId)}) ` +
        `${INVALID_PATH_MESSAGES[liveValidation.invalidReason]}; presenting ` +
        'the longest valid prefix.',
    );
  }, [invalidIndex, invalidReason, requestedSheets]);

  const committedSheetsRef = useRef<ReadonlyArray<string>>(presentedSheets);

  const presentedSheetsChanged = !sheetPathsEqual(
    committedSheetsRef.current,
    presentedSheets,
  );
  const visibleTransition = presentedSheetsChanged
    ? transitionForSheetPathChange(committedSheetsRef.current, presentedSheets)
    : transition;
  const isFlowVisible =
    presentedSheets.length > 0 ||
    (visibleTransition.retainedSheet != null &&
      !unmountedSheetIds.has(visibleTransition.retainedSheet));
  const isModal = hasScrim && isFlowVisible;
  const topSheetPurpose =
    (topSheet == null ? null : sheetPurposes.get(topSheet)) ?? 'info';
  const allowsEscapeDismiss = topSheetPurpose !== 'required';
  const allowsLightDismiss = topSheetPurpose === 'info';
  // Stack layering and recede motion apply only while more than one level is
  // actually involved, so single-sheet (released singular) flows keep their
  // shipped positioner treatment untouched.
  const isStackedFlow =
    presentedSheets.length > 1 ||
    (presentedSheets.length === 1 &&
      visibleTransition.retainedPhase === 'exiting');

  useLayoutEffect(() => {
    const previousSheets = committedSheetsRef.current;
    if (sheetPathsEqual(previousSheets, presentedSheets)) {
      return;
    }
    committedSheetsRef.current = presentedSheets;
    const nextTransition = transitionForSheetPathChange(
      previousSheets,
      presentedSheets,
    );
    setTransition(
      nextTransition.retainedSheet != null &&
        !sheetElementsRef.current.has(nextTransition.retainedSheet)
        ? IDLE_TRANSITION
        : nextTransition,
    );
  }, [presentedSheets]);

  // Implicit dismissal is a one-level pop of the presented path (FR26): the
  // request drops the final presented id, and with it any invalid suffix.
  // The list form receives the next path plus details; the singular form
  // receives its projection and no details. Ownership stays with the caller:
  // the host never mutates its own copy of the path.
  const requestImplicitDismiss = useCallback(
    (reason: SwitcherDismissReason) => {
      if (topSheet == null) {
        return;
      }
      const nextSheets = presentedSheets.slice(0, -1);
      if (usesListForm) {
        onActiveSheetsChange?.(nextSheets, {
          reason,
          dismissedSheetId: topSheet,
        });
      } else {
        onActiveSheetChange?.(nextSheets[nextSheets.length - 1] ?? null);
      }
    },
    [
      onActiveSheetChange,
      onActiveSheetsChange,
      presentedSheets,
      topSheet,
      usesListForm,
    ],
  );

  const dismissOnEscape = useCallback(() => {
    if (allowsEscapeDismiss) {
      requestImplicitDismiss('escape');
    }
  }, [allowsEscapeDismiss, requestImplicitDismiss]);
  const dismissOnLightInteraction = useCallback(() => {
    if (allowsLightDismiss) {
      requestImplicitDismiss('scrim');
    }
  }, [allowsLightDismiss, requestImplicitDismiss]);
  // A swipe that completes after its sheet stopped being the top (covered,
  // removed, or superseded by a newer path) must not pop the newer level.
  const requestSwipeDismiss = useCallback(
    (sheetId: string) => {
      if (sheetId === topSheet) {
        requestImplicitDismiss('swipe');
      }
    },
    [requestImplicitDismiss, topSheet],
  );

  const {containerRef} = useFocusTrap<HTMLDialogElement>({
    isActive: isModal,
  });
  // Before the shared dismissal stack, this modal trap supplied `onEscape`, so
  // the released compatibility shim reported it as active. Keep that signal
  // without registering the switcher twice in the one shared stack.
  useFocusTrapEscapeCompatibilitySignal(isModal);
  const {shouldDismissOnCloseRequest} = useLayerDismissal({
    isActive: isFlowVisible,
    escapeBehavior: allowsEscapeDismiss ? 'close' : 'block',
    onDismiss: dismissOnEscape,
    getContainer: () => dialogRef.current,
    isPresent: () => dialogRef.current?.open ?? false,
  });
  useScrollLock(isModal);

  // Open one shared shell for the complete flow. Modal flows enter the native
  // top layer once; path changes only swap panels inside it. The final panel
  // owns the exit timing, so isFlowVisible becomes false only when it is safe
  // to close the dialog and restore focus. After exit, an eligible
  // finalFocusRef target wins over the captured opener (FR36); a non-modal
  // close never steals focus that already moved outside the flow.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) {
      return;
    }

    if (isFlowVisible) {
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
      return;
    }

    const previousActiveElement = document.activeElement;
    const hadFocusWithin =
      previousActiveElement != null && dialog.contains(previousActiveElement);
    if (dialog.open) {
      dialog.close();
    }
    const finalCandidate = finalFocusRef?.current;
    const eligibleFinalTarget =
      finalCandidate != null && finalCandidate.isConnected
        ? finalCandidate
        : null;
    if (dialogModeRef.current === 'modal') {
      (eligibleFinalTarget ?? triggerRef.current)?.focus();
    } else if (
      dialogModeRef.current === 'non-modal' &&
      eligibleFinalTarget != null &&
      (hadFocusWithin ||
        document.activeElement == null ||
        document.activeElement === document.body)
    ) {
      eligibleFinalTarget.focus();
    }
    triggerRef.current = null;
    dialogModeRef.current = null;
  }, [finalFocusRef, hasScrim, isFlowVisible]);

  const getSheetPhase = useCallback(
    (sheetId: string): BottomSheetSwitcherPhase => {
      const pathIndex = presentedSheets.lastIndexOf(sheetId);
      if (pathIndex >= 0) {
        if (pathIndex === presentedSheets.length - 1) {
          return sheetId === visibleTransition.enteringSheet
            ? 'entering'
            : 'active';
        }
        return 'covered';
      }
      if (sheetId === visibleTransition.retainedSheet) {
        return visibleTransition.retainedPhase ?? 'hidden';
      }
      return 'hidden';
    },
    [presentedSheets, visibleTransition],
  );

  const getSheetAlignmentOffset = useCallback(
    (sheetId: string) =>
      visibleTransition.retainedSheet === sheetId
        ? visibleTransition.alignmentOffset
        : 0,
    [visibleTransition],
  );

  const getSheetDepth = useCallback(
    (sheetId: string) => {
      const pathIndex = presentedSheets.lastIndexOf(sheetId);
      return pathIndex < 0 ? 0 : presentedSheets.length - 1 - pathIndex;
    },
    [presentedSheets],
  );

  const getSheetStackLayer = useCallback(
    (sheetId: string) => {
      if (sheetId === visibleTransition.retainedSheet) {
        return presentedSheets.length + 1;
      }
      const pathIndex = presentedSheets.lastIndexOf(sheetId);
      return pathIndex < 0 ? 0 : pathIndex + 1;
    },
    [presentedSheets, visibleTransition.retainedSheet],
  );

  const registerSheetPresence = useCallback((sheetId: string) => {
    const counts = sheetRegistrationCountsRef.current;
    counts.set(sheetId, (counts.get(sheetId) ?? 0) + 1);
    setSheetRegistrationCounts(new Map(counts));
    return () => {
      const registrations = counts.get(sheetId) ?? 0;
      if (registrations <= 1) {
        counts.delete(sheetId);
      } else {
        counts.set(sheetId, registrations - 1);
      }
      setSheetRegistrationCounts(new Map(counts));
    };
  }, []);

  const registerSheetElement = useCallback(
    (sheetId: string, element: HTMLElement | null) => {
      if (element == null) {
        sheetElementsRef.current.delete(sheetId);
        setUnmountedSheetIds(current => {
          if (current.has(sheetId)) {
            return current;
          }
          const next = new Set(current);
          next.add(sheetId);
          return next;
        });
        setTransition(current =>
          current.retainedSheet === sheetId ? IDLE_TRANSITION : current,
        );
      } else {
        sheetElementsRef.current.set(sheetId, element);
        setUnmountedSheetIds(current => {
          if (!current.has(sheetId)) {
            return current;
          }
          const next = new Set(current);
          next.delete(sheetId);
          return next;
        });
      }
    },
    [],
  );

  const registerSheetLabel = useCallback(
    (sheetId: string, label: string | null) => {
      setSheetLabels(current => {
        if (label == null) {
          if (!current.has(sheetId)) {
            return current;
          }
          const next = new Map(current);
          next.delete(sheetId);
          return next;
        }
        if (current.get(sheetId) === label) {
          return current;
        }
        const next = new Map(current);
        next.set(sheetId, label);
        return next;
      });
    },
    [],
  );

  const registerSheetPurpose = useCallback(
    (sheetId: string, purpose: DialogPurpose | null) => {
      setSheetPurposes(current => {
        if (purpose == null) {
          if (!current.has(sheetId)) {
            return current;
          }
          const next = new Map(current);
          next.delete(sheetId);
          return next;
        }
        if (current.get(sheetId) === purpose) {
          return current;
        }
        const next = new Map(current);
        next.set(sheetId, purpose);
        return next;
      });
    },
    [],
  );

  useLayoutEffect(() => {
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- clear a retained sheet after its panel unmounts
    setTransition(current =>
      current.retainedSheet != null &&
      unmountedSheetIds.has(current.retainedSheet)
        ? IDLE_TRANSITION
        : current,
    );
  }, [unmountedSheetIds]);

  const onSheetEnterStart = useCallback((sheetId: string) => {
    setTransition(current => {
      if (
        current.enteringSheet !== sheetId ||
        current.retainedSheet == null ||
        current.retainedPhase !== 'covered'
      ) {
        return current;
      }
      const alignmentOffset = alignmentOffsetForElements(
        sheetElementsRef.current.get(sheetId),
        sheetElementsRef.current.get(current.retainedSheet),
      );
      if (alignmentOffset <= ALIGNMENT_THRESHOLD_PX) {
        return current;
      }
      return {
        ...current,
        retainedPhase: 'aligning',
        alignmentOffset,
        isAlignmentComplete: false,
      };
    });
  }, []);

  const onSheetTransitionComplete = useCallback(
    ({sheetId, phase}: BottomSheetSwitcherTransitionEvent) => {
      setTransition(current => {
        if (phase === 'entering') {
          if (current.enteringSheet !== sheetId) {
            return current;
          }
          if (current.retainedSheet == null) {
            return IDLE_TRANSITION;
          }
          if (
            current.retainedPhase === 'aligning' &&
            !current.isAlignmentComplete
          ) {
            return {...current, enteringSheet: null};
          }
          return {
            ...current,
            enteringSheet: null,
            retainedPhase: 'fading',
          };
        }

        if (
          phase === 'aligning' &&
          current.retainedSheet === sheetId &&
          current.retainedPhase === 'aligning'
        ) {
          return current.enteringSheet == null
            ? {...current, retainedPhase: 'fading'}
            : {...current, isAlignmentComplete: true};
        }

        if (
          (phase === 'fading' || phase === 'exiting') &&
          current.retainedSheet === sheetId &&
          current.retainedPhase === phase
        ) {
          return IDLE_TRANSITION;
        }

        return current;
      });
    },
    [],
  );

  const setScrimOpacity = useCallback((opacity: number) => {
    dialogRef.current?.style.setProperty(
      '--_sheet-scrim-opacity',
      String(opacity),
    );
  }, []);
  const onSheetScrimOpacityChange = useCallback(
    (sheetId: string, opacity: number) => {
      // A pointer captured by the outgoing sheet can keep delivering gesture
      // events after a handoff. Only the committed path's top sheet owns the
      // shared backdrop, so stale gesture updates must not reach the dialog.
      const committedSheets = committedSheetsRef.current;
      if (sheetId !== committedSheets[committedSheets.length - 1]) {
        return;
      }
      setScrimOpacity(opacity);
    },
    [setScrimOpacity],
  );

  useLayoutEffect(() => {
    setScrimOpacity(topSheet == null ? 0 : 1);
  }, [setScrimOpacity, topSheet]);

  const contextValue = useMemo<BottomSheetSwitcherContextValue>(
    () => ({
      activeSheets: presentedSheets,
      topSheet,
      hasScrim,
      isStackedFlow,
      requestSwipeDismiss,
      getSheetPhase,
      getSheetAlignmentOffset,
      getSheetDepth,
      getSheetStackLayer,
      registerSheetPresence,
      registerSheetElement,
      registerSheetLabel,
      registerSheetPurpose,
      onSheetEnterStart,
      onSheetTransitionComplete,
      onSheetScrimOpacityChange,
    }),
    [
      getSheetAlignmentOffset,
      getSheetDepth,
      getSheetPhase,
      getSheetStackLayer,
      hasScrim,
      isStackedFlow,
      onSheetEnterStart,
      onSheetScrimOpacityChange,
      onSheetTransitionComplete,
      presentedSheets,
      registerSheetElement,
      registerSheetLabel,
      registerSheetPresence,
      registerSheetPurpose,
      requestSwipeDismiss,
      topSheet,
    ],
  );

  const activeLabel =
    (topSheet == null ? null : sheetLabels.get(topSheet)) ??
    (visibleTransition.retainedSheet == null
      ? undefined
      : sheetLabels.get(visibleTransition.retainedSheet));

  const handleCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      if (shouldDismissOnCloseRequest()) {
        dismissOnEscape();
      }
    },
    [dismissOnEscape, shouldDismissOnCloseRequest],
  );
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDialogElement>) => {
      // A consumer may stop propagation without claiming Escape. Route that
      // unprevented press now so the shared stack still chooses the top layer;
      // its preventDefault marker makes the document listener a no-op if the
      // event does continue bubbling.
      dispatchLayerEscapeKeyDown(event.nativeEvent);
    },
    [],
  );
  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLDialogElement>) => {
      if (hasScrim && event.target === event.currentTarget) {
        dismissOnLightInteraction();
      }
    },
    [dismissOnLightInteraction, hasScrim],
  );

  const dialogStyleProps = stylex.props(
    styles.dialog,
    isFlowVisible && styles.dialogOpen,
    hasScrim && styles.scrim,
    hasScrim && isFlowVisible && topSheet == null && styles.scrimClosing,
    !hasScrim && styles.dialogNonModal,
    xstyle,
  );
  const dialogPresentationProps = mergeProps(
    dialogStyleProps,
    className,
    style,
  );
  const ariaLabel =
    props['aria-label'] ??
    (props['aria-labelledby'] == null ? activeLabel : undefined);

  return (
    <BottomSheetSwitcherContext value={contextValue}>
      <dialog
        {...props}
        {...dialogPresentationProps}
        ref={useMergedRefs(ref, dialogRef, containerRef)}
        aria-label={ariaLabel}
        aria-modal={isModal ? 'true' : undefined}
        onCancel={composeEventHandlers(onCancel, handleCancel)}
        onClick={composeEventHandlers(onClick, handleClick)}
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
        {...(topSheetPurpose === 'required'
          ? {role: 'alertdialog'}
          : undefined)}>
        <LayerDepthProvider>{children}</LayerDepthProvider>
        <BottomSheetEdgeTint />
      </dialog>
    </BottomSheetSwitcherContext>
  );
}

BottomSheetSwitcher.displayName = 'BottomSheetSwitcher';
