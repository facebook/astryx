'use client';

import {useRef} from 'react';
import {
  XDSChatDictationButton,
  XDSChatComposer,
  XDSChatComposerInput,
  useXDSChatDictation,
} from '@xds/core/Chat';
import type {XDSChatComposerInputHandle} from '@xds/core/Chat';

export default function ChatDictationShowcase() {
  const inputRef = useRef<XDSChatComposerInputHandle>(null);

  const dictation = useXDSChatDictation({
    inputRef,
    hasSounds: true,
    onResult: (text) => {
      console.log('Dictation result:', text);
    },
  });

  return (
    <XDSChatComposer
      onSubmit={(v) => console.log('Submit:', v)}
      input={<XDSChatComposerInput ref={inputRef} />}
      sendActions={<XDSChatDictationButton dictation={dictation} />}
    />
  );
}
