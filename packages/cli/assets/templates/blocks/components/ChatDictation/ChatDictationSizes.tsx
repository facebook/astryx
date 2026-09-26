// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatDictationButton} from '@astryxdesign/core/Chat';
import type {UseSpeechRecognitionReturn} from '@astryxdesign/core/Chat';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

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

export default function ChatDictationSizes() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Small
        </Text>
        <Stack direction="horizontal" gap={4} vAlign="center">
          <ChatDictationButton dictation={idleDictation} size="sm" />
          <ChatDictationButton dictation={listeningDictation} size="sm" />
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Medium
        </Text>
        <Stack direction="horizontal" gap={4} vAlign="center">
          <ChatDictationButton dictation={idleDictation} size="md" />
          <ChatDictationButton dictation={listeningDictation} size="md" />
        </Stack>
      </Stack>
    </Stack>
  );
}
