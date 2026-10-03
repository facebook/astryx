// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Alert.a11y.renders.tsx
 * @input Uses Banner's public status, role, title, and dismissibility surfaces
 * @output One public-interface rendering for every Banner alert binding state
 * @position Shared jsdom and checked-in Storybook fixture layer
 */

import {useState, type ReactElement} from 'react';
import {Banner} from '../Banner';
import type {
  BannerAlertBindingState,
  BannerAlertStateId,
} from './Alert.a11y.states';
import {BANNER_ALERT_BINDING_STATES} from './Alert.a11y.states';

const transitionTestId = (name: string) => `alert-transition-${name}`;

function BannerAlertHarness({state}: {state: BannerAlertBindingState}) {
  if (state.facts.kind !== 'live-region') {
    throw new Error(
      `${state.id}: Banner alert facts must describe a live region`,
    );
  }
  const [message, setMessage] = useState(state.facts.initialMessage);
  return (
    <div>
      <span data-a11y-ready="true" hidden />
      <button data-a11y-relation="focus-anchor" type="button">
        Keep focus
      </button>
      <button
        data-testid={transitionTestId('replace')}
        type="button"
        onClick={() => setMessage(state.facts.replacement)}>
        Replace alert
      </button>
      <Banner
        status={state.status}
        role="alert"
        title={message}
        isDismissable={state.dismissible}
      />
    </div>
  );
}

export type BannerAlertStateRender = () => ReactElement;

export const BANNER_ALERT_STATE_RENDERS: Record<
  BannerAlertStateId,
  BannerAlertStateRender
> = Object.fromEntries(
  BANNER_ALERT_BINDING_STATES.map(state => [
    state.id,
    () => <BannerAlertHarness state={state} />,
  ]),
) as Record<BannerAlertStateId, BannerAlertStateRender>;

export {transitionTestId};
