'use client';

import {useRef} from 'react';
import {
  XDSChatDictationButton,
  XDSChatComposer,
  XDSChatComposerInput,
  useXDSChatDictation,
} from '@xds/core/Chat';
import type {XDSChatComposerInputHandle} from '@xds/core/Chat';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatDictationButtonShowcase() {
  const inputRef = useRef<XDSChatComposerInputHandle>(null);

  const dictation = useXDSChatDictation({
    inputRef,
    hasSounds: true,
    onResult: (text) => {
      console.log('Dictation result:', text);
    },
  });

  return (
    <XDSVStack gap={4}>
      <XDSText type="supporting" color="secondary">
        Click the microphone to start dictating. Speech is transcribed into the
        input.
      </XDSText>

      <XDSChatComposer
        onSubmit={(v) => console.log('Submit:', v)}
        input={<XDSChatComposerInput ref={inputRef} />}
        sendActions={<XDSChatDictationButton dictation={dictation} />}
      />

      {dictation.isListening && (
        <XDSHStack gap={2} vAlign="center">
          <XDSText type="supporting" color="secondary">
            {dictation.isSpeaking ? 'Speaking detected' : 'Listening...'}
          </XDSText>
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
        </XDSHStack>
      )}

      {!dictation.isSupported && (
        <XDSText type="supporting" color="active">
          SpeechRecognition is not supported in this browser.
        </XDSText>
      )}
    </XDSVStack>
  );
}
