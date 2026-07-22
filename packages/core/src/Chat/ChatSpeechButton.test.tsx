// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ChatSpeechButton} from './ChatSpeechButton';
import type {UseChatSpeechReturn} from './useChatSpeech';

function makeSpeech(
  overrides: Partial<UseChatSpeechReturn> = {},
): UseChatSpeechReturn {
  return {
    isSupported: true,
    isSpeaking: false,
    isPaused: false,
    voices: [],
    speak: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    ...overrides,
  };
}

describe('ChatSpeechButton', () => {
  it('renders a speech button', () => {
    render(
      <ChatSpeechButton
        speech={makeSpeech()}
        text="hello"
        data-testid="speech"
      />,
    );
    expect(screen.getByTestId('speech')).toBeTruthy();
  });

  it('forwards rest props (data-*, aria-*, id) to the root element', () => {
    render(
      <ChatSpeechButton
        speech={makeSpeech()}
        text="hello"
        data-testid="speech"
        data-custom="x"
        id="speak-1"
      />,
    );
    const root = screen.getByTestId('speech');
    expect(root).toHaveAttribute('data-custom', 'x');
    expect(root).toHaveAttribute('id', 'speak-1');
  });

  it('renders nothing when unsupported (default)', () => {
    const {container} = render(
      <ChatSpeechButton speech={makeSpeech({isSupported: false})} text="hi" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when unsupported and isHiddenWhenUnsupported is false', () => {
    render(
      <ChatSpeechButton
        speech={makeSpeech({isSupported: false})}
        text="hi"
        isHiddenWhenUnsupported={false}
        data-testid="speech"
      />,
    );
    expect(screen.getByTestId('speech')).toBeTruthy();
  });

  it('calls speak with the text when idle and clicked', () => {
    const speech = makeSpeech();
    render(<ChatSpeechButton speech={speech} text="read me" />);

    fireEvent.click(screen.getByRole('button'));
    expect(speech.speak).toHaveBeenCalledWith('read me');
    expect(speech.stop).not.toHaveBeenCalled();
  });

  it('calls stop when speaking and clicked', () => {
    const speech = makeSpeech({isSpeaking: true});
    render(<ChatSpeechButton speech={speech} text="read me" />);

    fireEvent.click(screen.getByRole('button'));
    expect(speech.stop).toHaveBeenCalledOnce();
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it('exposes aria-pressed reflecting speaking state', () => {
    const {rerender} = render(
      <ChatSpeechButton speech={makeSpeech()} text="hi" />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <ChatSpeechButton speech={makeSpeech({isSpeaking: true})} text="hi" />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});
