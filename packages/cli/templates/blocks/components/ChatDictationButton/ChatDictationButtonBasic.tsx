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

export default function ChatDictationButtonBasic() {
  const inputRef = useRef<ChatComposerInputHandle>(null);

  const dictation = useChatDictation({
    inputRef,
    onResult: text => {
      console.log('Dictation result:', text);
    },
  });

  return (
    <ChatComposer
      onSubmit={value => console.log('Submit:', value)}
      input={<ChatComposerInput handleRef={inputRef} />}
      sendActions={<ChatDictationButton dictation={dictation} />}
    />
  );
}
