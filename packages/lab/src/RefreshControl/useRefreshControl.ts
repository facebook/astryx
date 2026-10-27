// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useRefreshControl.ts
 * @input onRefresh / isRefreshing / isDisabled; the touch presentation
 *   (core's utils/touchPresentation) and the scroll lock (core's internal
 *   gestures barrel); the touch layer (refreshTouchController.ts)
 * @output Exports useRefreshControl: refs for the pulled content and the
 *   indicator, `isRefreshing`, and `refresh()` for the non-gesture path
 * @position Behavior core of RefreshControl: the state (uncontrolled, or the
 *   controlled `isRefreshing` as the source), `onRefresh`, the announcement
 *   and the gate. Everything a finger drives is the touch layer,
 *   refreshTouchController.ts, imported here and nowhere else.
 *
 * A finger or a pen pulls, under any primary pointer (`spec:AST-094` FR43):
 * a drag at the top, with the same mapping, trigger, settle and drawing; a
 * pen pull clears the text selection its drag started. A mouse drag does
 * not pull: its text selection and native drag stay the browser's, as
 * `spec:AST-057` AR2 keeps a mouse off a row. A trackpad's two-finger scroll
 * toward the top pulls once the content is at its top, as a finger does; a
 * mouse wheel's notches do not. The top edge follows the touch presentation
 * (`useTouchPresentation`: a coarse primary pointer, one touch model on iOS
 * and Android alike): only there does the pull take the page's overscroll
 * near the top and replace the browser's own pull to refresh (Safari's and
 * Chrome's reload). Under a fine pointer a programmatic refresh only reports
 * busy and announces itself: no inset, no indicator.
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/RefreshControl/refreshTouchController.ts
 * - /packages/lab/src/RefreshControl/useRefreshControl.test.tsx
 * - /packages/lab/src/RefreshControl/RefreshControl.tsx
 * - /packages/lab/src/RefreshControl/RefreshControl.doc.mjs
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefCallback,
} from 'react';
import {
  isScrollLockActive,
  subscribeScrollLock,
} from '@astryxdesign/core/internal/touch';
import {useTouchPresentation} from '@astryxdesign/core/internal/touch';
import {useAnnounce} from '@astryxdesign/core/hooks';
import {useTranslator} from '@astryxdesign/core/i18n';
import {
  INITIAL_REFRESH_STATE,
  reduceRefresh,
  type RefreshEffect,
  type RefreshEvent,
  type RefreshState,
} from './refreshModel';
import {useRefreshTouchController} from './refreshTouchController';

export {
  REFRESH_REVEAL_VAR,
  REFRESH_SPIN_STEP_VAR,
  REFRESH_SPINNING_ATTRIBUTE,
} from './refreshIndicator';

export interface UseRefreshControlOptions {
  /**
   * Called when a pull triggers, or when `refresh()` runs. Return a promise to
   * keep the control refreshing until it settles (uncontrolled use).
   */
  onRefresh?: () => unknown;
  /**
   * Controlled refreshing state: `true` puts the control in the refreshing
   * state (as `beginRefreshing()`), `false` ends it (as `endRefreshing()`).
   * Omit it to let the promise `onRefresh` returns decide.
   */
  isRefreshing?: boolean;
  /** Turns the pull off. A refresh in progress keeps running. */
  isDisabled?: boolean;
}

export interface UseRefreshControlResult {
  /** Attach to the element that wraps the scrolled content (it is pulled). */
  contentRef: RefCallback<HTMLElement>;
  /**
   * Attach to the indicator: a band the refresh height tall, at the bottom
   * of an overflow-hidden box that rides on the content's top edge. The hook
   * moves the band against the content, so it stays pinned at the top of the
   * scroll view while the content is pulled, settles and ends (where
   * UIRefreshControl sits), and the content's edge covers it.
   */
  indicatorRef: RefCallback<HTMLElement>;
  /**
   * Attach to the indicator's title (optional): it fades out as the end
   * starts, over `refreshControl.exitMs` on UIKit's ease-in-out, as
   * UIRefreshControl's label does.
   */
  titleRef: RefCallback<HTMLElement>;
  /** Attach to the part of the indicator that spins (optional). */
  spinnerRef: RefCallback<HTMLElement>;
  /** Whether a refresh is in progress. */
  isRefreshing: boolean;
  /** Starts a refresh without a pull (the non-gesture path). */
  refresh: () => void;
}

export function useRefreshControl({
  onRefresh,
  isRefreshing: isRefreshingProp,
  isDisabled = false,
}: UseRefreshControlOptions = {}): UseRefreshControlResult {
  const t = useTranslator();
  const announce = useAnnounce();
  // The touch presentation: a coarse primary pointer, on every touch device.
  const {isTouch} = useTouchPresentation();
  const isTouchRef = useRef(isTouch);
  isTouchRef.current = isTouch;
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Whether a scroll lock holds the page, read during render (the lock is
  // an external store), so a lock held at mount stands the pull down from
  // the first render.
  const isLocked = useSyncExternalStore(
    subscribeScrollLock,
    isScrollLockActive,
    () => false,
  );
  // Controlled: a refresh the hook started waits one commit for the parent
  // to take it.
  const awaitingProp = useRef(false);
  const [controlledCheck, setControlledCheck] = useState(0);

  const model = useRef<RefreshState>(INITIAL_REFRESH_STATE);
  const refreshToken = useRef(0);
  const isControlled = isRefreshingProp !== undefined;
  const latest = useRef({onRefresh, isControlled, t, announce});
  useLayoutEffect(() => {
    latest.current = {onRefresh, isControlled, t, announce};
  });

  const dispatchRef = useRef<(event: RefreshEvent) => void>(() => {});
  const touch = useRefreshTouchController({
    isPullEnabled: !isDisabled && !isLocked,
    isEdgeClaimed: isTouch,
    model,
    dispatchRef,
  });

  // -- Effects of the state machine -----------------------------------------

  const callHandler = useCallback(() => {
    const token = ++refreshToken.current;
    const result = latest.current.onRefresh?.();
    if (latest.current.isControlled) {
      // The prop is the source: unless the parent takes this refresh by
      // setting `isRefreshing`, it ends on the next commit.
      awaitingProp.current = true;
      setControlledCheck(count => count + 1);
      return;
    }
    const settle = () => {
      if (token === refreshToken.current) {
        dispatchRef.current({type: 'end'});
      }
    };
    void Promise.resolve(result).then(settle, settle);
  }, []);

  const run = useCallback(
    (effect: RefreshEffect) => {
      const {t: translate, announce: say} = latest.current;
      switch (effect.type) {
        case 'trigger':
          setIsRefreshing(true);
          touch.trigger();
          say(translate('@astryx.refreshControl.refreshing'));
          callHandler();
          break;
        case 'begin': {
          setIsRefreshing(true);
          say(translate('@astryx.refreshControl.refreshing'));
          // Without a finger a refresh only reports busy: no inset, no
          // indicator.
          if (isTouchRef.current) {
            touch.begin();
          }
          if (effect.callHandler) {
            callHandler();
          }
          break;
        }
        case 'settle':
          touch.settle(effect.to);
          break;
        case 'end':
          setIsRefreshing(false);
          touch.end();
          break;
      }
    },
    [callHandler, touch],
  );

  const dispatch = useCallback(
    (event: RefreshEvent) => {
      const next = reduceRefresh(model.current, event);
      model.current = next.state;
      for (const effect of next.effects) {
        run(effect);
      }
    },
    [run],
  );
  dispatchRef.current = dispatch;

  // -- Programmatic control -------------------------------------------------

  // Syncs a controlled `isRefreshing` into the systems outside React: the
  // touch layer (the inset, the spin and the slide, on the compositor) and the
  // announcer (`useAnnounce`). The rendered value is the prop itself.
  useEffect(() => {
    if (isRefreshingProp === undefined) {
      return;
    }
    dispatch(
      isRefreshingProp ? {type: 'begin', source: 'program'} : {type: 'end'},
    );
  }, [dispatch, isRefreshingProp]);

  // A refresh the hook started (a pull or `refresh()`) under a controlled
  // `isRefreshing`: the parent took it if the prop is now true, otherwise it
  // ends (a parent that keeps false, or sets true then false in one handler).
  // The end goes to the touch layer, outside React: it slides the inset off.
  useEffect(() => {
    if (!awaitingProp.current) {
      return;
    }
    awaitingProp.current = false;
    if (isRefreshingProp === false) {
      dispatch({type: 'end'});
    }
  }, [controlledCheck, dispatch, isRefreshingProp]);

  const refresh = useCallback(() => {
    dispatch({type: 'begin', source: 'user'});
  }, [dispatch]);

  useEffect(
    () => () => {
      refreshToken.current++;
    },
    [],
  );

  return {
    contentRef: touch.contentRef,
    indicatorRef: touch.indicatorRef,
    spinnerRef: touch.spinnerRef,
    titleRef: touch.titleRef,
    // Controlled, the prop is the source from the first render.
    isRefreshing: isControlled ? Boolean(isRefreshingProp) : isRefreshing,
    refresh,
  };
}
