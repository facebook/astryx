'use client';

import {
  XDSChatDictationButton,
  XDSChatComposer,
} from '@xds/core/Chat';
import type {UseSpeechRecognitionReturn} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

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
    <XDSStack
      direction="vertical"
      gap={3}
      style={{width: '100%', maxWidth: 450}}
    >
      <XDSText type="supporting" color="secondary">
        Dictation button in the sendActions slot
      </XDSText>
      <XDSChatComposer
        onSubmit={() => {}}
        placeholder="Type or tap the mic to dictate..."
        sendActions={<XDSChatDictationButton dictation={idleDictation} />}
      />
    </XDSStack>
  );
}
