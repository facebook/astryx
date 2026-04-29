'use client';

import {XDSChatComposer, XDSChatComposerInput} from '@xds/core/Chat';

export default function ChatComposerInputDisabled() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      isDisabled
      input={
        <XDSChatComposerInput isDisabled placeholder="Input is disabled" />
      }
    />
  );
}
