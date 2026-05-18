// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatDictationButton} from '@xds/core/Chat';
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
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Small
        </XDSText>
        <XDSStack direction="horizontal" gap={4} vAlign="center">
          <XDSChatDictationButton dictation={idleDictation} size="sm" />
          <XDSChatDictationButton dictation={listeningDictation} size="sm" />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Medium
        </XDSText>
        <XDSStack direction="horizontal" gap={4} vAlign="center">
          <XDSChatDictationButton dictation={idleDictation} size="md" />
          <XDSChatDictationButton dictation={listeningDictation} size="md" />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
