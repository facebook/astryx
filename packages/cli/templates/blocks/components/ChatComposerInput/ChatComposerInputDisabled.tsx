'use client';

import {XDSChatComposer, XDSChatComposerInput} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';

export default function ChatComposerInputDisabled() {
  return (
    <XDSStack direction="vertical" style={{width: '100%', maxWidth: 450}}>
      <XDSChatComposer
        onSubmit={() => {}}
        isDisabled
        input={
          <XDSChatComposerInput isDisabled placeholder="Input is disabled" />
        }
      />
    </XDSStack>
  );
}
