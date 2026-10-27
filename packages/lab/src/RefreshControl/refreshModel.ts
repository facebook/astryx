// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file refreshModel.ts
 * @input Pull events from the refresh pull recognizer, programmatic begin and
 *   end requests
 * @output Exports reduceRefresh (UIRefreshControl's state machine as a pure
 *   reducer that returns the effects to run), the initial state and types
 * @position Pure logic for useRefreshControl; no DOM, no React
 *
 * The rules, as UIKit runs them (measured where marked in
 * motion/uikit/refresh.ts):
 * - a pull triggers once, with the finger down, when its overscroll reaches
 *   the trigger distance; only finger-driven overscroll triggers (a momentum
 *   overshoot never does); a pull while already refreshing triggers again
 *   (UIKit fires `valueChanged` again) once it reaches the trigger distance
 *   beyond the refreshing inset;
 * - releasing settles onto the refreshing inset while refreshing, back to the
 *   top otherwise; a cancelled pull settles the same way;
 * - a programmatic begin puts the control in the refreshing state; it calls
 *   the refresh handler only when it stands for the user's request (the
 *   non-gesture path), not when the app reports a refresh it started;
 * - ending a refresh that is not running does nothing.
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/RefreshControl/refreshModel.test.ts
 */

import {REFRESH_HEIGHT} from './refreshPull';

export interface RefreshState {
  /** A refresh is in progress (`UIRefreshControl.isRefreshing`). */
  readonly isRefreshing: boolean;
  /** A finger is pulling the content. */
  readonly isPulling: boolean;
  /** The current pull has triggered (its mapping turns one to one). */
  readonly hasTriggered: boolean;
}

export type RefreshEvent =
  | {readonly type: 'pullStart'}
  | {
      readonly type: 'pullMove';
      readonly overscroll: number;
      /** The trigger distance for this scroll owner. */
      readonly trigger: number;
    }
  | {readonly type: 'pullEnd'}
  | {readonly type: 'pullCancel'}
  | {readonly type: 'begin'; readonly source: 'user' | 'program'}
  | {readonly type: 'end'};

export type RefreshEffect =
  /** The pull reached the trigger: spin, announce, call the handler. */
  | {readonly type: 'trigger'}
  /** A refresh started without a pull; `callHandler` for the user's request. */
  | {readonly type: 'begin'; readonly callHandler: boolean}
  /** The finger let go: settle onto the inset or back to the top. */
  | {readonly type: 'settle'; readonly to: 'inset' | 'top'}
  /** The refresh ended: remove the inset and hide the indicator. */
  | {readonly type: 'end'};

export const INITIAL_REFRESH_STATE: RefreshState = {
  isRefreshing: false,
  isPulling: false,
  hasTriggered: false,
};

export function reduceRefresh(
  state: RefreshState,
  event: RefreshEvent,
): {state: RefreshState; effects: ReadonlyArray<RefreshEffect>} {
  switch (event.type) {
    case 'pullStart':
      return {
        state: {...state, isPulling: true, hasTriggered: false},
        effects: [],
      };
    case 'pullMove': {
      // GUESS (M-RC3): a pull while refreshing counts from the inset.
      const reach = state.isRefreshing
        ? event.overscroll - REFRESH_HEIGHT
        : event.overscroll;
      if (!state.isPulling || state.hasTriggered || reach < event.trigger) {
        return {state, effects: []};
      }
      return {
        state: {...state, isRefreshing: true, hasTriggered: true},
        effects: [{type: 'trigger'}],
      };
    }
    case 'pullEnd':
    case 'pullCancel':
      if (!state.isPulling) {
        return {state, effects: []};
      }
      return {
        state: {...state, isPulling: false},
        effects: [{type: 'settle', to: state.isRefreshing ? 'inset' : 'top'}],
      };
    case 'begin':
      if (state.isRefreshing) {
        return {state, effects: []};
      }
      return {
        state: {...state, isRefreshing: true},
        effects: [{type: 'begin', callHandler: event.source === 'user'}],
      };
    case 'end':
      if (!state.isRefreshing) {
        return {state, effects: []};
      }
      return {
        state: {...state, isRefreshing: false},
        effects: [{type: 'end'}],
      };
  }
}
