'use client';

import {useRef} from 'react';
import {
  XDSChatDictationButton,
  XDSChatComposer,
  XDSChatComposerInput,
  useXDSChatDictation,
} from '@xds/core/Chat';
import type {XDSChatComposerInputHandle} from '@xds/core/Chat';

export default function ChatDictationDictationInComposer() {
  const inputRef = useRef<XDSChatComposerInputHandle>(null);

  const dictation = useXDSChatDictation({
    inputRef,
    hasSounds: true,
  });

  return (
    <XDSChatComposer
      onSubmit={() => {}}
      placeholder="Type or tap the mic to dictate..."
      input={<XDSChatComposerInput ref={inputRef} />}
      sendActions={<XDSChatDictationButton dictation={dictation} />}
    />
  );
}
