// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatDictationButton} from '@xds/core/Chat';
import type {UseSpeechRecognitionReturn} from '@xds/core/Chat';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

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
    <Stack direction="vertical" gap={4}>
      <Text type="supporting" color="secondary">
        Three states of a dictation interaction
      </Text>
      <Stack direction="horizontal" gap={6} hAlign="center">
        <Stack direction="vertical" gap={1} hAlign="center">
          <ChatDictationButton dictation={idle} />
          <Text type="supporting" color="secondary">
            Idle
          </Text>
        </Stack>
        <Stack direction="vertical" gap={1} hAlign="center">
          <ChatDictationButton dictation={listening} />
          <Text type="supporting" color="secondary">
            Listening
          </Text>
        </Stack>
        <Stack direction="vertical" gap={1} hAlign="center">
          <ChatDictationButton dictation={speaking} />
          <Text type="supporting" color="secondary">
            Speaking
          </Text>
        </Stack>
      </Stack>
    </Stack>
  );
}
