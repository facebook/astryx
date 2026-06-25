// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useRef} from 'react';
import {
  ChatDictationButton,
  ChatComposer,
  ChatComposerInput,
  useChatDictation,
} from '@astryxdesign/core/Chat';
import type {ChatComposerInputHandle} from '@astryxdesign/core/Chat';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function ChatDictationButtonShowcase() {
  const inputRef = useRef<ChatComposerInputHandle>(null);

  const dictation = useChatDictation({
    inputRef,
    hasSounds: true,
    onResult: (text) => {
      console.log('Dictation result:', text);
    },
  });

  return (
    <VStack gap={4}>
      <Text type="supporting" color="secondary">
        Click the microphone to start dictating. Speech is transcribed into the
        input.
      </Text>
      <ChatComposer
        onSubmit={(v) => console.log('Submit:', v)}
        input={<ChatComposerInput handleRef={inputRef} />}
        sendActions={<ChatDictationButton dictation={dictation} />}
      />
      {dictation.isListening && (
        <HStack gap={2} vAlign="center">
          <Text type="supporting" color="secondary">
            {dictation.isSpeaking ? 'Speaking detected' : 'Listening...'}
          </Text>
          <div
            style={{
              width: 80,
              height: 6,
              backgroundColor: 'var(--color-surface-secondary)',
              borderRadius: 3,
              overflow: 'hidden',
            }}>
            <div
              style={{
                height: '100%',
                backgroundColor: dictation.isSpeaking
                  ? 'var(--color-accent)'
                  : 'var(--color-text-secondary)',
                borderRadius: 3,
                transition: 'width 0.08s ease-out',
                width: `${Math.min(dictation.volume * 200, 100)}%`,
              }}
            />
          </div>
        </HStack>
      )}
      {!dictation.isSupported && (
        <Text type="supporting" color="active">
          SpeechRecognition is not supported in this browser.
        </Text>
      )}
    </VStack>
  );
}
