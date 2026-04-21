'use client';

import {XDSChatComposer, XDSChatComposerInput} from '@xds/core/Chat';

export default function ChatComposerInputShowcase() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      input={
        <XDSChatComposerInput placeholder="Ask me anything about XDS..." />
      }
    />
  );
}
