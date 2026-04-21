'use client';

import {
  XDSChatDictationButton,
  XDSChatComposer,
} from '@xds/core/Chat';
import type {UseSpeechRecognitionReturn} from '@xds/core/Chat';

const noop = () => {};

const idleDictation: UseSpeechRecognitionReturn = {
  volume: 0,
  rawBands: [0, 0, 0, 0, 0],
  bands: [0, 0, 0, 0, 0],
  isSupported: true,
  isListening: false,
  isSpeaking: false,
  interimTranscript: '',
  start: noop,
  stop: noop,
  abort: noop,
  toggle: noop,
};

export default function ChatDictationDictationInComposer() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      placeholder="Type or tap the mic to dictate..."
      sendActions={<XDSChatDictationButton dictation={idleDictation} />}
    />
  );
}
