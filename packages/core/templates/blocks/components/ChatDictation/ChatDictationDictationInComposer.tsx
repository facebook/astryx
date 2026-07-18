// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatDictationButton,
  ChatComposer,
} from '@astryxdesign/core/Chat';
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

export default function ChatDictationDictationInComposer() {
  return (
    <Stack
      direction="vertical"
      gap={3}
      style={{width: '100%', maxWidth: 450}}
    >
      <Text type="supporting" color="secondary">
        Dictation button in the sendActions slot
      </Text>
      <ChatComposer
        onSubmit={() => {}}
        placeholder="Type or tap the mic to dictate..."
        sendActions={<ChatDictationButton dictation={idleDictation} />}
      />
    </Stack>
  );
}
