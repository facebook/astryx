'use client';

import {
  XDSChatDictationButton,
  XDSChatComposer,
} from '@xds/core/Chat';
import type {UseSpeechRecognitionReturn} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const noop = () => {};

const listeningDictation: UseSpeechRecognitionReturn = {
  volume: 0.05,
  rawBands: [0.08, 0.06, 0.04, 0.02, 0.01],
  bands: [0.08, 0.06, 0.04, 0.02, 0.01],
  isSupported: true,
  isListening: true,
  isSpeaking: false,
  interimTranscript: '',
  start: noop,
  stop: noop,
  abort: noop,
  toggle: noop,
};

export default function ChatDictationAsSendButton() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSText type="supporting" color="secondary">
        Dictation button replacing the send button
      </XDSText>
      <XDSChatComposer
        onSubmit={() => {}}
        placeholder="Tap the mic to start dictating..."
        sendButton={
          <XDSChatDictationButton dictation={listeningDictation} />
        }
      />
    </XDSStack>
  );
}
