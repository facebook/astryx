// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatDictationButton} from './ChatDictationButton';
import type {UseSpeechRecognitionReturn} from './useSpeechRecognition';

const dictation: UseSpeechRecognitionReturn = {
  isSupported: true,
  isListening: false,
  isSpeaking: false,
  volume: 0,
  bands: [0, 0, 0, 0, 0],
  rawBands: [0, 0, 0, 0, 0],
  interimTranscript: '',
  start: () => {},
  stop: () => {},
  abort: () => {},
  toggle: () => {},
};

describe('ChatDictationButton', () => {
  it('renders a dictation button', () => {
    render(
      <ChatDictationButton dictation={dictation} data-testid="dictation" />,
    );
    expect(screen.getByTestId('dictation')).toBeTruthy();
  });

  it('forwards rest props (data-*, aria-*, id) to the root element', () => {
    render(
      <ChatDictationButton
        dictation={dictation}
        data-testid="dictation"
        data-custom="x"
        id="dictate-1"
      />,
    );
    const root = screen.getByTestId('dictation');
    expect(root).toHaveAttribute('data-custom', 'x');
    expect(root).toHaveAttribute('id', 'dictate-1');
  });
});
