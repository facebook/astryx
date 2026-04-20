'use client';

import {XDSChatDictationButton, XDSChatComposer} from '@xds/core/Chat';

const idleDictation = {
  volume: 0,
  rawBands: [0, 0, 0, 0, 0],
  bands: [0, 0, 0, 0, 0],
  isSupported: true,
  isListening: false,
  isSpeaking: false,
  interimTranscript: '',
  start: () => {},
  stop: () => {},
  abort: () => {},
  toggle: () => {},
};

export default function ChatDictationShowcase() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      sendActions={<XDSChatDictationButton dictation={idleDictation} />}
    />
  );
}
