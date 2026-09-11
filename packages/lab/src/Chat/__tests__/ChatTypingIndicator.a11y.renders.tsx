// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/** Shared jsdom and Storybook renderings for ChatTypingIndicator status states. */

import {useState, type ReactElement} from 'react';
import {ChatTypingIndicator} from '../ChatTypingIndicator';
import type {ChatTypingStatusStateId} from './ChatTypingIndicator.a11y.states';

const transitionTestId = (name: string) => `status-transition-${name}`;

function TransitionButton({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      data-testid={transitionTestId(name)}
      type="button"
      onClick={onClick}>
      {name}
    </button>
  );
}

function TypingHarness({startsNamed}: {startsNamed: boolean}) {
  const initial = startsNamed ? ['Ana'] : [];
  const [names, setNames] = useState<string[]>(initial);
  return (
    <div>
      <span data-a11y-ready="true" hidden />
      <button data-a11y-relation="focus-anchor" type="button">
        Keep focus
      </button>
      <TransitionButton name="show" onClick={() => setNames(['Ana'])} />
      <TransitionButton
        name="replace"
        onClick={() => setNames(['Ana', 'Ben'])}
      />
      <TransitionButton name="clear" onClick={() => setNames([])} />
      <ChatTypingIndicator names={names} />
    </div>
  );
}

export type ChatTypingStatusStateRender = () => ReactElement;

export const CHAT_TYPING_STATUS_STATE_RENDERS: Record<
  ChatTypingStatusStateId,
  ChatTypingStatusStateRender
> = {
  'chat-typing-empty-to-message': () => <TypingHarness startsNamed={false} />,
  'chat-typing-name-mounted': () => <TypingHarness startsNamed />,
};

export {transitionTestId};
