'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSChatComposer} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';

const styles = stylex.create({
  root: {
    maxWidth: 450,
  },
});

export default function ChatSendButtonInComposer() {
  return (
    <XDSStack direction="vertical" width="100%" xstyle={styles.root}>
      <XDSChatComposer
        onSubmit={() => {}}
        value="Hello, how can you help?"
        onChange={() => {}}
      />
    </XDSStack>
  );
}
