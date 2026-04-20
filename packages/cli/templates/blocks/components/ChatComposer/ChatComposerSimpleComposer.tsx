'use client';

import {XDSChatComposer} from '@xds/core/Chat';

export default function ChatComposerSimpleComposer() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      placeholder="Type a message..."
    />
  );
}
