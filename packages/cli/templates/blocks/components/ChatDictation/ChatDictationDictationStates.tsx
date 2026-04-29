'use client';

import {XDSChatDictationButton} from '@xds/core/Chat';
import type {UseSpeechRecognitionReturn} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const noop = () => {};

const idle: UseSpeechRecognitionReturn = {
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

const listening: UseSpeechRecognitionReturn = {
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

const speaking: UseSpeechRecognitionReturn = {
  volume: 0.12,
  rawBands: [0.15, 0.12, 0.08, 0.05, 0.02],
  bands: [0.15, 0.12, 0.08, 0.05, 0.02],
  isSupported: true,
  isListening: true,
  isSpeaking: true,
  interimTranscript: 'hello world',
  start: noop,
  stop: noop,
  abort: noop,
  toggle: noop,
};

export default function ChatDictationDictationStates() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Three states of a dictation interaction
      </XDSText>
      <XDSStack direction="horizontal" gap={6} hAlign="center">
        <XDSStack direction="vertical" gap={1} hAlign="center">
          <XDSChatDictationButton dictation={idle} />
          <XDSText type="supporting" color="secondary">
            Idle
          </XDSText>
        </XDSStack>
        <XDSStack direction="vertical" gap={1} hAlign="center">
          <XDSChatDictationButton dictation={listening} />
          <XDSText type="supporting" color="secondary">
            Listening
          </XDSText>
        </XDSStack>
        <XDSStack direction="vertical" gap={1} hAlign="center">
          <XDSChatDictationButton dictation={speaking} />
          <XDSText type="supporting" color="secondary">
            Speaking
          </XDSText>
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
