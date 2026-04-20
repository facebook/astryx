'use client';

import {XDSChatComposer} from '@xds/core/Chat';

export default function SimpleComposer() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      placeholder="Type a message..."
    />
  );
}
