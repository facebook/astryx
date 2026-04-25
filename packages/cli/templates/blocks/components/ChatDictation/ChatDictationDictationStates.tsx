'use client';

import {XDSChatDictationButton} from '@xds/core/Chat';
import type {UseSpeechRecognitionReturn} from '@xds/core/Chat';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const noop = () => {};

const base: UseSpeechRecognitionReturn = {
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

const idle: UseSpeechRecognitionReturn = {...base};

const listening: UseSpeechRecognitionReturn = {
  ...base,
  volume: 0.05,
  rawBands: [0.08, 0.06, 0.04, 0.02, 0.01],
  bands: [0.08, 0.06, 0.04, 0.02, 0.01],
  isListening: true,
};

const speaking: UseSpeechRecognitionReturn = {
  ...base,
  volume: 0.12,
  rawBands: [0.15, 0.12, 0.08, 0.05, 0.02],
  bands: [0.15, 0.12, 0.08, 0.05, 0.02],
  isListening: true,
  isSpeaking: true,
  interimTranscript: 'hello world',
};

export default function ChatDictationDictationStates() {
  return (
    <XDSHStack gap={6} vAlign="center">
      <XDSVStack gap={2} hAlign="center">
        <XDSChatDictationButton dictation={idle} />
        <XDSText type="supporting" color="secondary">Idle</XDSText>
      </XDSVStack>
      <XDSVStack gap={2} hAlign="center">
        <XDSChatDictationButton dictation={listening} />
        <XDSText type="supporting" color="secondary">Listening</XDSText>
      </XDSVStack>
      <XDSVStack gap={2} hAlign="center">
        <XDSChatDictationButton dictation={speaking} />
        <XDSText type="supporting" color="secondary">Speaking</XDSText>
      </XDSVStack>
    </XDSHStack>
  );
}
